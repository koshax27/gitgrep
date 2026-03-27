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

  useEffect(() => {
    if (status === "loading") return;
    
    console.log("Session:", session?.user?.email);
    
    if (!session || session.user?.email !== "koshax27@gmail.com") {
      router.replace("/");
      return;
    }
    
    const stored = localStorage.getItem('gitgrep-feedback');
    if (stored) {
      setFeedbacks(JSON.parse(stored));
    }
    setLoading(false);
  }, [session, status, router]);

  if (loading) {
    return <div className="min-h-screen bg-[#020408] flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  }

  if (!session || session.user?.email !== "koshax27@gmail.com") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#020408] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">📋 Feedback Dashboard</h1>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-white">Total feedback: {feedbacks.length}</p>
          {feedbacks.map((fb, i) => (
            <div key={i} className="border-t border-white/10 mt-4 pt-4">
              <p className="text-white">{fb.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}