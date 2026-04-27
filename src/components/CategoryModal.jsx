import { useState } from 'react';
import { X, Tag } from 'lucide-react';

const CategoryModal = ({ isOpen, onClose, onSave }) => {
  const [label, setLabel] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSave({ label: label.trim() });
    setLabel('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-on-surface">New List</h3>
              <button onClick={onClose} type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-on-variant/40 group-focus-within:text-google-blue transition-colors">
                  <Tag size={20} />
                </div>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Enter list name"
                  className="w-full text-lg border-none focus:ring-0 pl-8 p-0 placeholder:text-gray-400 bg-transparent"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <p className="text-xs text-on-variant italic">
                A random Google-inspired color will be auto-assigned to this list.
              </p>
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
              disabled={!label.trim()}
              className="px-6 py-2 bg-google-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
