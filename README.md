# LitVM Chess

An open-source chess dApp built on **LitVM LiteForge testnet**. Play against Stockfish bot or against other players, with match results recorded on-chain.

## 🌐 Live Demo

https://nabibolat.github.io/litvm-chess/

## 🔗 Network

- **Chain:** LitVM LiteForge (testnet)
- **Chain ID:** 4441
- **Currency:** zkLTC
- **RPC:** https://liteforge.rpc.caldera.xyz/http
- **Explorer:** https://liteforge.explorer.caldera.xyz

## 📜 Smart Contract

- **GameRegistryV3:** `0x92a4b8b47bbb22b13e08841454f3437cb9c46bd8`
- **Network:** LitVM LiteForge
- **Source:** verified in LitVM Explorer

The contract is a simple match registry. It:
- Does NOT accept deposits (`non-payable`)
- Does NOT transfer funds (`no transfer/send/call`)
- Does NOT have admin functions (`no owner`)
- Does NOT use `delegatecall` or `selfdestruct`

All player actions require explicit confirmation in MetaMask.

## 🔒 Security

This application **never asks for**:
- Seed phrases
- Private keys
- Wallet passwords

All blockchain transactions are **explicitly confirmed by the user in MetaMask**.

## 🎮 Features

- Play chess against Stockfish (5 difficulty levels)
- Play against other players via open game lobby
- Match results recorded on-chain
- Timer per game (1 / 5 / 15 / 30 minutes)
- Player statistics (wins / losses / draws)

## 🛠 Tech Stack

- **Frontend:** vanilla HTML/CSS/JS
- **Chess logic:** chess.js
- **Chess UI:** chessboard.js + jQuery
- **Bot:** Stockfish.js (WASM)
- **Blockchain:** ethers.js v5
- **Smart contract:** Solidity ^0.8.19

## 📦 Local Run

```bash
npx --yes http-server -p 8000 -c-1
