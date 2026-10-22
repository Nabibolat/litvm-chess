// telegram-auth.js
const RELAY_URL = "https://litvm-chess-relay.onrender.com";

// Глобальные переменные для сессии
window.tgSession = {
    isTelegram: false,
    user: null,
    sessionKey: null, // Приватный ключ, который будет подписывать
    chessAccount: "0x46ff67E925f8Ce238B7F0f9943e645D38A0C573b" // Пока берем твой тестовый
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
        // 1. Отправляем initData на релейер для проверки
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

        // 2. Генерируем Session Key (пока сохраняем в localStorage для теста)
        // В идеале нужно вызывать createSessionKey в контракте, но для этого нужен Privy.
        // Пока пропустим этот шаг и просто создадим ключ.
        const { ethers } = window; // У тебя подключен ethers.js v5 в index.html
        
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

        // 3. Скрываем кнопку MetaMask, раз мы в Telegram
        const connectBtn = document.getElementById("connectBtn");
        if (connectBtn) connectBtn.style.display = "none";
        
        const walletStatus = document.getElementById("walletStatus");
        if (walletStatus) {
            walletStatus.innerHTML = `✅ Вход через Telegram: <b>@${data.username || 'player'}</b>`;
            walletStatus.style.color = "#b6f7c4";
        }

        // Разблокируем кнопки (эмулируем успешный connect)
        document.getElementById("createBtn").disabled = false;
        document.getElementById("loadBtn").disabled = false;
        document.getElementById("findMatchBtn").disabled = false;

    } catch (e) {
        console.error("❌ Telegram Auth Error:", e);
        alert("Ошибка входа через Telegram: " + e.message);
    }
}

// Запускаем при загрузке страницы
window.addEventListener("DOMContentLoaded", initTelegramAuth);