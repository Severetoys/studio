import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

if (process.env.NODE_ENV === 'development') {
  console.log("Conectando aos emuladores Firebase...");

  try {
    const db = getFirestore(app);
    connectFirestoreEmulator(db, '127.0.0.1', 8081);
    console.log("Firestore Emulator conectado na porta 8081");
  } catch (e) {
    console.error("Falha ao conectar Firestore Emulator:", e);
  }

  try {
    const storage = getStorage(app);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log("Storage Emulator conectado na porta 9199");
  } catch (e) {
    console.error("Falha ao conectar Storage Emulator:", e);
  }

  try {
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://127.0.0.1:9100');
    console.log("Auth Emulator conectado na porta 9100");
  } catch (e) {
    console.error("Falha ao conectar Auth Emulator:", e);
  }

  try {
    const functions = getFunctions(app);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    console.log("Functions Emulator conectado na porta 5001");
  } catch (e) {
    console.error("Falha ao conectar Functions Emulator:", e);
  }

  try {
    const rtdb = getDatabase(app);
    connectDatabaseEmulator(rtdb, '127.0.0.1', 9003);
    console.log("Realtime Database Emulator conectado na porta 9003");
  } catch (e) {
    console.error("Falha ao conectar Realtime Database Emulator:", e);
  }
} else {
  console.log("Conectando aos serviços Firebase em produção.");
}

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const functions = getFunctions(app);
const rtdb = getDatabase(app);

export { app, db, auth, storage, functions, rtdb };
