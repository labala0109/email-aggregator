const socket = io();

function renderEmails(data) {
  const container = document.getElementById("emailList");
  container.innerHTML = "";
  data.forEach(e => {
    const div = document.createElement("div");
    div.className = "email";
    div.innerHTML = `
      <h3>${e.subject}</h3>
      <p><strong>From:</strong> ${e.from}</p>
      <p>${e.body.slice(0, 100)}...</p>
      <p class="category"><strong>Category:</strong> ${e.category}</p>
    `;
    container.appendChild(div);
  });
}

async function fetchEmails() {
  const res = await fetch("/api/emails");
  const data = await res.json();
  renderEmails(data);
}

document.getElementById("searchBtn").addEventListener("click", async () => {
  const q = document.getElementById("search").value;
  const res = await fetch(`/api/search?q=${q}`);
  const data = await res.json();
  renderEmails(data);
});

socket.on("new-email", email => {
  alert("New Email Received: " + email.subject);
  fetchEmails();
});

fetchEmails();
const div = document.createElement("div");
div.className = "email";
div.innerHTML = `
  <h3>${e.subject}</h3>
  <p><strong>From:</strong> ${e.from}</p>
  <p>${e.body.slice(0, 100)}...</p>
  <p class="category"><strong>Category:</strong> ${e.category}</p>
  <button class="suggest-btn">Suggest Reply</button>
`;
container.appendChild(div);

// Add click event for Suggest Reply
div.querySelector(".suggest-btn").addEventListener("click", async () => {
  const context = "I am applying for a job position. Share the meeting booking link: https://cal.com/example";
  const res = await fetch("/api/suggest-reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailBody: e.body, context }),
  });
  const data = await res.json();
  alert("Suggested Reply:\n\n" + data.reply);
});
