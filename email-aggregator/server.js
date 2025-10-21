import express from "express";
import dotenv from "dotenv";
import imaps from "imap-simple";
import bodyParser from "body-parser";
import axios from "axios";
import { Server } from "socket.io";
import http from "http";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Temporary in-memory email store
let emails = [];

// ---------- AI Categorization ----------
async function categorizeEmail(text) {
  try {
    const prompt = `
      Categorize this email into one of these categories:
      Interested, Meeting Booked, Not Interested, Spam, Out of Office.
      Email: ${text}
    `;
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    return res.choices[0].message.content.trim();
  } catch (e) {
    console.error("AI Error:", e.message);
    return "Uncategorized";
  }
}

// ---------- Slack Notification ----------
async function sendSlackNotification(subject, from) {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `📧 *Interested Email Received!*\nFrom: ${from}\nSubject: ${subject}`,
    });
  } catch (e) {
    console.error("Slack error:", e.message);
  }
}

// ---------- Webhook ----------
async function triggerWebhook(email) {
  try {
    await axios.post("https://webhook.site/your-webhook-id", email);
  } catch (e) {
    console.error("Webhook error:", e.message);
  }
}

// ---------- IMAP ----------
const imapConfig = {
  imap: {
    user: process.env.IMAP1_USER,
    password: process.env.IMAP1_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 3000,
  },
};

async function startIMAP() {
  try {
    const connection = await imaps.connect(imapConfig);
    await connection.openBox("INBOX");
    console.log("✅ Connected to Gmail IMAP");

    const searchCriteria = ["ALL"];
    const fetchOptions = { bodies: ["HEADER", "TEXT"], markSeen: false };
    const results = await connection.search(searchCriteria, fetchOptions);

    for (const res of results) {
      const header = res.parts.find((p) => p.which === "HEADER");
      const text = res.parts.find((p) => p.which === "TEXT");
      const subject = header.body.subject?.[0] || "(No Subject)";
      const from = header.body.from?.[0] || "(Unknown)";
      const body = text?.body || "";

      const category = await categorizeEmail(body);

      const email = { subject, from, body, category };
      emails.push(email);

      io.emit("new-email", email);

      if (category === "Interested") {
        await sendSlackNotification(subject, from);
        await triggerWebhook(email);
      }
    }

    // Listen for new mails (real-time)
    connection.on("mail", async () => {
      console.log("📨 New email detected!");
    });
  } catch (err) {
    console.error("IMAP Error:", err.message);
  }
}
startIMAP();

// ---------- API Routes ----------
app.get("/api/emails", (req, res) => {
  res.json(emails);
});

app.get("/api/search", (req, res) => {
  const q = req.query.q?.toLowerCase() || "";
  const filtered = emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(q) ||
      e.from.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
  );
  res.json(filtered);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// ---- AI Suggested Reply ----
app.post("/api/suggest-reply", async (req, res) => {
  const { emailBody, context } = req.body; // emailBody = received email, context = optional product/outreach info

  if (!emailBody) return res.status(400).json({ error: "emailBody required" });

  try {
    const prompt = `
You are an assistant helping to respond to emails. 
Email received: "${emailBody}"
${context ? `Additional context: "${context}"` : ""}
Generate a concise, polite, professional reply.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });
  } catch (err) {
    console.error("AI Reply Error:", err.message);
    res.status(500).json({ error: "Failed to generate reply" });
  }
});
