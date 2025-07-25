// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

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
const auth = getAuth(app);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, auth, analytics };
