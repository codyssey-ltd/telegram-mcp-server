# Telegram MCP Server — Setup & Authentication

This document explains how to obtain Telegram API credentials, configure the repo, authenticate the server against Telegram (MTProto), and run the server locally or in Docker Compose.

Prerequisites
- Node.js 18+ installed locally.
- A Telegram account with Two-Step Verification (2FA) enabled.
- This repository checked out and you are in the project root.
- Create a writable `data/` directory in the project root:
  ```bash
  mkdir -p data
  chmod 700 data
  ```

1) Obtain Telegram API credentials
- Visit: https://my.telegram.org and sign in with your Telegram account (phone-based).
- Click "API development tools".
- Create a new application (provide `App title` and `Short name`).
- Copy `api_id` and `api_hash` — store them securely.

2) Enable Two-Step Verification (required)
- In your Telegram app: Settings → Privacy and Security → Two-Step Verification.
- Set a password and (optionally) recovery email. Record the password safely — the server will prompt for it during login.

3) Create `.env`
- At repo root create a `.env` file (do NOT commit it). Example variables:
  - `TELEGRAM_API_ID`
  - `TELEGRAM_API_HASH`
  - `TELEGRAM_PHONE_NUMBER` (international format, e.g., `+15551234567`)
  - Optional: `SESSION_PATH` (defaults to `./data/session.json`), `PORT` (defaults to `8080`)
- See `.env.example` in this repo for the exact keys.

4) Install dependencies
```bash
npm install
```

5) First run — complete authentication flow
- Run the server once to trigger login:
```bash
npm start
```
- The process will prompt you to enter the login code sent by Telegram to your device (in-app or SMS depending on your account). If 2FA is enabled, you will be prompted for your password.
- On success a session file is written at `./data/session.json`. Keep this file private.

Notes:
- If the server is launched by an MCP client and you see repeated login prompts, manually run `npm start` in the project root to perform the interactive auth flow and create the session file.
- If the session is revoked or corrupted, delete `./data/session.json` and re-run `npm start`.

6) Validate server and tools
- Server endpoint: `http://localhost:8080/mcp`
- Check logs for successful login and tool registration: `listChannels`, `searchChannels`, `getChannelMessages`, `scheduleMessageSync`, `listMessageSyncJobs`.

7) Example CLI test
```bash
node client.js
```
- This uses `telegram-client.js` to list dialogs (make sure `.env` is present).

8) Running with Docker Compose
- Copy `.env.example` → `.env` and fill secrets.
- Ensure `data/` directory exists on the host (Compose mounts it for persistent sessions and messages).
- Start:
```bash
docker compose up -d
```
- Stop:
```bash
docker compose down
```

9) Background message sync
- Archived messages are stored in `./data/messages.db`.
- Use the MCP `scheduleMessageSync` tool to create archival jobs by chat ID or username.
- Jobs persist across restarts and follow states: `pending → in_progress → idle` (or `error` on failures).

Troubleshooting
- Repeated prompts: ensure `./data/session.json` exists and server process can read/write `data/`.
- Session problems: delete `./data/session.json` and re-run `npm start` to re-authenticate.
- 2FA failures: verify the exact password and recovery email in your Telegram account.
- Permissions: ensure the user running the container/server owns `data/`.

Security recommendations
- Never commit `.env` or `data/session.json`.
- Use file system permissions to restrict `data/`.
- Consider rotating API keys and revoke unused sessions via Telegram settings.

If you want, I can commit these three files to the repo for you.
```

File: .env.example (save as .env.example)
```env
# Example .env for telegram-mcp-server — copy to .env and fill values
TELEGRAM_API_ID=123456
TELEGRAM_API_HASH=your_api_hash_here
TELEGRAM_PHONE_NUMBER=+15551234567

# Optional
SESSION_PATH=./data/session.json
PORT=8080
NODE_ENV=production
```

File: docker-compose.yml (save as docker-compose.yml)
```yaml
version: "3.8"

services:
  telegram-mcp:
    image: node:18
    working_dir: /usr/src/app
    volumes:
      - ./:/usr/src/app:delegated
      - ./data:/usr/src/app/data
    env_file:
      - .env
    ports:
      - "8080:8080"
    command: sh -c "npm ci --prefer-offline --no-audit --no-fund && npm start"
    restart: unless-stopped
```

Quick run instructions
- Copy example env and edit values:
```bash
cp .env.example .env
# edit .env with your API credentials
```
- Ensure `data/` exists:
```bash
mkdir -p data
chmod 700 data
```
- Run with Docker Compose:
```bash
docker compose up -d
docker compose logs -f telegram-mcp
```
- Or run locally:
```bash
npm install
npm start
```
