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
        window.tgSession.telegramId = data.telegramId;
        window.tgSession.username = data.username;

        // Сохраняем доступные данные профиля Telegram Mini App.
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser) {
            window.tgSession.firstName = tgUser.first_name || "Player";
            window.tgSession.lastName = tgUser.last_name || "";
            window.tgSession.photoUrl = tgUser.photo_url || null;
            if (tgUser.username) window.tgSession.username = tgUser.username;
        }

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

        // Показываем компактный профиль Telegram: аватар + имя/ник.
        const profileCard = document.getElementById("telegramProfileCard");
        const profileAvatar = document.getElementById("tgProfileAvatar");
        const profileName = document.getElementById("tgProfileName");
        const connectBtn = document.getElementById("connectBtn");
        if (connectBtn) connectBtn.style.display = "none";

        if (profileCard && profileAvatar && profileName) {
            profileCard.style.display = "flex";

            const displayName = [window.tgSession.firstName, window.tgSession.lastName]
                .filter(Boolean).join(" ").trim()
                || (window.tgSession.username ? "@" + window.tgSession.username : "Player");
            profileName.textContent = displayName;

            const fallbackAvatar = "https://api.dicebear.com/9.x/avataaars/svg?seed="
                + encodeURIComponent(window.tgSession.username || displayName || "Player");
            profileAvatar.onerror = () => {
                profileAvatar.onerror = null;
                profileAvatar.src = fallbackAvatar;
            };
            profileAvatar.src = window.tgSession.photoUrl || fallbackAvatar;
        }
                // Разблокируем кнопки для игры
        const findMatchBtn = document.getElementById("findMatchBtn");
        if (findMatchBtn) findMatchBtn.disabled = false;
        
        const loadBtn = document.getElementById("loadBtn");
        if (loadBtn) loadBtn.disabled = false;
        
        const createBtn = document.getElementById("createBtn");
        if (createBtn) createBtn.disabled = false;

    } catch (e) {
        console.error("Auth Error:", e);
        alert("Ошибка входа: " + e.message);
    }
}
window.addEventListener("DOMContentLoaded", initTelegramAuth);
