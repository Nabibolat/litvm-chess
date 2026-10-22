const RELAY_URL = "https://litvm-chess-relay.onrender.com";

window.tgSession = { isTelegram: false, chessAccount: null, sessionKey: null };

async function initTelegramAuth() {
    if (!window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.initData) return;
    
    window.Telegram.WebApp.ready();
    window.tgSession.isTelegram = true;
    
    try {
        const res = await fetch(`${RELAY_URL}/auth/telegram`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);

        window.tgSession.chessAccount = data.chessAccount;
        window.tgSession.sessionKey = new ethers.Wallet(data.sessionKey);

        console.log("✅ Telegram Auth OK:", data.username);
        console.log("🔑 Ключ выдан сервером:", window.tgSession.sessionKey.address);

        const connectBtn = document.getElementById("connectBtn");
        if (connectBtn) connectBtn.style.display = "none";
        document.getElementById("walletStatus").innerHTML = `✅ Вход через Telegram: <b>@${data.username || 'player'}</b>`;

    } catch (e) {
        console.error("Auth Error:", e);
        alert("Ошибка входа: " + e.message);
    }
}
window.addEventListener("DOMContentLoaded", initTelegramAuth);
