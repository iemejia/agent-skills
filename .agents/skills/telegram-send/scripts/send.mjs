// Sends a message (with optional media) to a Telegram chat using the Bot API.
// Usage: node send.mjs [--media <file>] <message>
// Requires: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars

import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.error(
    "Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables must be set."
  );
  process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
let mediaPath = null;
if (args[0] === "--media") {
  args.shift();
  mediaPath = args.shift();
  if (!mediaPath) {
    console.error("Error: --media flag requires a file path.");
    process.exit(1);
  }
}

const message = args.join(" ");
if (!message && !mediaPath) {
  console.error("Error: No message or media provided.");
  console.error("Usage: node send.mjs [--media <file>] <message>");
  process.exit(1);
}

const baseUrl = `https://api.telegram.org/bot${token}`;

const photoExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const videoExts = [".mp4", ".mov", ".avi", ".mkv", ".webm"];

function getMediaType(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (photoExts.includes(ext)) return "photo";
  if (videoExts.includes(ext)) return "video";
  return "document";
}

async function sendTextOnly(text) {
  const res = await fetch(`${baseUrl}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });
  return res.json();
}

async function sendMedia(filePath, caption) {
  const mediaType = getMediaType(filePath);
  const method =
    mediaType === "photo"
      ? "sendPhoto"
      : mediaType === "video"
        ? "sendVideo"
        : "sendDocument";
  const fieldName = mediaType; // photo, video, or document

  const fileData = readFileSync(filePath);
  const fileName = basename(filePath);

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append(fieldName, new Blob([fileData]), fileName);
  if (caption) {
    form.append("caption", caption);
    form.append("parse_mode", "Markdown");
  }

  const res = await fetch(`${baseUrl}/${method}`, {
    method: "POST",
    body: form,
  });
  return res.json();
}

const data = mediaPath
  ? await sendMedia(mediaPath, message)
  : await sendTextOnly(message);

if (!data.ok) {
  console.error("Telegram API error:", data.description);
  process.exit(1);
}

console.log(mediaPath ? "Media sent successfully." : "Message sent successfully.");
