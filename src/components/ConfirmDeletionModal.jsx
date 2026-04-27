import { Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const ConfirmDeletionModal = ({ isOpen, onClose, onConfirm, title }) => {
  const [inputValue, setInputValue] = useState('');

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = inputValue.toLowerCase() === 'yes';

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-on-variant"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-google-red/10 rounded-2xl flex items-center justify-center text-google-red mb-6">
            <Trash2 size={32} />
          </div>
          
          <h3 className="text-xl font-medium text-on-surface mb-2">
            Confirm Deletion
          </h3>
          
          <p className="text-on-variant text-sm leading-relaxed mb-6">
            Are you sure you want to delete <span className="font-bold text-on-surface">"{title}"</span>? This action cannot be undone.
          </p>

          <div className="w-full space-y-4">
            <div className="text-left">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-variant/60 ml-1">
                Type "yes" to confirm
              </label>
              <input
                autoFocus
                type="text"
                placeholder='Type "yes" here'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full mt-1 bg-gray-50 border-2 border-transparent focus:border-google-red focus:bg-white p-3 rounded-xl outline-none transition-all text-center font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              />
            </div>
            
            <button
              onClick={handleConfirm}
              disabled={!isConfirmed}
              className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                isConfirmed 
                ? 'bg-google-red text-white shadow-red-100 hover:bg-red-600' 
                : 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
              }`}
            >
              Delete Forever
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletionModal;
