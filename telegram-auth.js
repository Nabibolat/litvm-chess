const CHESSGRAM_AUTH_API_URL = window.CHESSGRAM_AUTH_API_URL || "https://chessgram-server.onrender.com";

window.tgSession = {
  isTelegram: false,
  telegramId: null,
  sessionToken: null,
  username: "",
  firstName: "",
  lastName: "",
  photoUrl: null
};

async function initTelegramAuth() {
  const webApp = window.Telegram && window.Telegram.WebApp;
  if (!webApp || !webApp.initData) {
    console.warn("[ChessGram] Open this app inside Telegram to sign in.");
    return;
  }

  webApp.ready();
  webApp.expand();

  try {
    const response = await fetch(CHESSGRAM_AUTH_API_URL + "/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: webApp.initData })
    });
    const data = await response.json();
    if (!response.ok || !data.ok || !data.sessionToken || !data.telegramId) {
      throw new Error(data.error || "Telegram authentication failed");
    }

    window.tgSession = {
      isTelegram: true,
      telegramId: String(data.telegramId),
      sessionToken: data.sessionToken,
      username: data.username || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      photoUrl: data.photoUrl || null
    };

    const card = document.getElementById("telegramProfileCard");
    const avatar = document.getElementById("tgProfileAvatar");
    const name = document.getElementById("tgProfileName");
    const displayName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim()
      || (data.username ? "@" + data.username : "Player");

    if (card && avatar && name) {
      card.style.display = "flex";
      name.textContent = displayName;
      const fallback = "https://api.dicebear.com/9.x/avataaars/svg?seed="
        + encodeURIComponent(data.telegramId);
      avatar.onerror = () => { avatar.onerror = null; avatar.src = fallback; };
      avatar.src = data.photoUrl || fallback;
    }

    const connectBtn = document.getElementById("connectBtn");
    if (connectBtn) connectBtn.style.display = "none";

    ["findMatchBtn", "inviteFriendBtn"].forEach((id) => {
      const button = document.getElementById(id);
      if (button) button.disabled = false;
    });

    if (typeof connectSocket === "function") connectSocket();
    if (typeof loadMatches === "function") loadMatches();
    console.log("[ChessGram] Telegram identity verified.");
  } catch (error) {
    console.error("[ChessGram] Authentication error:", error);
    const status = document.getElementById("matchStatus");
    if (status) status.textContent = "Sign-in failed. Reopen the Mini App from Telegram.";
  }
}

window.addEventListener("DOMContentLoaded", initTelegramAuth);
