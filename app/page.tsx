"use client"
import { ProjectStatsCard } from "@/components/home/ProjectStatsCard";
import { useGuestTracking } from "@/hooks/useGuestTracking";
import { SignupPromptModal } from "../components/SignupPromptModal";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { signIn, useSession } from "next-auth/react";
import { useErrorMonitor } from "../hooks/useErrorMonitor";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { SearchResult, FavoriteItem, AnalyticsData } from "@/lib/types/search";
import {
  TypingText,
  CodeAnalytics,
  ResultCard,
  SecurityDashboard,
  BatchRefactorTool,
  FeedbackModal,
  Toast,
  UnderstandRepoModal,
  HomeNav,
} from "@/components/home"
import {
  Search,
  Zap,
  Github,
  ExternalLink,
  Code,
  Terminal,
  X,
  Star,
  Plus,
  FolderCode,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Download,
  Share2,
  GitCompare,
  Copy,
  Check,
  Filter,
  RefreshCw,
  FileJson,
  FileText,
  LogIn,
} from "lucide-react"
export default function Home() {
  const hasRun = useRef(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const { data: session } = useSession()
  const [query, setQuery] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useLocalStorage<any[]>('gitgrep-feedback', []);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [titleIndex, setTitleIndex] = useState(0);
  const [showAuth, setShowAuth] = useState<null | 'signin' | 'signup'>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [userProjects, setUserProjects] = useState<string[]>([]);
  const [view, setView] = useState<'search' | 'favorites' | 'my-projects' | 'security' | 'refactor'>('search');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [filters, setFilters] = useState({ language: "", minStars: 0 });
  const [compareItem, setCompareItem] = useState<SearchResult | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [repoAnalyzing, setRepoAnalyzing] = useState(false);
  const [repoAnalysis, setRepoAnalysis] = useState("");
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const guestTracking = useGuestTracking();
  const [userCount, setUserCount] = useState(0);
  const [projectStats, setProjectStats] = useState<Record<string, any>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isSearchLimited, setIsSearchLimited] = useState(false);
 

  // جلب إحصائيات المشاريع
  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      if (userProjects.length === 0) {
        if (isMounted) setProjectStats({});
        return;
      }
      
      setIsLoadingStats(true);
      try {
        const res = await fetch('/api/project-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projects: userProjects }),
        });
        const data = await res.json();
        if (isMounted) setProjectStats(data.stats || {});
      } catch (error) {
        console.error("Failed to fetch project stats:", error);
      } finally {
        if (isMounted) setIsLoadingStats(false);
      }
    };
    
    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, [userProjects]);

 const analyzeRepo = async (repoIdentifier?: string) => {
  if (!repoIdentifier) return;
  setRepoAnalyzing(true);
  setRepoAnalysis("");
  
  try {
    const res = await fetch('/api/analyze-repo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo: repoIdentifier }) // ✅ أرسل repo بدل url
    });
    const data = await res.json();
    setRepoAnalysis(data.analysis || "No analysis available.");
  } catch (err) {
    setRepoAnalysis("Error analyzing repository. Please try again.");
  } finally {
    setRepoAnalyzing(false);
  }
};

  const askAIAnalysis = async () => {
  if (!repoUrl) return;
  
  // تطبيع الإدخال (يدعم رابط GitHub أو owner/repo)
  let repoPath = repoUrl.trim();
  if (repoPath.includes('github.com')) {
    const match = repoPath.match(/github\.com\/([^\/]+\/[^\/]+)/);
    if (match) {
      repoPath = match[1];
    } else {
      setAiAnalysis("Invalid GitHub URL. Use format: owner/repo or full GitHub URL");
      return;
    }
  }
  
  setAiAnalysisLoading(true);
  setAiAnalysis("");

  try {
    const res = await fetch("/api/ai-bug-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: repoPath.trim() }), // أرسل owner/repo
    });

    let data: { analysis?: string; error?: string } = {};
    try {
      data = await res.json();
    } catch {
      setAiAnalysis("Could not read server response. Check your connection and try again.");
      return;
    }

    if (!res.ok) {
      setAiAnalysis(data.error || `Request failed (${res.status})`);
      return;
    }

    setAiAnalysis(data.analysis || "No AI analysis available.");
  } catch {
    setAiAnalysis("Network error. Check your connection or try again.");
  } finally {
    setAiAnalysisLoading(false);
  }
};

 // جلب بيانات المستخدم عند تسجيل الدخول
useEffect(() => {
  if (session?.user?.email) {
    fetch('/api/user-data')
      .then(res => res.json())
      .then(data => {
        const raw = data.favorites || [];
        setFavorites(
          raw.map((f: FavoriteItem & { savedAt?: string | Date }) => ({
            ...f,
            savedAt: f.savedAt ? new Date(f.savedAt) : new Date()
          }))
        );
        // ✅ جلب المشاريع من API
        if (data.projects && data.projects.length > 0) {
          setUserProjects(data.projects);
          // ✅ حفظ في localStorage عشان الضيف بعد كده
          localStorage.setItem('gitgrep_projects', JSON.stringify(data.projects));
        }
      })
      .catch(err => console.error("Failed to load user data:", err));
  }
}, [session]);

  // حفظ بيانات المستخدم عند تغييرها
  useEffect(() => {
    if (session?.user?.email && (favorites.length > 0 || userProjects.length > 0)) {
      fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites, projects: userProjects })
      }).catch(err => console.error("Failed to save user data:", err));
    }
  }, [favorites, userProjects, session]);
  
  // toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const copyRepoReport = async () => {
    if (!repoAnalysis.trim()) return;
    try {
      await navigator.clipboard.writeText(repoAnalysis);
      setToast({
        show: true,
        message: "تم نسخ التحليل — Report copied",
        type: "success",
      });
    } catch {
      setToast({
        show: true,
        message: "تعذر النسخ — Copy failed",
        type: "error",
      });
    }
  };

  const copyAiTips = async () => {
    if (!aiAnalysis.trim()) return;
    try {
      await navigator.clipboard.writeText(aiAnalysis);
      setToast({
        show: true,
        message: "تم نسخ النصائح — Tips copied",
        type: "success",
      });
    } catch {
      setToast({
        show: true,
        message: "تعذر النسخ — Copy failed",
        type: "error",
      });
    }
  };

  // Error Monitoring
  useErrorMonitor();
  
  const handleFeedbackSubmit = async (data: any) => {
    setFeedbackHistory((prev) => [...prev, data]);
    console.log("Feedback submitted:", data);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("✅ Feedback sent to backend");
      } else {
        console.log("❌ Failed to send to backend");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
    
    const userName = data.email?.split('@')[0] || session?.user?.name?.split(' ')[0] || 'developer';
    
    setToast({
      show: true,
      message: `✨ Feedback received! Thank you, ${userName}!`,
      type: 'success'
    });
  };

  const [analytics] = useState<AnalyticsData>({
    totalSearches: 0,
    topLanguages: {},
    topRepos: {},
    securityIssues: 0
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const titles = [
    "Find Bugs Faster",
    "Search Code Instantly",
    "Explore Repos in Seconds",
    "Audit Code at Scale",
    "AI-Powered Analysis"
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        if (isTyping) return;
        e.preventDefault();
        if (results.length > 0) {
          setShowExportModal(true);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [results.length]);

  // Title rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((i) => (i + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auth modal
  useEffect(() => {
    if (session) setShowAuth(null);
  }, [session]);

 const performSearch = useCallback(async (searchQuery: string) => {
  if (!searchQuery || searchQuery.length < 3) {
    alert("Please enter at least 3 characters to search");
    return;
  }
  
  setLoading(true);
  setResults([]);
  setView('search');
  
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&per_page=70`);
    
    if (!res.ok) {
      console.error("API Error");
      setResults([]);
      return;
    }
    
    const data = await res.json();
    console.log("🔍 Results found:", data.total_count);
    
    let finalResults = data.items || [];
    
    // فلتر النجوم (يبقى كما هو)
    if (filters.minStars > 0) {
      finalResults = finalResults.filter((r: any) => 
        (r.repository?.stargazers_count || 0) >= filters.minStars
      );
    }
    
    setResults(finalResults);
    
  } catch (err) {
    console.error("Fetch failed:", err);
    setResults([]);
  } finally {
    setLoading(false);
  }


   }, [filters, guestTracking, session, isSearchLimited]);


  // قراءة البحث من URL عند تحميل الصفحة
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    console.log("URL Search Query:", searchQuery);
    
    if (searchQuery && searchQuery.trim()) {
      setQuery(searchQuery);
      const timer = setTimeout(() => {
        performSearch(searchQuery);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [performSearch]);

  // Search function
  const search = async () => {
    if (!query || query.length < 3) {
      alert("Please enter at least 3 characters to search");
      return;
    }
    
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url.toString());
    
    await performSearch(query);
  };

  // AI Ask function
  const askAI = async () => {
    if (!question) return;
    
    setAiLoading(true);
    setAnswer("");
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          repo: query,
          context: results.slice(0, 5).map(r => r.text_matches?.[0]?.fragment || "").join("\n")
        })
      });
      
      const data = await res.json();
      setAnswer(data.answer || "No answer received.");
    } catch (err) {
      console.error("AI Error:", err);
      setAnswer("Something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = (item: SearchResult) => {
    const exists = favorites.find(fav => fav.html_url === item.html_url);
    if (exists) {
      setFavorites(favorites.filter(fav => fav.html_url !== item.html_url));
    } else {
      setFavorites([...favorites, { ...item, savedAt: new Date() }]);
    }
  };

  // Add project
 const addProject = (project: string) => {
  if (!userProjects.includes(project)) {
    const newProjects = [...userProjects, project];
    setUserProjects(newProjects);
    // ✅ حفظ في localStorage
    localStorage.setItem('gitgrep_projects', JSON.stringify(newProjects));
  }
};
// جلب المشاريع من localStorage عند تحميل الصفحة (للكييف)
useEffect(() => {
  const savedProjects = localStorage.getItem('gitgrep_projects');
  if (savedProjects) {
    setUserProjects(JSON.parse(savedProjects));
  }
}, []);

  // Filtered results
 const filteredResults = useMemo(() => {
  let filtered = results;
  
  // فلتر اللغة
  if (filters.language && filters.language !== '') {
    filtered = filtered.filter((r: any) => {
      const detectedLang = r.detected_language || 'Unknown';
      const snippet = (r.code_snippet || '').toLowerCase();
      const fileName = (r.path || '').toLowerCase();
      
      // خريطة اللغات مع الكلمات المفتاحية والامتدادات
      const languagePatterns: Record<string, { extensions: string[], keywords: string[] }> = {
        'JavaScript': {
          extensions: ['.js', '.jsx', '.mjs', '.cjs'],
          keywords: ['javascript', 'const ', 'let ', 'var ', 'function ', '=>', 'console.log']
        },
        'TypeScript': {
          extensions: ['.ts', '.tsx'],
          keywords: ['typescript', 'interface ', 'type ', ': string', ': number', ': boolean', 'enum ']
        },
        'Python': {
          extensions: ['.py', '.pyw'],
          keywords: ['python', 'def ', 'import ', 'from ', 'class ', 'self.', 'print(']
        },
        'Java': {
          extensions: ['.java'],
          keywords: ['java', 'public class', 'private class', 'void ', 'String[]', '@Override']
        },
        'Go': {
          extensions: ['.go'],
          keywords: ['golang', 'func ', 'package main', 'import (', ':=', 'go ']
        },
        'Rust': {
          extensions: ['.rs'],
          keywords: ['rust', 'fn ', 'let mut', 'println!', 'match ', 'impl ']
        },
        'C++': {
          extensions: ['.cpp', '.cxx', '.hpp', '.cc'],
          keywords: ['c++', 'cpp', '#include', 'std::', 'cout', 'class ', 'public:']
        },
        'C': {
          extensions: ['.c', '.h'],
          keywords: ['c language', '#include', 'printf', 'scanf', 'malloc', 'free']
        },
        'C#': {
          extensions: ['.cs'],
          keywords: ['csharp', 'using System', 'namespace ', 'class ', 'public static void']
        },
        'PHP': {
          extensions: ['.php'],
          keywords: ['php', '<?php', 'echo ', '$', 'function ', 'mysql_']
        },
        'Ruby': {
          extensions: ['.rb', '.rbw'],
          keywords: ['ruby', 'def ', 'end', 'puts ', 'attr_accessor', 'gem ']
        },
        'Swift': {
          extensions: ['.swift'],
          keywords: ['swift', 'func ', 'let ', 'var ', 'import UIKit', '@IBOutlet']
        },
        'Kotlin': {
          extensions: ['.kt', '.kts'],
          keywords: ['kotlin', 'fun ', 'val ', 'var ', 'class ', 'object ']
        }
      };
      
      const pattern = languagePatterns[filters.language];
      if (!pattern) return false;
      
      // 1. التحقق من الامتداد
      const hasExtension = pattern.extensions.some(ext => fileName.endsWith(ext));
      if (hasExtension) return true;
      
      // 2. التحقق من detected_language
      if (detectedLang === filters.language) return true;
      
      // 3. التحقق من الكلمات المفتاحية في الـ snippet
      const hasKeyword = pattern.keywords.some(keyword => snippet.includes(keyword));
      if (hasKeyword) return true;
      
      return false;
    });
  }
  
  // فلتر النجوم
  if (filters.minStars > 0) {
    filtered = filtered.filter((r: any) => 
      (r.repository?.stargazers_count || r.repository_info?.stargazers_count || 0) >= filters.minStars
    );
  }
  
  return filtered;
}, [results, filters]);

  // Render content
  const renderContent = () => {
    switch(view) {
      case 'favorites':
        return (
          <div className="space-y-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl text-slate-900 dark:text-white font-bold">Saved Items</h2>
              <span className="text-slate-500 text-sm">{favorites.length} saved snippets</span>
            </div>
            {favorites.length === 0 ? (
              <div className="text-center text-slate-500 py-32 border-2 border-dashed border-white/5 rounded-[3rem]">
                <Star size={48} className="mx-auto mb-4 text-slate-700" />
                <p>No saved items yet. Star code snippets to save them here.</p>
              </div>
            ) : (
              favorites.map((item, i) => (
                <ResultCard
                  key={i}
                  item={item}
                  onFav={() => toggleFavorite(item)}
                  isFav={true}
                  onCompare={setCompareItem}
                  isComparing={compareItem?.html_url === item.html_url}
                />
              ))
            )}
          </div>
        );
      
      case 'my-projects':
        return (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
              <h2 className="text-2xl sm:text-3xl text-white font-bold">My Projects</h2>
              <button 
                onClick={() => {
                  const demoProjects = ["vercel/next.js", "facebook/react", "tailwindlabs/tailwindcss"];
                  demoProjects.forEach(p => addProject(p));
                }}
                className="text-xs sm:text-sm text-blue-400 hover:text-blue-300"
              >
                + Add Demo Projects
              </button>
            </div>
          
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <input
                type="text"
                id="newProjectInput"
                placeholder="Add repository (owner/repo) e.g. microsoft/vscode"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
                style={{ caretColor: 'white' }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      addProject(input.value.trim());
                      input.value = "";
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('newProjectInput') as HTMLInputElement;
                  if (input.value.trim()) {
                    addProject(input.value.trim());
                    input.value = "";
                  }
                }}
                className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-white font-medium"
              >
                <Plus size={18} />
                <span>Add</span>
              </button>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 py-32 border-2 border-dashed border-white/5 rounded-[3rem]">
                  <FolderCode size={48} className="mx-auto mb-4 text-slate-700" />
                  <p>No projects connected yet.</p>
                </div>
              ) : (
                userProjects.map((project, i) => {
                  return <ProjectStatsCard key={i} project={project} onRemove={() => setUserProjects(userProjects.filter(p => p !== project))} />;
                })
              )}
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div>
            <h2 className="text-3xl text-slate-900 dark:text-white font-bold mb-8">Security Dashboard</h2>
            <SecurityDashboard projects={userProjects} onAddProject={addProject} />
          </div>
        );
      
      case 'refactor':
        return (
          <div>
            <h2 className="text-3xl text-slate-900 dark:text-white font-bold mb-8">Batch Refactor Tool</h2>
            <BatchRefactorTool projects={userProjects} />
          </div>
        );
      
      default:
        return (
          <>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                <Zap size={12} className="text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase">AI-Powered Code Search</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black">
  Search GitHub Code <br />
  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
  Search Results
</h2>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
                  {titles[titleIndex]}
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto text-center px-4">
                Search across 100M+ repositories instantly. Find bugs, explore code patterns, and get AI-powered insights.
              </p>
            </div>

            <div className="max-w-4xl mx-auto mb-8 px-4">
              <div className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-visible">
                <div className="flex flex-col sm:flex-row items-center border-b border-white/10">
                  <div className="px-4 sm:px-5 py-3 text-blue-500">
                    <Search size={20} />
                  </div>
                  <input
                    ref={searchInputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && search()}
                    placeholder="Search code across 100M+ repositories... (Ctrl+K)"
                    className="w-full bg-transparent py-3 sm:py-5 text-sm sm:text-base outline-none text-white placeholder:text-slate-600 px-4 break-words whitespace-normal"
                    style={{ caretColor: 'white' }}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 bg-white/5 rounded-b-2xl">
                  {/* Filters button */}
                  <div className="relative w-full sm:w-auto">
                    <button 
                      id="filterButton"
                      onClick={() => {
                        const dropdown = document.getElementById('filter-dropdown');
                        dropdown?.classList.toggle('hidden');
                      }} 
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-all w-full"
                    >
                      <Filter size={14} />
                      <span>Filters</span>
                      <ChevronDown size={12} />
                    </button>
                    
                    {/* Filter Dropdown */}
                    <div id="filter-dropdown" className="hidden absolute top-full left-0 mt-2 w-full sm:w-80 bg-black border border-white/20 rounded-2xl p-5 z-[999999] shadow-2xl">
                      <div className="space-y-5">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                            <Star size={12} className="text-yellow-500" />
                            MINIMUM STARS
                          </label>
                          <input 
                            type="number" 
                            id="minStars" 
                            placeholder="0" 
                            defaultValue={filters.minStars}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
  <Code size={12} className="text-green-400" />
  PROGRAMMING LANGUAGE
</label>
<select 
  id="language" 
  defaultValue={filters.language}
  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none cursor-pointer"
>
  <option value="">🌐 All Languages</option>
  <option value="JavaScript">🟨 JavaScript</option>
  <option value="TypeScript">🔵 TypeScript</option>
  <option value="Python">🐍 Python</option>
  <option value="Java">☕ Java</option>
  <option value="Go">🐹 Go</option>
  <option value="Rust">🦀 Rust</option>
  <option value="C++">⚙️ C++</option>
  <option value="C">⚙️ C</option>
  <option value="C#">🎯 C#</option>
  <option value="PHP">🐘 PHP</option>
  <option value="Ruby">💎 Ruby</option>
  <option value="Swift">🍎 Swift</option>
  <option value="Kotlin">📱 Kotlin</option>
</select>
                        </div>
                        
                        <div className="flex gap-3 pt-3">
                          <button 
                            onClick={() => {
                              (document.getElementById('minStars') as HTMLInputElement).value = '0';
                              (document.getElementById('language') as HTMLSelectElement).value = '';
                              setFilters({ minStars: 0, language: "" });
                              document.getElementById('filter-dropdown')?.classList.add('hidden');
                            }} 
                            className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-xl text-sm font-medium"
                          >
                            Reset
                          </button>
                          <button 
  onClick={() => {
    const stars = (document.getElementById('minStars') as HTMLInputElement)?.value;
    const lang = (document.getElementById('language') as HTMLSelectElement)?.value;
    setFilters({ minStars: Number(stars) || 0, language: lang || "" });
    document.getElementById('filter-dropdown')?.classList.add('hidden');
  }} 
  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-2.5 rounded-xl text-sm font-bold"
>
  Apply Filters
</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={search} 
                      disabled={loading} 
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all disabled:opacity-50"
                    >
                      {loading ? "..." : "GREP"}
                    </button>
                    <button
                      onClick={() => setShowRepoModal(true)}
                      className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-500 text-white px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all"
                    >
                      📦Repo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-12 px-2">
              <button onClick={() => setQuery("authentication")} className="text-[10px] sm:text-xs bg-white/5 hover:bg-white/10 px-2 sm:px-3 py-1.5 rounded-full">
                🔐 authentication
              </button>
              <button onClick={() => setQuery("useState")} className="text-[10px] sm:text-xs bg-white/5 hover:bg-white/10 px-2 sm:px-3 py-1.5 rounded-full">
                ⚛️ useState
              </button>
              <button onClick={() => setQuery("api endpoint")} className="text-[10px] sm:text-xs bg-white/5 hover:bg-white/10 px-2 sm:px-3 py-1.5 rounded-full">
                🌐 api endpoint
              </button>
              <button onClick={() => setQuery("security")} className="text-[10px] sm:text-xs bg-white/5 hover:bg-white/10 px-2 sm:px-3 py-1.5 rounded-full">
                🛡️ security
              </button>
              
              {session?.user?.email === "koshax27@gmail.com" && (
                <button
                  onClick={() => {
                    throw new Error("Test error from button click!");
                  }}
                  className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-full border border-red-500/30"
                >
                  🧪 Test Error
                </button>
              )}
            </div>

            <div className="max-w-2xl mx-auto text-center mt-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Zap size={18} className="text-blue-400" />
                </div>
                <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask AI about the code... e.g., 'where is the authentication logic?'" className="w-full rounded-2xl pl-12 pr-4 py-4 text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 dark:bg-black/40 dark:border-white/15 dark:text-white dark:placeholder:text-slate-500" onKeyDown={(e) => e.key === "Enter" && askAI()} />
              </div>

              <button onClick={askAI} disabled={!query || aiLoading} className={`mt-4 px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wide transition-all flex items-center gap-3 mx-auto shadow-lg ${query && !aiLoading ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-600/30" : "bg-slate-300 text-slate-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"}`}>
                {aiLoading ? <><RefreshCw size={18} className="animate-spin" /> Analyzing Code...</> : <><Zap size={18} className="fill-current" /> Ask AI Assistant</>}
              </button>

              {answer && (
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/25 rounded-2xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-left shadow-lg">
                  <div className="flex items-center gap-2 mb-3 text-blue-400">
                    <Zap size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">AI Analysis</span>
                  </div>
                  {answer}
                </div>
              )}
            </div>

            <div className="space-y-12 mt-12">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Search Results</h3>
                {results.length > 0 && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        console.log("🔵 EXPORT - Setting modal to true");
                        setShowExportModal(true);
                      }} 
                      className="p-2 hover:bg-blue-700 rounded-lg bg-blue-600 transition-all duration-200" 
                      title="Export Results"
                    >
                      <Download size={18} className="text-white" />
                    </button>
                    <button 
                      onClick={() => {
                        console.log("🟢 SHARE - Button clicked!");
                        setShowShareModal(true);
                      }} 
                      className="p-2 hover:bg-green-700 rounded-lg bg-green-600 transition-all duration-200" 
                      title="Share Search"
                    >
                      <Share2 size={18} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
              
              {filteredResults.map((item, i) => (
                <ResultCard key={i} item={item} onFav={() => toggleFavorite(item)} isFav={favorites.some(f => f.html_url === item.html_url)} onCompare={setCompareItem} isComparing={compareItem?.html_url === item.html_url} />
              ))}

              {results.length === 0 && !loading && query && (
                <div className="py-32 text-center border-2 border-dashed border-slate-300 dark:border-white/5 rounded-[3.5rem]">
                  <div className="text-6xl mb-4">🔍</div>
                  <div className="text-slate-600 dark:text-slate-500">No results found. Try a different search term.</div>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-12">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6">
        <HomeNav
          session={session}
          view={view}
          favoritesCount={favorites.length}
          projectsCount={userProjects.length}
          userCount={userCount}
          onNavigate={setView}
          onLogoClick={() => {
            setView("search");
            setQuery("");
            setResults([]);
            setFilters({ language: "", minStars: 0 });
            setQuestion("");
            setAnswer("");
            window.history.pushState({}, "", window.location.pathname);
          }}
          onFeedback={() => setShowFeedbackModal(true)}
          onSignIn={() => setShowAuth("signin")}
        />

        {renderContent()}

        <div className="mt-20 pt-8 border-t border-white/10 text-center">
          <TypingText />
          <p className="text-[10px] text-slate-500 mt-2">© 2024 GitGrep - AI-Powered Code Search & Security Analysis</p>
          <div className="flex justify-center gap-6 text-sm mt-4">
            <a href="/privacy" className="text-slate-500 hover:text-blue-400 transition-colors text-xs">Privacy Policy</a>
            <a href="/terms" className="text-slate-500 hover:text-blue-400 transition-colors text-xs">Terms of Service</a>
            <a href="mailto:hello@gitgrep.com" className="text-slate-500 hover:text-blue-400 transition-colors text-xs">Contact</a>
          </div>
        </div>

        <CodeAnalytics 
          query={query} 
          resultsCount={filteredResults.length}
          languages={(() => {
            const langMap: Record<string, number> = {};
            filteredResults.forEach(r => {
              if (r.repository?.language) {
                langMap[r.repository.language] = (langMap[r.repository.language] || 0) + 1;
              }
            });
            return langMap;
          })()}
          topLanguage={(() => {
            const langMap: Record<string, number> = {};
            filteredResults.forEach(r => {
              if (r.repository?.language) {
                langMap[r.repository.language] = (langMap[r.repository.language] || 0) + 1;
              }
            });
            const top = Object.entries(langMap).sort((a, b) => b[1] - a[1])[0];
            return top?.[0];
          })()}
          avgStars={filteredResults.length > 0 ? 
            filteredResults.reduce((sum, r) => sum + (r.repository?.stargazers_count || 0), 0) / filteredResults.length : 
            undefined}
          avgOpenIssues={filteredResults.length > 0 ?
            filteredResults.reduce((sum, r) => sum + (r.repository?.open_issues_count || 0), 0) / filteredResults.length :
            undefined}
        />
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Terminal size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome to GitGrep</h2>
              <p className="text-slate-400 text-sm mt-2">Sign in to continue to the code search platform</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => signIn('google')} 
                className="w-full bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-3 font-medium border border-gray-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              
              <button 
                onClick={() => {
                  window.location.href = '/api/auth/signin/github';
                }} 
                className="w-full bg-[#24292f] hover:bg-[#2f363d] text-white px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-3 font-medium"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
              
              <button 
                onClick={() => setShowAuth(null)} 
                className="w-full text-slate-500 hover:text-white text-sm mt-4 py-2 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999999] animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#0d1117] to-[#0a0c10] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Download size={20} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Export Results</h2>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Total Results</span>
                <span className="text-white font-bold text-lg">{results.length}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="text-slate-400 text-sm mb-3 block">Export Format</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setExportFormat('json')}
                  className={`flex-1 py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 ${
                    exportFormat === 'json' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <FileJson size={16} />
                  JSON
                </button>
                <button 
                  onClick={() => setExportFormat('csv')}
                  className={`flex-1 py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 ${
                    exportFormat === 'csv' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <FileText size={16} />
                  CSV
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  let dataToExport;
                  let fileType;
                  let fileExtension;
                  
                  if (exportFormat === 'json') {
                    dataToExport = JSON.stringify(results, null, 2);
                    fileType = 'application/json';
                    fileExtension = 'json';
                  } else {
                    const headers = ['Repository', 'Path', 'URL', 'Stars', 'Language', 'Snippet'];
                    const rows = results.map(r => [
                      `"${r.repository.full_name}"`,
                      `"${r.path}"`,
                      `"${r.html_url}"`,
                      r.repository.stargazers_count || 0,
                      r.repository.language || 'Unknown',
                      `"${(r.text_matches?.[0]?.fragment || '').replace(/"/g, '""').slice(0, 200)}"`
                    ]);
                    dataToExport = [headers, ...rows].map(row => row.join(',')).join('\n');
                    fileType = 'text/csv;charset=utf-8';
                    fileExtension = 'csv';
                  }
                  
                  const blob = new Blob([dataToExport], { type: fileType });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `gitgrep-results-${new Date().toISOString().slice(0,19)}.${fileExtension}`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-3 rounded-xl text-white font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                <Download size={16} className="inline mr-2" />
                Download {exportFormat === 'json' ? 'JSON' : 'CSV'}
              </button>
              <button 
                onClick={() => setShowExportModal(false)} 
                className="px-6 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999999] animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#0d1117] to-[#0a0c10] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Share2 size={20} className="text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Share Search</h2>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Search Query</span>
                <span className="text-blue-400 font-mono text-sm">{query}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Results Found</span>
                <span className="text-white font-bold">{results.length}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="text-slate-400 text-sm mb-3 block">Share Link</label>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={typeof window !== 'undefined' ? window.location.href : ''} 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-blue-500"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    const toast = document.createElement('div');
                    toast.innerHTML = '✅ Copied!';
                    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-xl text-sm z-[999999] animate-in fade-in slide-in-from-bottom-4';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 1500);
                  }} 
                  className="bg-blue-600 hover:bg-blue-500 px-6 rounded-xl text-white font-medium transition-all flex items-center gap-2"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="text-slate-400 text-sm mb-3 block">Share on Social</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?text=🔍 Check out this search on GitGrep: "${query}" - ${results.length} results found!&url=${encodeURIComponent(window.location.href)}`);
                  }} 
                  className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] py-3 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </button>
                <button 
                  onClick={() => {
                    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=GitGrep Search: ${query}&summary=${results.length} results found on GitGrep`);
                  }} 
                  className="flex-1 bg-[#0A66C2] hover:bg-[#0958a8] py-3 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
                  </svg>
                  LinkedIn
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setShowShareModal(false)} 
              className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal 
          onClose={() => setShowFeedbackModal(false)} 
          onSubmit={handleFeedbackSubmit}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {showRepoModal && (
        <UnderstandRepoModal
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          repoAnalyzing={repoAnalyzing}
          repoAnalysis={repoAnalysis}
          aiAnalysisLoading={aiAnalysisLoading}
          aiAnalysis={aiAnalysis}
          onClose={() => setShowRepoModal(false)}
          onAnalyzeRepo={analyzeRepo}
          onAskAiAnalysis={askAIAnalysis}
          onCopyRepoReport={copyRepoReport}
          onCopyAiTips={copyAiTips}
        />
      )}

      {/* Guest Signup Popup */}
      {guestTracking.showSignupPrompt && !session && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[999999] animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#0d1117] to-[#0a0c10] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                🚀 Unlock Full Access
              </h2>
              <p className="text-slate-400 text-sm">
                You've made {guestTracking.searchCount} searches! Sign up to continue searching and get unlimited access to AI analysis, saved projects, and more.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  guestTracking.setShowSignupPrompt(false);
                  setShowAuth("signin");
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Sign Up / Log In
              </button>
              
              <button
  onClick={() => {
    guestTracking.setShowSignupPrompt(false);
    // ✅ يفضل محدود
    setIsSearchLimited(true);
  }}
  className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl text-slate-400 hover:text-white text-sm transition-all"
>
  Maybe Later
</button>
            </div>

            <p className="text-center text-[10px] text-slate-500 mt-4">
              Free for first 100 users • No credit card required
            </p>
          </div>
        </div>
      )}
    </main>
  );
}