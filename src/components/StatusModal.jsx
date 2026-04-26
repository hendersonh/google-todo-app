import React from 'react';
import { Lock, X } from 'lucide-react';

const StatusModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-google-red/10 rounded-2xl flex items-center justify-center text-google-red mb-6">
            <Lock size={32} />
          </div>
          
          <h3 className="text-xl font-medium text-on-surface mb-2">
            {title}
          </h3>
          
          <p className="text-on-variant leading-relaxed mb-8">
            {message}
          </p>
          
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-on-surface text-white rounded-xl font-medium hover:bg-on-surface/90 active:scale-95 transition-all shadow-lg shadow-gray-200"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
