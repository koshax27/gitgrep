// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, X, Download, Trash2, Mail, Calendar, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (status === "loading") return;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "koshax27@gmail.com";
    if (!session || session.user?.email !== adminEmail) {
      router.push("/");
      return;
    }
    const stored = localStorage.getItem('gitgrep-feedback');
    if (stored) setFeedbacks(JSON.parse(stored));
    setLoading(false);
  }, [session, status, router]);

  if (loading) return <div className="min-h-screen bg-[#020408] flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  if (!session || session.user?.email !== "koshax27@gmail.com") return null;

  const stats = {
    total: feedbacks.length,
    avgRating: feedbacks.length ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : 0,
    bug: feedbacks.filter(f => f.category === 'bug').length,
    feature: feedbacks.filter(f => f.category === 'feature').length,
    ui: feedbacks.filter(f => f.category === 'ui').length,
  };

  const filtered = filter === 'all' ? feedbacks : feedbacks.filter(f => f.category === filter);

  return (
    <div className="min-h-screen bg-[#020408] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">📋 Feedback Dashboard</h1>
          <div className="flex gap-3">
            <button onClick={() => { const data = JSON.stringify(feedbacks, null, 2); const blob = new Blob([data]); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `feedback-${Date.now()}.json`; a.click(); }} className="bg-green-600 px-4 py-2 rounded-xl text-white text-sm">Export</button>
            <button onClick={() => { if(confirm('Clear all?')) { localStorage.removeItem('gitgrep-feedback'); setFeedbacks([]); } }} className="bg-red-600/20 border border-red-500/30 px-4 py-2 rounded-xl text-red-400 text-sm">Clear All</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-xl"><div className="text-2xl font-bold text-white">{stats.total}</div><div className="text-slate-400 text-sm">Total</div></div>
          <div className="bg-white/5 p-4 rounded-xl"><div className="text-2xl font-bold text-yellow-500">{stats.avgRating}</div><div className="text-slate-400 text-sm">Avg Rating</div></div>
          <div className="bg-white/5 p-4 rounded-xl"><div className="text-2xl font-bold text-red-400">{stats.bug}</div><div className="text-slate-400 text-sm">Bugs</div></div>
          <div className="bg-white/5 p-4 rounded-xl"><div className="text-2xl font-bold text-green-400">{stats.feature}</div><div className="text-slate-400 text-sm">Features</div></div>
        </div>
        <div className="flex gap-2 mb-6">
          {['all', 'bug', 'feature', 'ui'].map(tab => <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-2 rounded-xl text-sm ${filter === tab ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>{tab === 'all' ? 'All' : tab === 'bug' ? '🐛 Bug' : tab === 'feature' ? '💡 Feature' : '🎨 UI'}</button>)}
        </div>
        {filtered.length === 0 ? <div className="text-center py-20 text-slate-500">No feedback</div> : filtered.map((fb, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-start">
              <div><div className="text-yellow-500">{'⭐'.repeat(fb.rating)}</div><p className="text-white mt-2">{fb.feedback}</p></div>
              <div className="text-right"><span className={`text-xs px-2 py-1 rounded-full ${fb.category === 'bug' ? 'bg-red-500/20 text-red-400' : fb.category === 'feature' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>{fb.category}</span><div className="text-slate-500 text-xs mt-1">{new Date(fb.timestamp).toLocaleString()}</div></div>
            </div>
            {fb.email && <div className="mt-2 text-slate-400 text-xs">📧 {fb.email}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}