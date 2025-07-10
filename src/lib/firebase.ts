
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD751WpTjD0l4xgk1wAYkPMVeIZPpXIyaM",
  authDomain: "amik-lodo-1af17.firebaseapp.com",
  projectId: "amik-lodo-1af17",
  storageBucket: "amik-lodo-1af17.appspot.com",
  messagingSenderId: "699079515264",
  appId: "1:699079515264:web:608c71c562381146e81a65",
  measurementId: "G-089BBM02XG"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
