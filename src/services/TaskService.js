import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";

const TASKS_COLLECTION = "tasks";

export const TaskService = {
  // Create a listener for tasks
  subscribeToTasks: (callback) => {
    const q = query(collection(db, TASKS_COLLECTION), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(tasks);
    });
  },

  // Add a new task
  addTask: async (taskData) => {
    const task = {
      title: taskData.title || "",
      details: taskData.details || "",
      completed: false,
      starred: taskData.starred || false,
      category: taskData.category || "personal",
      recurrence: taskData.recurrence || "none",
      subtasks: taskData.subtasks || [],
      createdAt: serverTimestamp(),
      ...taskData
    };
    // Remove id if it exists (Firestore generates it)
    delete task.id;
    return await addDoc(collection(db, TASKS_COLLECTION), task);
  },

  // Update an existing task
  updateTask: async (id, updates) => {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    // Don't include the id in the update data
    const dataToUpdate = { ...updates };
    delete dataToUpdate.id;
    
    // Ensure we don't overwrite serverTimestamp with a local one if it's already there
    if (dataToUpdate.createdAt && typeof dataToUpdate.createdAt.toDate !== 'function') {
      delete dataToUpdate.createdAt;
    }

    return await updateDoc(taskRef, dataToUpdate);
  },

  // Delete a task
  deleteTask: async (id) => {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    return await deleteDoc(taskRef);
  },

  // Handle Recurrence (Math stays the same, but it returns the data for the next task)
  handleRecurrence: (task) => {
    if (!task.recurrence || task.recurrence === 'none') return null;

    const nextDate = new Date(task.dueDate || new Date());
    if (task.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    else if (task.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (task.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

    return {
      title: task.title,
      details: task.details,
      category: task.category,
      starred: task.starred,
      recurrence: task.recurrence,
      subtasks: task.subtasks.map(s => ({ ...s, completed: false })), // Reset subtasks
      dueDate: nextDate.toISOString().split('T')[0]
    };
  }
};
