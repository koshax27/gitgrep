// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, X, Download, Trash2, Mail, Calendar, BarChart3 } from "lucide-react";

interface Feedback {
  rating: number;
  category: string;
  feedback: string;
  email?: string;
  timestamp: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.email !== "koshax27@gmail.com") {
      router.push("/");
      return;
    }
    
    const stored = localStorage.getItem('gitgrep-feedback');
    if (stored) {
      setFeedbacks(JSON.parse(stored));
    }
    setLoading(false);
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!session || session.user?.email !== "koshax27@gmail.com") {
    return null;
  }

  const stats = {
    total: feedbacks.length,
    averageRating: feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0,
    categories: {
      bug: feedbacks.filter(f => f.category === 'bug').length,
      feature: feedbacks.filter(f => f.category === 'feature').length,
      ui: feedbacks.filter(f => f.category === 'ui').length,
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter === 'all') return true;
    return f.category === filter;
  });

  const exportData = () => {
    const dataStr = JSON.stringify(feedbacks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gitgrep-feedback-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (confirm("Are you sure you want to delete all feedback?")) {
      localStorage.removeItem('gitgrep-feedback');
      setFeedbacks([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">📋 Feedback Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Monitor and manage user feedback</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-white text-sm transition-all">
              <Download size={16} /> Export
            </button>
            <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-red-400 text-sm transition-all">
              <Trash2 size={16} /> Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={20} className="text-blue-400" />
              <span className="text-slate-400 text-xs uppercase">Total Feedback</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Star size={20} className="text-yellow-500" />
              <span className="text-slate-400 text-xs uppercase">Average Rating</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.averageRating} / 5</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail size={20} className="text-purple-400" />
              <span className="text-slate-400 text-xs uppercase">With Email</span>
            </div>
            <div className="text-3xl font-bold text-white">{feedbacks.filter(f => f.email).length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase">Categories</span>
            </div>
            <div className="text-sm text-white">🐛 {stats.categories.bug} | 💡 {stats.categories.feature} | 🎨 {stats.categories.ui}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { value: "all", label: "All", count: stats.total },
            { value: "bug", label: "🐛 Bug", count: stats.categories.bug },
            { value: "feature", label: "💡 Feature", count: stats.categories.feature },
            { value: "ui", label: "🎨 UI/UX", count: stats.categories.ui },
          ].map((tab) => (
            <button key={tab.value} onClick={() => setFilter(tab.value)} className={`px-4 py-2 rounded-xl text-sm transition-all ${filter === tab.value ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-500">No feedback yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.slice().reverse().map((fb, index) => (
              <div key={index} onClick={() => setSelectedFeedback(fb)} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 cursor-pointer transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-yellow-500 text-sm">{"⭐".repeat(fb.rating)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${fb.category === 'bug' ? 'bg-red-500/20 text-red-400' : fb.category === 'feature' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {fb.category === 'bug' ? '🐛 Bug' : fb.category === 'feature' ? '💡 Feature' : '🎨 UI/UX'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(fb.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-white text-sm mb-2">{fb.feedback}</p>
                {fb.email && <div className="flex items-center gap-1 text-xs text-slate-400"><Mail size={12} /> {fb.email}</div>}
              </div>
            ))}
          </div>
        )}

        {selectedFeedback && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Feedback Details</h3>
                <button onClick={() => setSelectedFeedback(null)} className="p-1 hover:bg-white/10 rounded-lg"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div><span className="text-slate-400 text-xs uppercase">Rating</span><div className="text-yellow-500 text-lg mt-1">{"⭐".repeat(selectedFeedback.rating)}</div></div>
                <div><span className="text-slate-400 text-xs uppercase">Category</span><p className="text-white mt-1 capitalize">{selectedFeedback.category}</p></div>
                <div><span className="text-slate-400 text-xs uppercase">Feedback</span><p className="text-white mt-1">{selectedFeedback.feedback}</p></div>
                {selectedFeedback.email && <div><span className="text-slate-400 text-xs uppercase">Email</span><p className="text-white mt-1">{selectedFeedback.email}</p></div>}
                <div><span className="text-slate-400 text-xs uppercase">Timestamp</span><p className="text-white mt-1">{new Date(selectedFeedback.timestamp).toLocaleString()}</p></div>
              </div>
              <button onClick={() => setSelectedFeedback(null)} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 py-2 rounded-xl text-white">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}