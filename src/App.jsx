import { useState, useEffect, useRef } from 'react';
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
  Search,
  BarChart3,
  RotateCcw,
  LogOut,
  User,
  Lock
} from 'lucide-react';
import { TaskService } from './services/TaskService';
import TaskModal from './components/TaskModal';
import CategoryModal from './components/CategoryModal';
import TimelineView from './components/TimelineView';
import StatsDashboard from './components/StatsDashboard';
import StatusModal from './components/StatusModal';
import ConfirmDeletionModal from './components/ConfirmDeletionModal';
import { auth, googleProvider } from './firebase';
import {
  signInWithPopup,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

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
        const defaults = [
          { id: 'personal', label: 'Personal', color: '#4285F4' },
          { id: 'work', label: 'Work', color: '#34A853' },
          { id: 'urgent', label: 'Urgent', color: '#EA4335' },
          { id: 'shopping', label: 'Shopping', color: '#FBBC05' },
        ];
        const uniqueDynamic = dynamicCats.filter(d => !defaults.some(def => def.id === d.id));
        setCategories([...defaults, ...uniqueDynamic]);
      });
      return () => unsubscribe();
    } else {
      setCategories([]);
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState({ isOpen: false, title: '', message: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  const [error, setError] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [deletionConfirm, setDeletionConfirm] = useState({ isOpen: false, taskId: null, taskTitle: '' });

  // ... rest of the state ...


  // Subscribe to real-time Firestore updates and Auth state
  // Subscribe to auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthResolved(true);
      if (!currentUser) {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Subscribe to tasks when user changes
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Safety timeout: If loading takes > 10s, something might be wrong
    const timeoutId = setTimeout(() => {
      if (loadingRef.current) {
        console.warn("Loading tasks timed out. Check network or Firestore indexes.");
        setLoading(false);
        setError("Sync is taking longer than expected. Please check your connection.");
      }
    }, 10000);

    const unsubscribeTasks = TaskService.subscribeToTasks(user.uid, (updatedTasks) => {
      clearTimeout(timeoutId);
      setTasks(updatedTasks);
      setLoading(false);
      setError(null);
    });

    return () => {
      unsubscribeTasks();
      clearTimeout(timeoutId);
    };
  }, [user]);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Sign in failed. Please try again.");
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    try {
      // Always try to sign in first
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
    } catch (err) {
      // If user doesn't exist, try to sign them up automatically
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, authEmail, authPassword);
          return; // Success
        } catch (signUpErr) {
          console.error("Auto-signup error:", signUpErr);
          let message = "Failed to create account.";
          if (signUpErr.code === 'auth/email-already-in-use') message = "This email is already registered.";
          if (signUpErr.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
          if (signUpErr.code === 'auth/invalid-email') message = "Invalid email format.";
          setError(message);
        }
      } else {
        console.error("Auth error:", err);
        let message = "Authentication failed.";
        if (err.code === 'auth/wrong-password') message = "Incorrect password.";
        if (err.code === 'auth/invalid-email') message = "Invalid email format.";
        setError(message);
      }
    } finally {
      setAuthLoading(false);
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
    if (task.userId !== user.uid) {
      setStatusModal({
        isOpen: true,
        title: 'Access Restricted',
        message: 'You cannot modify tasks owned by other users.'
      });
      return;
    }
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

  const toggleStar = async (e, task) => {
    e.stopPropagation();
    if (task.userId !== user.uid) {
      setStatusModal({
        isOpen: true,
        title: 'Access Restricted',
        message: 'You cannot modify tasks owned by other users.'
      });
      return;
    }
    try {
      await TaskService.updateTask(task.id, { starred: !task.starred });
    } catch (error) {
      console.error("Error toggling star", error);
    }
  };

  const deleteTask = async (id, title, userId) => {
    if (!user || userId !== user.uid) return;
    setDeletionConfirm({ isOpen: true, taskId: id, taskTitle: title });
  };

  const confirmDelete = async () => {
    if (deletionConfirm.taskId) {
      await TaskService.deleteTask(deletionConfirm.taskId);
      setDeletionConfirm({ isOpen: false, taskId: null, taskTitle: '' });
    }
  };

  const handleSaveTask = async (taskData) => {
    if (!user) return;
    const data = {
      ...taskData,
      userId: user.uid,
      ownerName: user.displayName || user.email || 'Anonymous'
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
      (task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.details && task.details.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'all') return !task.completed;
    if (activeTab === 'starred') return task.starred && !task.completed;
    if (activeTab === 'completed') return task.completed;
    if (activeTab === 'schedule') return !task.completed;
    if (activeTab === 'insights') return true;

    // Category filtering - check if activeTab exists in our categories list
    if (categories.some(cat => cat.id === activeTab)) {
      return task.category === activeTab && !task.completed;
    }

    return true;
  });

  const sidebarItems = [
    { id: 'all', label: 'All Active Tasks', icon: ListTodo },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  if (!authResolved || (user && loading)) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-google-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-on-variant animate-pulse">Loading...</p>
      </div>
    </div>;
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-surface flex items-center justify-center p-6 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-50/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-xl w-full text-center space-y-12 relative z-10">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-google-blue rounded-[28px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-100 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-bold tracking-tight text-on-surface">Organize your life</h1>
              <p className="text-xl text-on-variant font-light">Simplify your day with the world&apos;s most elegant todo app.</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl shadow-blue-50 border border-white/50 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-sm font-medium text-on-variant/60 uppercase tracking-widest">
                <div className="h-[1px] w-8 bg-gray-200" />
                <span>Sign in or Sign up</span>
                <div className="h-[1px] w-8 bg-gray-200" />
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Email address"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-google-blue focus:bg-white p-4 rounded-2xl outline-none transition-all"
                  required
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-google-blue focus:bg-white p-4 rounded-2xl outline-none transition-all"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-google-blue text-white py-4 px-6 rounded-2xl font-bold hover:bg-blue-600 transition-all active:scale-[0.98] shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 text-sm text-on-variant/40">
              <div className="h-[1px] flex-1 bg-gray-100" />
              <span>or</span>
              <div className="h-[1px] flex-1 bg-gray-100" />
            </div>

            <button
              onClick={handleSignIn}
              className="w-full group relative flex items-center justify-center gap-4 bg-white border-2 border-gray-100 py-4 px-6 rounded-2xl font-semibold text-on-surface hover:bg-gray-50 hover:border-google-blue/30 transition-all active:scale-[0.98]"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <span>Continue with Google</span>
            </button>

            <p className="text-xs text-on-variant/50 leading-relaxed">
              By signing in, you agree to our <span className="underline cursor-pointer hover:text-on-variant">Terms of Service</span> and <span className="underline cursor-pointer hover:text-on-variant">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface p-8">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-red-50 text-google-red rounded-full flex items-center justify-center mx-auto">
          <RotateCcw size={40} className="animate-spin-slow" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-on-surface">Connection Slow</h3>
          <p className="text-sm text-on-variant leading-relaxed">
            {error}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-google-blue text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all active:scale-95"
        >
          Retry Connection
        </button>
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
                <span className="text-[10px] opacity-50 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {item.id === 'all' ? tasks.filter(t => !t.completed).length :
                    item.id === 'starred' ? tasks.filter(t => t.starred && !t.completed).length :
                      item.id === 'completed' ? tasks.filter(t => t.completed).length :
                        item.id === 'schedule' ? tasks.filter(t => !t.completed).length : 0}
                </span>
              </div>
            ))}

            <div className="mt-8 px-4 mb-2 flex items-center justify-between group/list-header">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-variant/50">My Lists</p>
              {user && (
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors opacity-40 group-hover/list-header:opacity-100 text-on-variant"
                  title="Create New List"
                >
                  <Plus size={14} />
                </button>
              )}
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
                <span className="flex-1 truncate">{cat.label}</span>
                {cat.ownerUid && cat.ownerUid !== user.uid && (
                  <Lock size={12} className="text-on-variant/30" title="Shared List" />
                )}
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
                <p className="text-sm font-medium truncate">{user.displayName || user.email}</p>
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
                        <div className="flex items-center gap-2">
                          <p className={`text-lg transition-all ${
                            task.completed 
                              ? 'line-through text-on-variant/50' 
                              : (task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0)) 
                                  ? 'text-google-red font-medium' 
                                  : 'text-on-surface')
                          }`}>
                            {task.title}
                          </p>
                          {task.userId !== user.uid && (
                            <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-on-variant/40 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                              <Lock size={10} />
                              {task.ownerName ? `Shared by ${task.ownerName.split('@')[0]}` : 'Shared'}
                            </span>
                          )}
                        </div>
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
                          onClick={(e) => toggleStar(e, task)}
                          className={`p-2 rounded-full transition-colors ${task.starred ? 'text-yellow-500' : 'text-on-variant opacity-0 group-hover:opacity-100'} hover:bg-gray-200`}
                        >
                          <Star size={20} fill={task.starred ? 'currentColor' : 'none'} />
                        </button>
                        {user && task.userId === user.uid && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.id, task.title, task.userId); }}
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
        onDelete={deleteTask}
        onToggleComplete={toggleTask}
        initialData={editingTask}
        categories={categories}
        isReadOnly={editingTask && editingTask.userId !== user.uid}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />

      <StatusModal
        isOpen={statusModal.isOpen}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
      />

      <ConfirmDeletionModal
        isOpen={deletionConfirm.isOpen}
        title={deletionConfirm.taskTitle}
        onClose={() => setDeletionConfirm({ ...deletionConfirm, isOpen: false })}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default App;
