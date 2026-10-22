// telegram-auth.js
const RELAY_URL = "https://litvm-chess-relay.onrender.com";
const CHESS_ACCOUNT = "0xe7dbd69DB5B3F0e55f2485FacA307fB7F48c1C50"; // Твой актуальный контракт

window.tgSession = {
    isTelegram: false,
    user: null,
    sessionKey: null,
    chessAccount: CHESS_ACCOUNT
};

async function initTelegramAuth() {
    if (!window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.initData) {
        console.log("⚠️ Не в Telegram. Игра работает в обычном браузере.");
        return;
    }

    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    window.tgSession.isTelegram = true;

    const initData = window.Telegram.WebApp.initData;
    
    try {
        console.log("🔐 Проверка Telegram initData...");
        const res = await fetch(`${RELAY_URL}/auth/telegram`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData })
        });

        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Auth failed");

        console.log("✅ Telegram Auth OK:", data.username || data.telegramId);
        window.tgSession.user = data;

        const { ethers } = window; 
        let savedKey = localStorage.getItem("tg_session_key");
        if (!savedKey) {
            const wallet = ethers.Wallet.createRandom();
            savedKey = wallet.privateKey;
            localStorage.setItem("tg_session_key", savedKey);
            console.log("🔑 Создан новый Session Key:", wallet.address);
        } else {
            const wallet = new ethers.Wallet(savedKey);
            console.log("🔑 Загружен Session Key:", wallet.address);
        }
        
        window.tgSession.sessionKey = new ethers.Wallet(savedKey);

        const connectBtn = document.getElementById("connectBtn");
        if (connectBtn) connectBtn.style.display = "none";
        
        const walletStatus = document.getElementById("walletStatus");
        if (walletStatus) {
            walletStatus.innerHTML = `✅ Вход через Telegram: <b>@${data.username || 'player'}</b>`;
            walletStatus.style.color = "#b6f7c4";
        }

        document.getElementById("createBtn").disabled = false;
        document.getElementById("loadBtn").disabled = false;
        document.getElementById("findMatchBtn").disabled = false;

    } catch (e) {
        console.error("❌ Telegram Auth Error:", e);
        alert("Ошибка входа: " + e.message);
    }
}

window.addEventListener("DOMContentLoaded", initTelegramAuth);
