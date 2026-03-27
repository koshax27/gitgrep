// app/error-dashboard/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertOctagon, X, Trash2 } from "lucide-react";

interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  url?: string;
}

export default function ErrorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [errors, setErrors] = useState<ErrorLog[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.email !== "koshax27@gmail.com") {
      router.push("/");
      return;
    }
    
    const stored = localStorage.getItem('gitgrep-errors');
    if (stored) {
      setErrors(JSON.parse(stored));
    }
  }, [session, status, router]);

  const clearErrors = () => {
    localStorage.removeItem('gitgrep-errors');
    setErrors([]);
  };

  if (!session || session.user?.email !== "koshax27@gmail.com") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#020408] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">⚠️ Error Dashboard</h1>
            <p className="text-slate-400">Monitor application errors</p>
          </div>
          <button onClick={clearErrors} className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400 text-sm">Clear All</button>
        </div>

        {errors.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No errors logged</div>
        ) : (
          <div className="space-y-4">
            {errors.map((error, i) => (
              <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-red-400"><AlertOctagon size={16} /> Error</div>
                  <span className="text-xs text-slate-500">{new Date(error.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-white text-sm mb-2">{error.message}</p>
                {error.url && <p className="text-xs text-slate-500">URL: {error.url}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}