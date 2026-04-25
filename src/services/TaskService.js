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
      recurrence: 'none',
      createdAt: new Date().toISOString(),
      ...taskData
    };
  },

  handleRecurrence: (task) => {
    if (!task.recurrence || task.recurrence === 'none') return null;

    const nextDate = new Date(task.dueDate || new Date());
    if (task.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    else if (task.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (task.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

    const nextTask = TaskService.createTask({
      title: task.title,
      details: task.details,
      category: task.category,
      starred: task.starred,
      recurrence: task.recurrence,
      dueDate: nextDate.toISOString().split('T')[0]
    });

    return nextTask;
  }
};
