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
  RotateCcw,
  LogOut,
  User
} from 'lucide-react';
import { TaskService } from './services/TaskService';
import TaskModal from './components/TaskModal';
import CategoryModal from './components/CategoryModal';
import TimelineView from './components/TimelineView';
import StatsDashboard from './components/StatsDashboard';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([
    { id: 'personal', label: 'Personal', color: '#4285F4' },
    { id: 'work', label: 'Work', color: '#34A853' },
    { id: 'urgent', label: 'Urgent', color: '#EA4335' },
    { id: 'shopping', label: 'Shopping', color: '#FBBC05' },
  ]);
  
  // Dynamic Categories Listener
  useEffect(() => {
    if (user) {
      const unsubscribe = TaskService.subscribeToCategories(user.uid, (dynamicCats) => {
        // If user has custom categories, we can either append them or replace the defaults
        // For now, let's keep the defaults and append dynamic ones
        const defaults = [
          { id: 'personal', label: 'Personal', color: '#4285F4' },
          { id: 'work', label: 'Work', color: '#34A853' },
          { id: 'urgent', label: 'Urgent', color: '#EA4335' },
          { id: 'shopping', label: 'Shopping', color: '#FBBC05' },
        ];
        setCategories([...defaults, ...dynamicCats]);
      });
      return () => unsubscribe();
    } else {
      // Revert to defaults if signed out
      setCategories([
        { id: 'personal', label: 'Personal', color: '#4285F4' },
        { id: 'work', label: 'Work', color: '#34A853' },
        { id: 'urgent', label: 'Urgent', color: '#EA4335' },
        { id: 'shopping', label: 'Shopping', color: '#FBBC05' },
      ]);
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // ... rest of the state ...


  // Subscribe to real-time Firestore updates and Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const unsubscribeTasks = TaskService.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTasks();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const toggleTask = async (task) => {
    if (!user || task.userId !== user.uid) return;
    const isCompleting = !task.completed;
    await TaskService.updateTask(task.id, { completed: isCompleting });

    // Handle Recurrence
    if (isCompleting && task.recurrence && task.recurrence !== 'none') {
      const nextTaskData = TaskService.handleRecurrence(task);
      if (nextTaskData) {
        await TaskService.addTask({
          ...nextTaskData,
          userId: user.uid,
          ownerName: user.displayName
        });
      }
    }
  };

  const toggleStar = async (id, currentStarred, userId) => {
    if (!user || userId !== user.uid) return;
    await TaskService.updateTask(id, { starred: !currentStarred });
  };

  const deleteTask = async (id, userId) => {
    if (!user || userId !== user.uid) return;
    await TaskService.deleteTask(id);
  };

  const handleSaveTask = async (taskData) => {
    if (!user) return;
    const data = {
      ...taskData,
      userId: user.uid,
      ownerName: user.displayName
    };

    if (data.id) {
      await TaskService.updateTask(data.id, data);
    } else {
      await TaskService.addTask(data);
    }
    setEditingTask(null);
  };

  const handleSaveCategory = async (categoryData) => {
    if (!user) return;
    try {
      await TaskService.addCategory({ 
        ...categoryData, 
        ownerUid: user.uid 
      });
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
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
    
    // Category filtering - check if activeTab exists in our categories list
    if (categories.some(cat => cat.id === activeTab)) {
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

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-google-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-on-variant animate-pulse">Loading Tasks...</p>
      </div>
    </div>;
  }

  return (
    <div className="flex h-screen bg-surface w-full overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`relative flex flex-col h-full bg-surface transition-all duration-300 ease-in-out border-r border-gray-100 ${isSidebarOpen ? 'w-72' : 'w-0 opacity-0 overflow-hidden'}`}>
        {/* Sidebar Header (Pinned) */}
        <div className="p-6 flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-google-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Tasks</h1>
        </div>
        
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto google-scrollbar px-2 py-2">
          <nav className="flex flex-col gap-1 pr-2">
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

            <div className="mt-8 px-4 mb-2 flex items-center justify-between group/list-header">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-variant/50">My Lists</p>
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors opacity-40 group-hover/list-header:opacity-100 text-on-variant" 
                title="Create New List"
              >
                <Plus size={14} />
              </button>
            </div>
            
            {categories.map(cat => (
              <div 
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`google-sidebar-item ${activeTab === cat.id ? 'active' : ''}`}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: cat.color }} 
                />
                <span className="flex-1">{cat.label}</span>
                <span className="text-[10px] opacity-50 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {tasks.filter(t => t.category === cat.id && !t.completed).length}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Auth Footer (Pinned at bottom) */}
        <div className="p-4 border-t border-gray-100 bg-surface">
          {user ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              {user.photoURL ? (
                <img src={user.photoURL} alt="profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
              ) : (
                <div className="w-10 h-10 bg-google-blue rounded-full flex items-center justify-center text-white">
                  <User size={20} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                <button 
                  onClick={handleSignOut}
                  className="text-[10px] text-google-red font-bold uppercase tracking-wider hover:underline"
                >
                  Sign Out
                </button>
              </div>
              <LogOut size={16} className="text-on-variant cursor-pointer" onClick={handleSignOut} />
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="px-2">
                <p className="text-sm font-semibold text-on-surface">Welcome to Tasks</p>
              </div>
              <button 
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-50 hover:border-google-blue/30 hover:shadow-lg hover:shadow-blue-50/50 transition-all active:scale-[0.98] group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-google-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" className="w-5 h-5 relative z-10" />
                <span className="relative z-10 text-on-surface">Sign in with Google</span>
              </button>
            </div>
          )}
        </div>
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
            <TimelineView tasks={tasks} onTaskClick={openEditModal} />
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
                        onClick={(e) => { e.stopPropagation(); toggleTask(task); }}
                        className={`mt-1 transition-transform active:scale-90 ${task.completed ? 'text-google-blue' : 'text-on-variant'}`}
                      >
                        {task.completed ? <CheckCircle2 size={26} /> : <Circle size={26} strokeWidth={1.5} />}
                      </button>
                      
                      <div className="flex-1 pt-0.5">
                        {(() => {
                          const todayStr = new Date().toISOString().split('T')[0];
                          const isOverdue = task.dueDate && !task.completed && task.dueDate < todayStr;
                          return (
                            <p className={`text-lg transition-all ${
                              task.completed ? 'line-through text-on-variant/50' : 
                              isOverdue ? 'text-google-red font-medium' : 'text-on-surface'
                            }`}>
                              {task.title}
                            </p>
                          );
                        })()}
                        <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                          {task.category && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white`}
                            style={{ backgroundColor: categories.find(c => c.id === task.category)?.color || '#4285F4' }}>
                              {categories.find(c => c.id === task.category)?.label || task.category}
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
                        
                        {/* Owner Indicator */}
                        {task.ownerName && (
                          <div className="mt-3 flex items-center gap-2 opacity-50">
                            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-500">
                              {task.ownerName[0]}
                            </div>
                            <span className="text-[10px] font-medium">Created by {task.userId === user?.uid ? 'You' : task.ownerName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleStar(task.id, task.starred, task.userId); }}
                          disabled={!user || task.userId !== user.uid}
                          className={`p-2 rounded-full transition-colors ${task.starred ? 'text-yellow-500' : 'text-on-variant opacity-0 group-hover:opacity-100'} ${(!user || task.userId !== user.uid) ? 'cursor-default' : 'hover:bg-gray-200'}`}
                        >
                          <Star size={20} fill={task.starred ? 'currentColor' : 'none'} />
                        </button>
                        {user && task.userId === user.uid && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.id, task.userId); }}
                            className="p-2 text-on-variant hover:text-google-red hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FAB */}
        {user && (
          <button 
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="absolute bottom-10 right-10 w-16 h-16 bg-google-blue text-white rounded-[20px] shadow-2xl shadow-blue-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10 group"
          >
            <Plus size={36} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        onSave={handleSaveTask} 
        initialData={editingTask}
        categories={categories}
        isReadOnly={editingTask?.userId ? editingTask.userId !== user?.uid : !user}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default App;
