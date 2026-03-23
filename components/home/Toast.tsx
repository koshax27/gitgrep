"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Zap, X } from "lucide-react";

export function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-gradient-to-r from-green-500 to-emerald-500 border-green-400",
    error: "bg-gradient-to-r from-red-500 to-rose-500 border-red-400",
    info: "bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400",
  };

  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <AlertTriangle size={20} />,
    info: <Zap size={20} />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999999] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className={`${colors[type]} border rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center gap-3 min-w-[280px]`}
      >
        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">{icons[type]}</div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{message}</p>
          <p className="text-white/60 text-[10px] font-mono mt-0.5">
            GitGrep • {new Date().toLocaleTimeString()}
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-white/50 hover:text-white transition-all">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
