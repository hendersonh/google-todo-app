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
  ChevronRight
} from 'lucide-react';
import { TaskService } from './services/TaskService';
import AddTaskModal from './components/AddTaskModal';
import TimelineView from './components/TimelineView';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setTasks(TaskService.getTasks());
  }, []);

  const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    const updated = TaskService.updateTask(id, { completed: !task.completed });
    setTasks(updated);
  };

  const toggleStar = (id) => {
    const task = tasks.find(t => t.id === id);
    const updated = TaskService.updateTask(id, { starred: !task.starred });
    setTasks(updated);
  };

  const deleteTask = (id) => {
    const updated = TaskService.deleteTask(id);
    setTasks(updated);
  };

  const addTask = (taskData) => {
    const newTask = TaskService.addTask(taskData);
    setTasks([newTask, ...tasks]);
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return !task.completed;
    if (activeTab === 'starred') return task.starred;
    if (activeTab === 'completed') return task.completed;
    return true;
  });

  const sidebarItems = [
    { id: 'all', label: 'My Tasks', icon: ListTodo },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
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
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h2>
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
                        {task.details && (
                          <p className="text-sm text-on-variant mt-1.5 leading-relaxed">
                            {task.details}
                          </p>
                        )}
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
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-10 right-10 w-16 h-16 bg-google-blue text-white rounded-[20px] shadow-2xl shadow-blue-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10 group"
        >
          <Plus size={36} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </main>

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addTask} 
      />
    </div>
  );
};

export default App;
