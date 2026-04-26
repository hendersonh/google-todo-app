import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8-TmagjO-yarfdk0q-Qf_gM5_rJILzDc",
  authDomain: "todolist-c6c81.firebaseapp.com",
  projectId: "todolist-c6c81",
  storageBucket: "todolist-c6c81.firebasestorage.app",
  messagingSenderId: "526793244888",
  appId: "1:526793244888:web:086a92868fd80c479157ad"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTest() {
  console.log("🚀 Starting Firestore Connection Test...");
  try {
    // 1. Try to Add a document
    console.log("📝 Attempting to write a test task...");
    const docRef = await addDoc(collection(db, "tasks"), {
      title: "Connection Test (Automated)",
      details: "This task was added by the Antigravity test script.",
      completed: false,
      createdAt: new Date()
    });
    console.log("✅ Success! Document written with ID:", docRef.id);

    // 2. Try to Read documents
    console.log("📖 Attempting to read tasks collection...");
    const querySnapshot = await getDocs(collection(db, "tasks"));
    console.log(`✅ Success! Found ${querySnapshot.size} documents in the cloud.`);
    
    process.exit(0);
  } catch (e) {
    console.error("❌ Connection Failed!");
    console.error("Error Detail:", e.message);
    
    if (e.message.includes("PERMISSION_DENIED")) {
      console.log("\n💡 TIP: Check your Firestore Security Rules in the Firebase Console.");
    }
    
    process.exit(1);
  }
}

runTest();
