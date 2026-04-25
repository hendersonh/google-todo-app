const STORAGE_KEY = 'google_todo_tasks';

export const TaskService = {
  getTasks: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const tasks = JSON.parse(data);
      console.log('[TaskService] Loaded tasks:', tasks.length);
      return Array.isArray(tasks) ? tasks : [];
    } catch (e) {
      console.error('[TaskService] Error loading tasks:', e);
      return [];
    }
  },

  saveTasks: (tasks) => {
    try {
      if (!Array.isArray(tasks)) return;
      console.log('[TaskService] Saving tasks:', tasks.length);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('[TaskService] Error saving tasks:', e);
    }
  },

  // Helper to generate a new task object
  createTask: (taskData) => {
    return {
      id: Date.now().toString(),
      completed: false,
      starred: false,
      category: 'personal',
      createdAt: new Date().toISOString(),
      ...taskData
    };
  }
};
