
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage }from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDP41s8iAn_Gkxti_3TjY-M6TzJz9L9dDE",
  authDomain: "authkit-y9vjx.firebaseapp.com",
  databaseURL: "https://facei-id-italosantos-com.firebaseio.com/",
  projectId: "authkit-y9vjx",
  storageBucket: "authkit-y9vjx.appspot.com",
  messagingSenderId: "308487499277",
  appId: "1:308487499277:web:3fde6468b179432e9f2f44",
  measurementId: "G-XKJWPXDPZS"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);


export { app, firebaseConfig, db, auth, database, storage };
