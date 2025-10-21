# email-aggregator


A full-stack email aggregator that fetches emails from Gmail in real-time, categorizes them using AI, sends Slack/webhook notifications, and suggests AI-powered replies.  
This version works without a database and stores emails in memory.

---

## Features

- **Real-Time Email Synchronization**
  - Connects to Gmail via IMAP (IDLE mode)
  - Fetches emails from the last 30 days
  - Updates frontend automatically without refresh

- **AI-Based Email Categorization**
  - Uses OpenAI API to categorize emails as:
    - Interested
    - Meeting Booked
    - Not Interested
    - Spam
    - Out of Office

- **Slack & Webhook Integration**
  - Sends Slack notifications for “Interested” emails
  - Triggers webhooks for automation

- **Search & Filter**
  - Search emails by subject, sender, or category

- **AI Suggested Replies**
  - Generates professional email replies using OpenAI
  - Context-aware for outreach or product info

---

## Architecture

[Gmail IMAP]
│
▼
[Node.js + Express Server] ───> [Socket.IO] ───> [Frontend Dashboard]
│
├─> AI Categorization (OpenAI)
├─> Slack Notification (Webhook URL)
└─> AI Suggested Reply Endpoint



- **Backend:** Node.js, Express, IMAP-simple, OpenAI API, Socket.IO
- **Frontend:** HTML, CSS, JavaScript
- **Data Storage:** In-memory array (emails are lost on server restart)
- **Notifications:** Slack & Webhook
- **AI:** Categorization & Suggested Replies via OpenAI GPT-3.5-turbo

---

## Setup Instructions

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd email-aggregator
Install dependencies

bash
Copy code
npm install
Create .env file in the root directory

env
Copy code
PORT=3000
IMAP1_USER=your_email@gmail.com
IMAP1_PASS=your_app_password
OPENAI_API_KEY=your_openai_api_key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxx/xxxx/xxxx
Make sure you enable IMAP in Gmail and create an App Password.

Start the backend server

bash
Copy code
node server.js
Open the frontend

Go to: http://localhost:3000

You should see the email dashboard

#Usage
Search emails: Type a keyword → click "Search"

Real-time updates: Send an email to your Gmail → appears automatically

AI Suggested Reply: Click “Suggest Reply” on any email → popup with reply

Slack/Webhook notifications: Triggered automatically for “Interested” emails
