const STORAGE_KEY = 'google_todo_tasks';

export const TaskService = {
  getTasks: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTasks: (tasks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  addTask: (task) => {
    const tasks = TaskService.getTasks();
    const newTask = {
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
      ...task
    };
    TaskService.saveTasks([newTask, ...tasks]);
    return newTask;
  },

  updateTask: (id, updates) => {
    const tasks = TaskService.getTasks();
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    TaskService.saveTasks(updatedTasks);
    return updatedTasks;
  },

  deleteTask: (id) => {
    const tasks = TaskService.getTasks();
    const updatedTasks = tasks.filter(t => t.id !== id);
    TaskService.saveTasks(updatedTasks);
    return updatedTasks;
  }
};
