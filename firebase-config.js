import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjR5H7HVJn8EPIZxY44N8-ndc6PKhnU4s",
  authDomain: "nycu-eo.firebaseapp.com",
  projectId: "nycu-eo",
  storageBucket: "nycu-eo.firebasestorage.app",
  messagingSenderId: "761042595207",
  appId: "1:761042595207:web:025d63fb740b402049f722"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };