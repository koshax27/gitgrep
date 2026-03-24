'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-400" />,
    error: <AlertCircle size={18} className="text-red-400" />,
    info: <Info size={18} className="text-blue-400" />,
  };

  const bgColors = {
    success: 'bg-gray-900 border-green-500/30',
    error: 'bg-gray-900 border-red-500/30',
    info: 'bg-gray-900 border-blue-500/30',
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 ${bgColors[type]} border rounded-xl p-3 sm:p-4 shadow-xl z-50 animate-in slide-in-from-bottom-4 fade-in duration-300`}>
      <div className="flex items-center gap-3">
        {icons[type]}
        <p className="text-sm text-white flex-1">{message}</p>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-all">
          <X size={14} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
}