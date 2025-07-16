// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhNhB9DeJabhs8cVIz1ibBcgqcQjOi28w",
  authDomain: "merchant-center-1724425392968.firebaseapp.com",
  projectId: "merchant-center-1724425392968",
  storageBucket: "merchant-center-1724425392968.firebasestorage.app",
  messagingSenderId: "148496303720",
  appId: "1:148496303720:web:5a967a03c9bd7041511ddd",
  measurementId: "G-SCQ5NQ2JGN"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, analytics };
