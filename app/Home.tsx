"use client"

import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useCodeSearch } from "@/hooks/useCodeSearch";
import { useGuestTracking } from "@/hooks/useGuestTracking";
import { 
  ResultCard, HomeNav, Toast, SignupPromptModal, 
  SecurityDashboard, BatchRefactorTool, ProjectStatsCard 
} from "@/components/home";
import { Search, Zap, Star, Plus, FolderCode, RefreshCw, Download, Share2, Filter, ChevronDown, Code } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const guestTracking = useGuestTracking();
  
  // States
  const [view, setView] = useState<'search' | 'favorites' | 'my-projects' | 'security' | 'refactor'>('search');
  const [filters, setFilters] = useState({ language: "", minStars: 0 });
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [userProjects, setUserProjects] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  
  // Custom Search Hook
  const { results, loading, query, setQuery, performSearch } = useCodeSearch(filters, guestTracking);

  // 1. ميزة الـ Pop-up (تعديل منطق الإلحاح)
  const handleSearchAction = () => {
    // لو المستخدم مش مسجل، وعمل سيرش مرتين أو أكتر، والـ modal مش مفتوحة
    if (!session && guestTracking.searchCount >= 2) {
      setShowSignupModal(true);
      return; // بيوقف السيرش لحد ما يتصرف مع الـ Modal
    }
    performSearch(query);
  };

  // 2. الـ AI المحسن (تحليل حقيقي بناءً على الـ Context)
  const askAI = async () => {
    if (!question || results.length === 0) return;
    setAiLoading(true);
    setAnswer("");
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          repo: query,
          // هنا بنبعت تفاصيل أدق عشان الـ AI ميهلفطش
          context: results.slice(0, 5).map(r => ({
            code: r.text_matches?.[0]?.fragment,
            file: r.path,
            repo: r.repository?.full_name,
            lang: r.repository?.language
          }))
        })
      });
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      setAnswer("حصل مشكلة في التحليل، جرب تاني يا بطل.");
    } finally {
      setAiLoading(false);
    }
  };

  // 3. كاونتر اليوزرز (Max 100)
  const userDisplayCount = Math.min(guestTracking.searchCount * 5, 100); // مثال لمعادلة وهمية أو جلب من DB

  return (
    <div className="min-h-screen bg-[#010409] text-white p-4 md:p-8">
      <HomeNav setView={setView} currentView={view} />
      
      <main className="max-w-7xl mx-auto pt-20">
        {/* User Counter UI */}
        <div className="mb-4 text-center">
          <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
            🔥 {userDisplayCount}/100 Early Access Slots Filled
          </span>
        </div>

        {view === 'search' && (
          <div className="space-y-12">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-black mb-6">GitGrep AI</h1>
              <div className="flex gap-2 bg-[#0d1117] p-2 rounded-2xl border border-white/10">
                <input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن أي كود..."
                  className="flex-1 bg-transparent p-3 outline-none"
                />
                <button 
                  onClick={handleSearchAction}
                  className="bg-blue-600 px-6 rounded-xl font-bold hover:bg-blue-500 transition-all"
                >
                  {loading ? <RefreshCw className="animate-spin" /> : "بحث"}
                </button>
              </div>
            </div>

            {/* AI Assistant Section */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <input 
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="اسأل الـ AI عن نتايج البحث دي..."
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl pr-12 focus:border-blue-500 outline-none"
                />
                <button onClick={askAI} className="absolute right-4 top-4 text-blue-400">
                  {aiLoading ? <RefreshCw size={20} className="animate-spin" /> : <Zap size={20} />}
                </button>
              </div>
              {answer && (
                <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-sm leading-relaxed">
                  <div className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <Zap size={14} /> AI Analysis:
                  </div>
                  {answer}
                </div>
              )}
            </div>

            {/* Results */}
            <div className="grid gap-6">
              {results.map((item, i) => (
                <ResultCard key={i} item={item} isFav={favorites.some(f => f.html_url === item.html_url)} />
              ))}
            </div>
          </div>
        )}

        {/* بقية الـ Views (Favorites, Security, etc.) تضاف هنا بنفس النمط */}
      </main>

      {/* Pop-up تسجيل الدخول الإجباري بعد 2 سيرش */}
      <SignupPromptModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
        onRemindLater={() => {
            setShowSignupModal(false);
            // هنا الفكرة: مش بنصفر العداد، فـ السيرش الجاي هيخبط في الشرط تاني
        }}
      />
    </div>
  );
}