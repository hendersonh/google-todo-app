import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ListTodo, 
  Star, 
  Trash2,
  Clock,
  MoreVertical,
  ChevronRight,
  Search,
  TrendingUp,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import { TaskService } from './services/TaskService';
import TaskModal from './components/TaskModal';
import TimelineView from './components/TimelineView';
import StatsDashboard from './components/StatsDashboard';

const App = () => {
  // Initialize state directly from LocalStorage (Single Source of Truth)
  const [tasks, setTasks] = useState(() => TaskService.getTasks());
  const [activeTab, setActiveTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist tasks whenever they change
  useEffect(() => {
    TaskService.saveTasks(tasks);
  }, [tasks]);

  // Sync between tabs (Multi-tab support)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'google_todo_tasks') {
        setTasks(TaskService.getTasks());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTask = (id) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;

      const isCompleting = !task.completed;
      let newTasks = prev.map(t => t.id === id ? { ...t, completed: isCompleting } : t);

      // Handle Recurrence
      if (isCompleting && task.recurrence && task.recurrence !== 'none') {
        const nextTask = TaskService.handleRecurrence(task);
        if (nextTask) {
          newTasks = [nextTask, ...newTasks];
        }
      }

      return newTasks;
    });
  };

  const toggleStar = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveTask = (taskData) => {
    if (taskData.id) {
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } : t));
    } else {
      const newTask = TaskService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
    }
    setEditingTask(null);
  };

  const openEditModal = (task) => {
    if (!task.completed) {
      setEditingTask(task);
      setIsModalOpen(true);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (task.details && task.details.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'all') return !task.completed;
    if (activeTab === 'starred') return task.starred;
    if (activeTab === 'completed') return task.completed;
    if (activeTab === 'schedule') return true;
    if (activeTab === 'insights') return true;
    
    // Category filtering
    if (['personal', 'work', 'urgent', 'shopping'].includes(activeTab)) {
      return task.category === activeTab && !task.completed;
    }
    
    return true;
  });

  const sidebarItems = [
    { id: 'all', label: 'My Tasks', icon: ListTodo },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  const categories = [
    { id: 'personal', label: 'Personal', color: 'bg-google-blue' },
    { id: 'work', label: 'Work', color: 'bg-google-green' },
    { id: 'urgent', label: 'Urgent', color: 'bg-google-red' },
    { id: 'shopping', label: 'Shopping', color: 'bg-google-yellow' },
  ];

  return (
    <div className="flex h-screen bg-surface w-full overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`bg-surface transition-all duration-300 ease-in-out border-r border-gray-100 ${isSidebarOpen ? 'w-72' : 'w-0 opacity-0'}`}>
        <div className="p-6 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-google-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Tasks</h1>
        </div>
        
        <nav className="flex flex-col gap-1 pr-4">
          {sidebarItems.map(item => (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`google-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} fill={activeTab === item.id && item.id === 'starred' ? 'currentColor' : 'none'} />
              <span className="flex-1">{item.label}</span>
              {activeTab === item.id && <ChevronRight size={16} className="opacity-50" />}
            </div>
          ))}

          <div className="mt-8 px-4 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-variant/50">My Lists</p>
          </div>
          
          {categories.map(cat => (
            <div 
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`google-sidebar-item ${activeTab === cat.id ? 'active' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full ${cat.color}`} />
              <span className="flex-1">{cat.label}</span>
              <span className="text-[10px] opacity-50 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {tasks.filter(t => t.category === cat.id && !t.completed).length}
              </span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {/* Header */}
        <header className="h-20 flex items-center px-8 border-b border-gray-50 justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-on-variant"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-2xl font-medium text-on-surface">
              {sidebarItems.find(i => i.id === activeTab)?.label || categories.find(c => c.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex-1 max-w-2xl mx-12">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-variant/50 group-focus-within:text-google-blue transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-variant/50 border-none rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-google-blue/20 transition-all placeholder:text-on-variant/40"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-gray-50 rounded-full px-4 py-2 text-sm text-on-variant">
              {tasks.filter(t => !t.completed).length} pending tasks
            </div>
            <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-on-variant">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white flex flex-col">
          {activeTab === 'schedule' ? (
            <TimelineView tasks={tasks} />
          ) : activeTab === 'insights' ? (
            <div className="max-w-4xl mx-auto w-full">
              <StatsDashboard tasks={tasks} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full py-10 px-8">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-on-variant/30 animate-in fade-in duration-700">
                  <CheckCircle2 size={120} strokeWidth={0.5} />
                  <p className="mt-6 text-xl font-light">Nothing here. Enjoy your day!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => openEditModal(task)}
                      className="group flex items-start gap-5 p-5 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer border-b border-gray-50/50"
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                        className={`mt-1 transition-transform active:scale-90 ${task.completed ? 'text-google-blue' : 'text-on-variant'}`}
                      >
                        {task.completed ? <CheckCircle2 size={26} /> : <Circle size={26} strokeWidth={1.5} />}
                      </button>
                      
                      <div className="flex-1 pt-0.5">
                        <p className={`text-lg transition-all ${task.completed ? 'line-through text-on-variant/50' : 'text-on-surface'}`}>
                          {task.title}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                          {task.category && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${
                              task.category === 'work' ? 'bg-google-green' :
                              task.category === 'urgent' ? 'bg-google-red' :
                              task.category === 'shopping' ? 'bg-google-yellow' :
                              'bg-google-blue'
                            }`}>
                              {task.category}
                            </span>
                          )}
                          {task.recurrence && task.recurrence !== 'none' && (
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-on-variant/50 bg-gray-100 px-2 py-0.5 rounded-full">
                              <RotateCcw size={10} />
                              <span>{task.recurrence}</span>
                            </div>
                          )}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-google-blue bg-blue-50 px-2 py-0.5 rounded-full">
                              <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} sub-tasks</span>
                            </div>
                          )}
                          {task.details && (
                            <p className="text-sm text-on-variant leading-relaxed">
                              {task.details}
                            </p>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-2 text-xs font-medium text-google-blue mt-3 bg-blue-50 w-fit px-2 py-1 rounded-md">
                            <Clock size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleStar(task.id); }}
                          className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${task.starred ? 'text-yellow-500' : 'text-on-variant opacity-0 group-hover:opacity-100'}`}
                        >
                          <Star size={20} fill={task.starred ? 'currentColor' : 'none'} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                          className="p-2 text-on-variant hover:text-google-red hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FAB */}
        <button 
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          className="absolute bottom-10 right-10 w-16 h-16 bg-google-blue text-white rounded-[20px] shadow-2xl shadow-blue-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10 group"
        >
          <Plus size={36} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        onSave={handleSaveTask} 
        initialData={editingTask}
      />
    </div>
  );
};

export default App;
