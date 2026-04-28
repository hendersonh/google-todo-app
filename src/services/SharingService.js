import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebase";

const SHARING_COLLECTION = "shared_links";

export const SharingService = {
  /**
   * Creates a magic link for a specific task.
   * Default expiration: 7 days.
   */
  createLink: async (task, ownerId) => {
    const linkId = crypto.randomUUID(); 
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const linkRef = doc(db, SHARING_COLLECTION, linkId);
    const linkData = {
      taskId: task.id,
      ownerId: ownerId,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
      taskSnapshot: {
        title: task.title,
        details: task.details || '',
        completed: task.completed || false,
        category: task.category || 'personal',
        starred: task.starred || false,
        dueDate: task.dueDate || null,
        subtasks: task.subtasks || []
      }
    };

    await setDoc(linkRef, linkData);
    return linkId;
  },

  /**
   * Retrieves a shared task by its magic token.
   * Returns the task data if valid and unexpired.
   */
  getSharedTask: async (linkId) => {
    const linkRef = doc(db, SHARING_COLLECTION, linkId);
    const linkSnap = await getDoc(linkRef);

    if (!linkSnap.exists()) {
      throw new Error("Invalid or broken link.");
    }

    const data = linkSnap.data();
    const now = Timestamp.now();

    if (now.toMillis() > data.expiresAt.toMillis()) {
      throw new Error("This link has expired.");
    }

    return data.taskSnapshot;
  }
};
