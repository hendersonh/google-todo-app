import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Star, Tag } from 'lucide-react';

const CATEGORIES = [
  { id: 'personal', label: 'Personal', color: 'bg-google-blue' },
  { id: 'work', label: 'Work', color: 'bg-google-green' },
  { id: 'urgent', label: 'Urgent', color: 'bg-google-red' },
  { id: 'shopping', label: 'Shopping', color: 'bg-google-yellow' },
];

const TaskModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [starred, setStarred] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('personal');
  
  const dateInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDetails(initialData.details || '');
      setStarred(initialData.starred || false);
      setDueDate(initialData.dueDate || '');
      setCategory(initialData.category || 'personal');
    } else {
      setTitle('');
      setDetails('');
      setStarred(false);
      setDueDate('');
      setCategory('personal');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ 
      ...initialData,
      title, 
      details, 
      starred,
      dueDate,
      category
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">{initialData?.id ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={onClose} type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input 
                autoFocus
                type="text" 
                placeholder="What needs to be done?"
                className="w-full text-lg border-none focus:ring-0 p-0 placeholder:text-gray-400 bg-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <textarea 
                placeholder="Add details"
                className="w-full text-sm border-none focus:ring-0 p-0 placeholder:text-gray-400 resize-none bg-transparent"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-on-variant uppercase tracking-wider mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        category === cat.id 
                          ? `${cat.color} text-white ring-2 ring-offset-2 ring-gray-100` 
                          : 'bg-gray-50 text-on-variant hover:bg-gray-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setStarred(!starred)}
                  className={`p-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${starred ? 'bg-yellow-50 text-yellow-600' : 'hover:bg-gray-50 text-on-variant'}`}
                >
                  <Star size={18} fill={starred ? 'currentColor' : 'none'} />
                  <span>Important</span>
                </button>
                
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
                    className={`p-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${dueDate ? 'bg-blue-50 text-google-blue' : 'hover:bg-gray-50 text-on-variant'}`}
                  >
                    <Calendar size={18} />
                    <span>{dueDate ? new Date(dueDate).toLocaleDateString() : 'Add date'}</span>
                  </button>
                  <input 
                    ref={dateInputRef}
                    type="date" 
                    className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-on-variant hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2 bg-google-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              {initialData?.id ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
