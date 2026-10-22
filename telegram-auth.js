const RELAY_URL = "https://litvm-chess-relay.onrender.com";
const CHESS_ACCOUNT = "0xe7dbd69DB5B3F0e55f2485FacA307fB7F48c1C50";

window.tgSession = { isTelegram: false, chessAccount: CHESS_ACCOUNT, sessionKey: null };

async function initTelegramAuth() {
    if (!window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.initData) return;
    
    window.Telegram.WebApp.ready();
    window.tgSession.isTelegram = true;
    
    try {
        // 1. Проверка в Telegram
        const res = await fetch(`${RELAY_URL}/auth/telegram`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);

        // 2. Ключ (используем ethers, который уже есть на странице)
        const { ethers } = window; 
        let savedKey = localStorage.getItem("tg_session_key");
        if (!savedKey) {
            const wallet = ethers.Wallet.createRandom();
            savedKey = wallet.privateKey;
            localStorage.setItem("tg_session_key", savedKey);
        }
        
        const wallet = new ethers.Wallet(savedKey);
        window.tgSession.sessionKey = wallet;
        const pubKey = wallet.address;
        console.log("🔑 Публичный адрес ключа:", pubKey);

        // 3. Скрываем MetaMask
        const connectBtn = document.getElementById("connectBtn");
        if (connectBtn) connectBtn.style.display = "none";
        document.getElementById("walletStatus").innerHTML = `✅ Вход через Telegram: <b>@${data.username || 'player'}</b>`;

        // 4. ОТПРАВЛЯЕМ ЗАПРОС НА ВЫДАЧУ ПРАВ (createSessionKey)
        // Релейер сам вызовет это от имени твоего кошелька 0x5Ab2...
        console.log("Разрешаем ключ в контракте...");
        await fetch(`${RELAY_URL}/setup-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account: CHESS_ACCOUNT, sessionKey: pubKey })
        });

    } catch (e) {
        console.error("Auth Error:", e);
    }
}
window.addEventListener("DOMContentLoaded", initTelegramAuth);
