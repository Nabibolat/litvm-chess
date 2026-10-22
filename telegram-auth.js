const RELAY_URL = "https://litvm-chess-relay.onrender.com";

window.tgSession = { 
    isTelegram: false, 
    chessAccount: null, 
    sessionKey: null,
    sessionKeyAddress: null 
};

async function initTelegramAuth() {
    if (!window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.initData) return;
    
    window.Telegram.WebApp.ready();
    window.tgSession.isTelegram = true;
    
    try {
        console.log("🔐 Проверка Telegram...");
        const res = await fetch(`${RELAY_URL}/auth/telegram`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Передаем initData. Владельцем пока будет релейер (для теста)
            body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);

        window.tgSession.chessAccount = data.chessAccount;
        console.log("✅ Аккаунт получен:", data.chessAccount);

        // Генерируем Session Key на клиенте (в браузере)
        let savedPrivKey = localStorage.getItem("tg_session_key");
        if (!savedPrivKey) {
            const wallet = ethers.Wallet.createRandom();
            savedPrivKey = wallet.privateKey;
            localStorage.setItem("tg_session_key", savedPrivKey);
            console.log("🔑 Создан новый Session Key (клиент):", wallet.address);
        } else {
            const wallet = new ethers.Wallet(savedPrivKey);
            console.log("🔑 Загружен Session Key (клиент):", wallet.address);
        }
        
        const wallet = new ethers.Wallet(savedPrivKey);
        window.tgSession.sessionKey = wallet;
        window.tgSession.sessionKeyAddress = wallet.address;

        // Отправляем публичный адрес ключа на сервер, чтобы записать его в контракт
        const regRes = await fetch(`${RELAY_URL}/register-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                account: window.tgSession.chessAccount, 
                sessionKey: wallet.address 
            })
        });
        const regData = await regRes.json();
        if (!regData.ok) throw new Error(regData.error);
        console.log("✅ Ключ зарегистрирован в смарт-аккаунте!");

        // Обновляем UI
        const connectBtn = document.getElementById("connectBtn");
        if (connectBtn) connectBtn.style.display = "none";
        const walletStatus = document.getElementById("walletStatus");
        if (walletStatus) {
            walletStatus.innerHTML = `✅ Вход через Telegram: <b>@${data.username || 'player'}</b>`;
            walletStatus.style.color = "#b6f7c4";
        }

    } catch (e) {
        console.error("Auth Error:", e);
        alert("Ошибка входа: " + e.message);
    }
}
window.addEventListener("DOMContentLoaded", initTelegramAuth);
