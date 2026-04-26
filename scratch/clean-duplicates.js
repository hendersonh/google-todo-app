import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'todolist-c6c81'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanDuplicates() {
  const tasksCol = collection(db, 'tasks');
  const snapshot = await getDocs(tasksCol);
  
  const seen = new Map();
  const toDelete = [];

  snapshot.forEach(document => {
    const data = document.data();
    const key = `${data.userId}_${data.title}_${data.completed}`;
    
    if (seen.has(key)) {
      // Keep the newest one (highest createTime or updatedAt)
      const existing = seen.get(key);
      if (document.createTime > existing.createTime) {
        toDelete.push(existing.id);
        seen.set(key, { id: document.id, createTime: document.createTime });
      } else {
        toDelete.push(document.id);
      }
    } else {
      seen.set(key, { id: document.id, createTime: document.createTime });
    }
  });

  console.log(`Found ${toDelete.length} duplicates to delete.`);
  for (const id of toDelete) {
    console.log(`Deleting ${id}...`);
    await deleteDoc(doc(db, 'tasks', id));
  }
}

cleanDuplicates().catch(console.error);
