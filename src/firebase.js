import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8-TmagjO-yarfdk0q-Qf_gM5_rJILzDc",
  authDomain: "todolist-c6c81.firebaseapp.com",
  projectId: "todolist-c6c81",
  storageBucket: "todolist-c6c81.firebasestorage.app",
  messagingSenderId: "526793244888",
  appId: "1:526793244888:web:086a92868fd80c479157ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
