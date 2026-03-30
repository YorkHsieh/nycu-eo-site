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

  function setMessage(msg, isError = false) {
    if (!authMessage) return;
    authMessage.textContent = msg;
    authMessage.style.color = isError ? "#d7265e" : "#475569";
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
        setMessage("註冊成功，驗證信已寄出，請先去學校信箱收信驗證。");
        signupForm.reset();
        await signOut(auth);
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
          await signOut(auth);
          setMessage("你的信箱尚未驗證，請先去信箱點驗證連結。", true);
          return;
        }

        setMessage("登入成功。");
        loginForm.reset();
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
    } else {
      userStatus.textContent = "尚未登入";
      logoutBtn.style.display = "none";
    }
  });
});