// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqD0Uva1wjJwscwlChV7opigITwkEAs7Q",
  authDomain: "shopping-list-e8198.firebaseapp.com",
  projectId: "shopping-list-e8198",
  storageBucket: "shopping-list-e8198.firebasestorage.app",
  messagingSenderId: "1082752490070",
  appId: "1:1082752490070:web:871db5d081e70f0f1179f7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
