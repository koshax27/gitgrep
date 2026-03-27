"use client";

import { useState, useEffect } from "react";
import { X, AlertOctagon, Trash2, RefreshCw } from "lucide-react";
import { useErrorMonitor } from '../../hooks/useErrorMonitor'
interface ErrorLog {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  stack?: string;
  url?: string;
}
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};
export default function ErrorDashboard() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/error-monitor');
      const data = await res.json();
      setErrors(data.errors || []);
    } catch (error) {
      console.error("Failed to fetch errors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
    // تحديث كل 10 ثواني
    const interval = setInterval(fetchErrors, 10000);
    return () => clearInterval(interval);
  }, []);

  const clearErrors = async () => {
    if (confirm("Are you sure you want to clear all errors?")) {
      // مؤقتًا: نقدر نمسح من الـ API
      setErrors([]);
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'javascript': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'promise': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'console': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <AlertOctagon size={32} className="text-red-500" />
              Error Monitor Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track and monitor application errors in real-time
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchErrors}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-all"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={clearErrors}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-red-400 text-sm transition-all"
            >
              <Trash2 size={16} /> Clear All
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{errors.length}</div>
            <div className="text-xs text-slate-500">Total Errors</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400">
              {errors.filter(e => e.type === 'javascript').length}
            </div>
            <div className="text-xs text-slate-500">JavaScript Errors</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {errors.filter(e => e.type === 'promise').length}
            </div>
            <div className="text-xs text-slate-500">Promise Rejections</div>
          </div>
        </div>

        {/* Errors List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-500 mt-4">Loading errors...</p>
          </div>
        ) : errors.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-slate-500">No errors detected. Everything is running smoothly!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {errors.map((error) => (
              <div
                key={error.id}
                onClick={() => setSelectedError(error)}
                className={`border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] ${getTypeColor(error.type)} bg-white/5`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getTypeColor(error.type)}`}>
                      {error.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-mono text-white/90">{error.message}</p>
                {error.url && (
                  <p className="text-xs text-slate-500 mt-2 truncate">📍 {error.url}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal for error details */}
        {selectedError && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertOctagon size={20} className="text-red-500" />
                  Error Details
                </h3>
                <button onClick={() => setSelectedError(null)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 text-xs uppercase">Type</span>
                  <p className="text-white mt-1">{selectedError.type}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase">Timestamp</span>
                  <p className="text-white mt-1">{new Date(selectedError.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase">Message</span>
                  <p className="text-white mt-1 font-mono text-sm">{selectedError.message}</p>
                </div>
                {selectedError.url && (
                  <div>
                    <span className="text-slate-400 text-xs uppercase">URL</span>
                    <p className="text-white mt-1 text-sm break-all">{selectedError.url}</p>
                  </div>
                )}
                {selectedError.stack && (
                  <div>
                    <span className="text-slate-400 text-xs uppercase">Stack Trace</span>
                    <pre className="mt-2 p-3 bg-black/50 rounded-xl text-xs text-slate-300 overflow-x-auto font-mono">
                      {selectedError.stack}
                    </pre>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 py-2 rounded-xl text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}