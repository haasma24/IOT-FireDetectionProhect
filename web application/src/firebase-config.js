// Importez Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Si vous utilisez Firestore
import { getAuth } from "firebase/auth"; // Si vous utilisez l'authentification
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Configuration de votre projet Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD932po7oLpGLsysd-QUizW-LyFIFMuxuY",
    authDomain: "firedetectionapp-f9127.firebaseapp.com",
    projectId: "firedetectionapp-f9127",
    storageBucket: "firedetectionapp-f9127.appspot.com",
    messagingSenderId: "926038943893",
    appId: "1:926038943893:android:e6142eb65b0af21ce9139c"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services Firebase nécessaires
const db = getFirestore(app); // Base de données Firestore
const auth = getAuth(app); // Authentification
const storage = getStorage(app);
const database = getDatabase(app);
const firestore = getFirestore(app); // Firestore

export { app, db, auth ,database,firestore,storage};
