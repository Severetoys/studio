// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhNhB9DeJabhs8cVIz1ibBcgqcQjOi28w",
  authDomain: "merchant-center-1724425392968.firebaseapp.com",
  projectId: "merchant-center-1724425392968",
  storageBucket: "merchant-center-1724425392968.appspot.com",
  messagingSenderId: "148496303720",
  appId: "1:148496303720:web:5a967a03c9bd7041511ddd",
  measurementId: "G-SCQ5NQ2JGN"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
