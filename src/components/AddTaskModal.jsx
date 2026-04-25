import React, { useState } from 'react';
import { X, Calendar, Clock, Star } from 'lucide-react';

const AddTaskModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [starred, setStarred] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, details, starred });
    setTitle('');
    setDetails('');
    setStarred(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">New Task</h3>
              <button onClick={onClose} type="button" className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input 
                autoFocus
                type="text" 
                placeholder="What needs to be done?"
                className="w-full text-lg border-none focus:ring-0 p-0 placeholder:text-gray-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <textarea 
                placeholder="Add details"
                className="w-full text-sm border-none focus:ring-0 p-0 placeholder:text-gray-400 resize-none"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setStarred(!starred)}
                  className={`p-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${starred ? 'bg-yellow-50 text-yellow-600' : 'hover:bg-gray-50 text-on-variant'}`}
                >
                  <Star size={18} fill={starred ? 'currentColor' : 'none'} />
                  <span>Important</span>
                </button>
                <button type="button" className="p-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-on-variant text-sm">
                  <Calendar size={18} />
                  <span>Add date</span>
                </button>
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
