import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const userStatus = document.getElementById("userStatus");
  const authMessage = document.getElementById("authMessage");
  const openAuthModalBtn = document.getElementById("openAuthModal");
  const authModal = document.getElementById("authModal");

  function setMessage(msg, isError = false) {
    if (!authMessage) return;
    authMessage.textContent = msg;
    authMessage.style.color = isError ? "#d7265e" : "#475569";
  }

  function getUserLabel(email) {
    if (!email) return "U";
    const localPart = email.split("@")[0] || "";
    return (localPart.slice(0, 2) || localPart || "U").toUpperCase();
  }

  function closeModal() {
    if (!authModal) return;
    authModal.classList.add("hidden");
    authModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function updateTopButton(user) {
    if (!openAuthModalBtn) return;

    if (user && user.emailVerified) {
      openAuthModalBtn.textContent = getUserLabel(user.email);
      openAuthModalBtn.title = user.email;
      openAuthModalBtn.classList.add("user-avatar-btn");
    } else {
      openAuthModalBtn.textContent = "登入 / 註冊";
      openAuthModalBtn.title = "";
      openAuthModalBtn.classList.remove("user-avatar-btn");
    }
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = signupForm.email.value.trim();
      const password = signupForm.password.value;

      if (!email.endsWith("@nycu.edu.tw")) {
        setMessage("僅限 NYCU 校內信箱註冊。", true);
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMessage("註冊成功，驗證信已寄出。請先去學校信箱收信，若沒看到也請檢查垃圾郵件。");
        signupForm.reset();
      } catch (error) {
        setMessage("註冊失敗：" + error.message, true);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;

      if (!email.endsWith("@nycu.edu.tw")) {
        setMessage("請使用 NYCU 校內信箱登入。", true);
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (!userCredential.user.emailVerified) {
          setMessage("你的信箱尚未驗證，請先去信箱點驗證連結；驗證信也可能在垃圾郵件。", true);
          return;
        }

        setMessage("登入成功。");
        loginForm.reset();
        closeModal();
      } catch (error) {
        setMessage("登入失敗：" + error.message, true);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      setMessage("已登出。");
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (!userStatus || !logoutBtn) return;

    if (user && user.emailVerified) {
      userStatus.textContent = `目前登入：${user.email}`;
      logoutBtn.style.display = "inline-block";
      updateTopButton(user);
    } else {
      userStatus.textContent = "尚未登入";
      logoutBtn.style.display = "none";
      updateTopButton(null);
    }
  });
});