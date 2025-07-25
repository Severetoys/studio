
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "your_actual_firebase_api_key", // Substituído pela chave correta
  authDomain: "authkit-y9vjx.firebaseapp.com",
  databaseURL: "https://authkit-y9vjx-default-rtdb.firebaseio.com",
  projectId: "authkit-y9vjx",
  storageBucket: "authkit-y9vjx.appspot.com",
  messagingSenderId: "308487499277",
  appId: "1:308487499277:web:3fde6468b179432e9f2f44",
  measurementId: "G-XKJWPXDPZS"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, firebaseConfig, db };
