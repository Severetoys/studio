// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7yaXjEFWFORvyLyHh1O5SPYjRCzptTg8",
  authDomain: "authkit-y9vjx.firebaseapp.com",
  projectId: "authkit-y9vjx",
  storageBucket: "authkit-y9vjx.appspot.com",
  messagingSenderId: "308487499277",
  appId: "1:308487499277:web:3fde6468b179432e9f2f44",
  measurementId: "G-XKJWPXDPZS"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- INICIALIZAÇÃO DO APP CHECK ---
// IMPORTANTE: Substitua a string abaixo pela sua chave de site do reCAPTCHA v3
// Você pode obtê-la no Console do Google Cloud > Segurança > reCAPTCHA Enterprise
if (typeof window !== 'undefined') {
  const reCaptchaV3SiteKey = "SUA_RECAPTCHA_V3_SITE_KEY_AQUI";

  if (reCaptchaV3SiteKey && reCaptchaV3SiteKey !== "SUA_RECAPTCHA_V3_SITE_KEY_AQUI") {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(reCaptchaV3SiteKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log("Firebase App Check inicializado.");
  } else {
      console.warn("AVISO: A chave do site reCAPTCHA v3 não foi configurada. O App Check não será inicializado.");
  }
}
// --- FIM DA INICIALIZAÇÃO DO APP CHECK ---


const auth = getAuth(app);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
const messaging = isSupported().then(yes => yes ? getMessaging(app) : null);


export { app, auth, analytics, messaging, firebaseConfig };
