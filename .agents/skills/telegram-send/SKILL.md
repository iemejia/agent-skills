---
name: telegram-send
description: "Send a message to the user via Telegram, optionally with media (images, videos, documents). USE FOR: sending notifications, alerts, status updates, or any message to the user through Telegram."
---

# Telegram Send

Send a message (with optional media) to the user via Telegram using the Bot API.
Look for a `.env` file if environment variables are not set.

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**.
2. Send `/newbot` and follow the prompts to choose a name and username.
3. BotFather will give you a **bot token** (e.g. `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`). Save it.

### 2. Get Your Chat ID

1. Start a conversation with your new bot (search for it by username and press **Start**).
2. Send any message to the bot (e.g. "hello").
3. Open this URL in a browser, replacing `<BOT_TOKEN>` with your token:
   ```
   https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
   ```
4. Look for `"chat":{"id": ...}` in the JSON response. That number is your **chat ID**.

### 3. Configure Environment Variables

Set these environment variables (e.g. in your shell profile, `.env` file, or VS Code settings):

```sh
export TELEGRAM_BOT_TOKEN="your-bot-token"
export TELEGRAM_CHAT_ID="your-chat-id"
```

## Usage

To send a text message:

```sh
node .agents/skills/telegram-send/scripts/send.mjs "Your message here"
```

To send a media file (image, video, or document) with an optional caption:

```sh
node .agents/skills/telegram-send/scripts/send.mjs --media path/to/file.mp4 "Optional caption"
```

Supported media types:
- **Photos**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Videos**: `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`
- **Documents**: any other file type

The script supports Markdown formatting in messages and captions.

## When to Use

Use this skill when the user asks to:
- Send a Telegram message or notification
- Notify them when a long-running task completes
- Send a status update or alert via Telegram
- Share an image, video, or file via Telegram
