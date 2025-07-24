
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enablePersistence } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.GEMINI_API_KEY,
  authDomain: "authkit-y9vjx.firebaseapp.com",
  databaseURL: "https://authkit-y9vjx-default-rtdb.firebaseio.com",
  projectId: "authkit-y9vjx",
  storageBucket: "authkit-y9vjx.firebasestorage.app",
  messagingSenderId: "308487499277",
  appId: "1:308487499277:web:3fde6468b179432e9f2f44",
  measurementId: "G-XKJWPXDPZS"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Enable Firestore offline persistence
try {
    enablePersistence(db);
    console.log("Persistência offline do Firestore habilitada com sucesso!");
} catch (err: any) {
    if (err.code == 'failed-precondition') {
      // This happens when there are multiple tabs open in the browser
      // and persistence can only be enabled in one tab at a time.
      console.warn("Persistência offline não pôde ser habilitada. Múltiplas abas abertas?", err);
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all the features required
      // to enable persistence (rare nowadays).
      console.error("Persistência offline não suportada por este navegador.", err);
    } else {
      console.error("Erro ao habilitar persistência offline do Firestore:", err);
    }
}


export { app, firebaseConfig, db };
