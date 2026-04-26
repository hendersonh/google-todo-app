import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy,
  where,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";

const TASKS_COLLECTION = "tasks";
const CATEGORIES_COLLECTION = "categories";

// Curated Google-inspired palette for auto-assignment
const GOOGLE_PALETTE = [
  "#4285F4", // Google Blue
  "#34A853", // Google Green
  "#EA4335", // Google Red
  "#FBBC05", // Google Yellow
  "#A142F4", // Purple
  "#009688", // Teal
  "#FF6D00", // Orange
  "#607D8B", // Blue Grey
];

export const TaskService = {
  // Category Methods
  subscribeToCategories: (userId, callback) => {
    if (!userId) {
      callback([]); // Return empty for guests
      return () => {};
    }

    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where("ownerUid", "==", userId),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(categories);
    });
  },

  addCategory: async (categoryData) => {
    // Auto-assign a color if not provided
    const color = categoryData.color || GOOGLE_PALETTE[Math.floor(Math.random() * GOOGLE_PALETTE.length)];
    
    const category = {
      label: categoryData.label,
      color: color,
      ownerUid: categoryData.ownerUid,
      createdAt: serverTimestamp(),
    };
    
    return await addDoc(collection(db, CATEGORIES_COLLECTION), category);
  },

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
      userId: taskData.userId, // Required for security rules
      ownerName: taskData.ownerName || "Anonymous",
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
