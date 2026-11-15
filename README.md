# ChessGram

ChessGram is a Telegram Mini App for playing chess against Stockfish or other Telegram users.

## Features

- Telegram Mini App authentication
- Player identity based on verified Telegram user IDs
- Real-time matchmaking
- Private rooms and shareable invitations via @ChessGram_bot
- Reconnect and resume support for active games
- Chess clocks: 1, 5, 15, and 30 minutes
- Player statistics and PvP match history stored in Supabase
- PGN and move-history persistence

## Architecture

- **Frontend:** vanilla HTML, CSS, and JavaScript
- **Chess rules/UI:** chess.js and chessboard.js
- **Bot:** Stockfish
- **Realtime backend:** Node.js, Express, Socket.IO
- **Authentication:** Telegram Web App initData verification and short-lived signed sessions
- **Database:** Supabase Postgres

## Backend environment

Configure these variables on the ChessGram game server:

- `TELEGRAM_BOT_TOKEN` — token for the Telegram bot configured in BotFather
- `SESSION_SECRET` — random secret with at least 32 characters
- `SUPABASE_URL` — the Supabase project URL
- `SUPABASE_SECRET_KEY` — server-only Supabase secret API key

Never put the Supabase secret key or session signing secret in frontend code or source control.

## Run the frontend locally

Serve the repository over HTTP (rather than opening the HTML file directly), then open it as a Telegram Mini App. Set `window.CHESSGRAM_SERVER_URL` to the deployed backend URL before the auth script loads if using a non-default server address.
