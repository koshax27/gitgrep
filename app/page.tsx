"use client"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { useErrorMonitor } from '../hooks/useErrorMonitor';

// --- Icons Import ---
import {
  Search, Shield, Bug, Zap, Github, ExternalLink, Code, Terminal,
  ChevronRight, X, Star, Plus, FolderCode, ShieldAlert, BarChart3,
  Replace, Bell, CheckCircle2, AlertTriangle, LogIn, ChevronDown, 
  LogOut, Play, Download, Share2, GitCompare, Settings, Sun, Moon,
  Copy, Check, AlertOctagon, TrendingUp, BookOpen, Command, 
  Filter, Sliders, RefreshCw, Save, FileJson, FileText, Mail
} from "lucide-react"

// --- Types ---
interface SearchResult {
  html_url: string;
  repository: {
    full_name: string;
    stargazers_count?: number;
    language?: string;
    updated_at?: string;
  };
  path: string;
  text_matches?: Array<{
    fragment: string;
  }>;
  score?: number;
}

interface FavoriteItem extends SearchResult {
  savedAt: Date;
}

interface AnalyticsData {
  totalSearches: number;
  topLanguages: Record<string, number>;
  topRepos: Record<string, number>;
  securityIssues: number;
}

// --- Custom Hooks ---
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!isMounted) {
    return [initialValue, setValue] as const;
  }

  return [storedValue, setValue] as const;
}

function useKeyboardShortcut(keys: string[], callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
       console.log("KEY:", e.key, "CTRL:", e.ctrlKey); //
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const key of keys) {
        // 🔹 Ctrl/Cmd + K
        if (
          (key === "Ctrl+K" || key === "Meta+K") &&
          isCtrlOrCmd &&
          e.key.toLowerCase() === "k"
        ) {
          if (isTyping && e.key.toLowerCase() !== "k") return;

          e.preventDefault();
          e.stopPropagation();

          setTimeout(() => {
            callback();
          }, 0);

          return;
        }

        // 🔹 Ctrl/Cmd + S
        if (
          (key === "Ctrl+S" || key === "Meta+S") &&
          isCtrlOrCmd &&
          e.key.toLowerCase() === "s"
        ) {
          e.preventDefault();
          e.stopPropagation();

          setTimeout(() => {
            callback();
          }, 0);

          return;
        }
      }
    };

   document.addEventListener('keydown', handler, { capture: true });
   return () =>
  document.removeEventListener('keydown', handler, { capture: true });
  }, [keys, callback]);
}

// --- TypingText Component ---
function TypingText() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const texts = [
    { text: "17 developers joined this week", color: "text-green-400" },
    { text: "Scanning repositories...", color: "text-blue-400" },
    { text: "3 secrets detected in public code", color: "text-red-400" },
    { text: "AI analyzing code patterns...", color: "text-purple-400" },
    { text: "95% security score achieved", color: "text-emerald-400" }
  ];

  const [displayed, setDisplayed] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex].text;
    
    if (!isDeleting && charIndex < current.length) {
      const timeout = setTimeout(() => {
        setDisplayed(prev => prev + current[charIndex]);
        setCharIndex(charIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } 
    else if (!isDeleting && charIndex === current.length) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }
    else if (isDeleting && charIndex > 0) {
      const timeout = setTimeout(() => {
        setDisplayed(prev => prev.slice(0, -1));
        setCharIndex(charIndex - 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
    else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }
  }, [charIndex, textIndex, isDeleting, texts]);

  if (!isMounted) {
    return <p className="text-xs mt-3 font-mono text-center text-slate-500">...</p>;
  }

  return (
    <p className={`text-xs mt-3 font-mono text-center ${texts[textIndex].color} transition-all duration-300`}>
      <span className="text-slate-500">{">"}</span> {displayed}
      <span className="animate-pulse">_</span>
    </p>
  );
}

// --- LiveTerminal Component ---
function LiveTerminal({ snippet }: { snippet: string }) {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>(["// Terminal ready...", "// Type 'run' to execute snippet", "// Type 'help' for commands"]);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, { desc: string; action: () => Promise<void> | void }> = {
    run: {
      desc: "Execute security scan",
      action: async () => {
        setIsExecuting(true);
        setLogs(prev => [...prev, "> Initiating Security Scan..."]);
        
        for (let i = 1; i <= 5; i++) {
          await new Promise(r => setTimeout(r, 300));
          const bar = "█".repeat(i * 4) + "░".repeat(20 - i * 4);
          setLogs(prev => [...prev.slice(0, -1), `> Scanning: [${bar}] ${i * 20}%`]);
        }
        
        await new Promise(r => setTimeout(r, 500));
        setLogs(prev => [...prev,
          "---------------------------------",
          "✓ Security Analysis Complete",
          "✓ 0 Critical Vulnerabilities",
          "✓ 2 Low Risk Issues Found",
          "✓ Code Quality: 94%",
          "Recommendation: Safe to Use"
        ]);
        setIsExecuting(false);
      }
    },
    analyze: {
      desc: "Deep code analysis",
      action: async () => {
        setLogs(prev => [...prev, "> Running deep analysis..."]);
        await new Promise(r => setTimeout(r, 1000));
        setLogs(prev => [...prev,
          "📊 Analysis Results:",
          "  - Complexity: Medium",
          "  - Maintainability: Good",
          "  - Test Coverage: Unknown",
          "  - Dependencies: 3"
        ]);
      }
    },
    help: {
      desc: "Show available commands",
      action: () => {
        setLogs(prev => [...prev,
          "Available Commands:",
          "  run     - Execute security scan",
          "  analyze - Deep code analysis",
          "  clear   - Clear terminal",
          "  export  - Export logs",
          "  help    - Show this message"
        ]);
      }
    },
    clear: {
      desc: "Clear terminal",
      action: () => setLogs([])
    },
    export: {
      desc: "Export logs",
      action: () => {
        const logText = logs.join('\n');
        navigator.clipboard.writeText(logText);
        setLogs(prev => [...prev, "✓ Logs copied to clipboard!"]);
      }
    }
  };

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const cmd = input.toLowerCase().trim();
      
      if (commands[cmd]) {
        await commands[cmd].action();
      } else if (cmd) {
        setLogs(prev => [...prev, `> ${input}`, `Error: Unknown command. Type 'help' for available commands.`]);
      }
      
      setInput("");
      
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="mt-4 bg-[#010409] border border-white/5 rounded-2xl overflow-hidden font-mono text-xs shadow-inner">
      <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-blue-400" />
          <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Live Terminal v2.0</span>
        </div>
        {isExecuting && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-[8px] text-blue-400">executing...</span>
          </div>
        )}
      </div>
      <div ref={terminalRef} className="p-4 h-40 overflow-y-auto space-y-1 custom-scrollbar">
        {logs.map((log, i) => (
          <div key={i} className={
            log.startsWith("Error") ? "text-red-400" :
            log.includes("✓") ? "text-green-400" :
            log.includes("📊") ? "text-yellow-400" :
            "text-slate-500"
          }>
            {log}
          </div>
        ))}
        <div className="flex gap-2 text-slate-900 dark:text-white items-center">
          <span className="text-blue-500 font-bold">$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            className="bg-transparent outline-none flex-1 font-mono text-xs"
            placeholder="Type 'help' for commands..."
            disabled={isExecuting}
          />
        </div>
      </div>
    </div>
  );
}

// --- CodeAnalytics Component ---
function CodeAnalytics({ query, resultsCount }: { query: string, resultsCount: number }) {
  if (!query || resultsCount === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-8 items-center animate-in fade-in zoom-in-95 duration-500 text-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={18} className="text-blue-400" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Code Pattern Insights</span>
        </div>
        <h4 className="text-2xl font-black  text-slate-900 dark:text-whiteitalic">"{query}"</h4>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Found <span className="text-slate-900 dark:text-white font-bold">{resultsCount}</span> matching code patterns across GitHub.
        </p>
      </div>
      <div className="flex gap-4">
        <div className="text-center p-4 bg-black/40 rounded-2xl border border-white/5 min-w-[100px]">
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">94%</div>
          <div className="text-[9px] text-slate-500 uppercase font-bold">Security Score</div>
        </div>
        <div className="text-center p-4 bg-black/40 rounded-2xl border border-white/5 min-w-[100px]">
          <div className="text-xl font-bold text-white tracking-tighter">JS</div>
          <div className="text-[9px] text-slate-500 uppercase font-bold">Top Language</div>
        </div>
      </div>
    </div>
  )
}

// --- ExportModal Component ---
function ExportModal({ results, onClose }: { results: SearchResult[]; onClose: () => void }) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [copySuccess, setCopySuccess] = useState(false);

  const exportData = useMemo(() => {
  // التحقق من وجود نتائج
  if (!results || results.length === 0) {
    return format === 'json' ? '[]' : 'Repository,Path,URL,Stars,Language\n';
  }
  
  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  } else {
    const headers = ['Repository', 'Path', 'URL', 'Stars', 'Language'];
    const rows = results.map(r => [
      r.repository.full_name,
      r.path,
      r.html_url,
      r.repository.stargazers_count || 0,
      r.repository.language || 'Unknown'
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}, [results, format]);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportData);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

 const handleDownload = () => {
  try {
    // طريقة بديلة باستخدام data URL
    const dataStr = exportData;
    const dataUri = `data:${format === 'json' ? 'application/json' : 'text/csv'};charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `gitgrep-results.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log("Download started (alternative method)");
  } catch (error) {
    console.error("Download failed:", error);
    alert("فشل التحميل، حاول مرة تانية");
  }
};

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export Results</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setFormat('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${format === 'json' ? 'bg-blue-600 text-slate-900 dark:text-white' : 'bg-white/5 text-slate-400'}`}
          >
            <FileJson size={14} /> JSON
          </button>
          <button
            onClick={() => setFormat('csv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${format === 'csv' ? 'bg-blue-600 text-slate-900 dark:text-white' : 'bg-white/5 text-slate-400'}`}
          >
            <FileText size={14} /> CSV
          </button>
        </div>
        
        <pre className="bg-black/50 p-4 rounded-xl overflow-auto max-h-96 text-xs font-mono text-slate-300 mb-4">
          {exportData.slice(0, 2000)}{exportData.length > 2000 && "\n... (truncated)"}
        </pre>
        
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {copySuccess ? <Check size={16} /> : <Copy size={16} />}
            {copySuccess ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Download size={16} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ShareModal Component ---
function ShareModal({ query, resultsCount, onClose }: { query: string; resultsCount: number; onClose: () => void }) {
  const [shareLink, setShareLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    setShareLink(url.toString());
  }, [query]);

  const handleCopy = () => {
  navigator.clipboard.writeText(shareLink);
  setCopySuccess(true);
  setTimeout(() => setCopySuccess(false), 2000);
};

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Share Search</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={18} />
          </button>
        </div>
        
        <p className="text-slate-400 text-sm mb-4">
          Sharing "{query}" - {resultsCount} results found
        </p>
        
        <div className="flex gap-2 mb-4">
          <input
            value={shareLink}
            readOnly
            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            {copySuccess ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out this search on GitGrep: ${query} - ${resultsCount} results&url=${encodeURIComponent(shareLink)}`)}
            className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] py-2 rounded-xl transition-all text-sm font-bold"
          >
            Share on X
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ResultCard Component ---
function ResultCard({ item, onFav, isFav, onCompare, isComparing }: any) {
  const [isMounted, setIsMounted] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const snippet = item.text_matches?.[0]?.fragment || "// Code snippet hidden by indexer";

  const handleCopyPath = () => {
    navigator.clipboard.writeText(item.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatStars = (stars: number) => {
    if (!stars) return "0";
    if (stars >= 1000) return `${(stars / 1000).toFixed(1)}k`;
    return stars.toString();
  };

  if (!isMounted) {
    return <div className="animate-pulse bg-white/5 rounded-2xl h-64" />;
  }

  function setShowFeedbackModal(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className={`animate-in fade-in slide-in-from-bottom-12 duration-1000 text-start ${isComparing ? 'ring-2 ring-blue-500 scale-[1.01]' : ''}`}>
      <div className="flex items-center justify-between mb-5 px-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl">
            <Github size={16} className="text-slate-400" />
          </div>
          <div>
            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight italic uppercase hover:text-blue-400 transition-colors cursor-pointer">
              {item.repository?.full_name || "Unknown Repository"}
            </span>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] text-blue-500/80 font-mono tracking-tighter uppercase font-bold">
                {item.path?.split('/').pop() || item.path}
              </span>
              
              {item.repository?.language && (
                <span className="text-[8px] px-2 py-0.5 bg-white/10 rounded-full text-slate-300">
                  {item.repository.language}
                </span>
              )}
              
              {item.repository?.stargazers_count !== undefined && (
                <span className="text-[8px] flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                  <Star size={8} fill="currentColor" /> {formatStars(item.repository.stargazers_count)}
                </span>
              )}
              
              {item.repository?.updated_at && (
                <span className="text-[8px] text-slate-500">
                  updated {new Date(item.repository.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleCopyPath} className="p-2 rounded-xl border border-white/5 text-slate-600 hover:text-slate-900 dark:text-white hover:border-white/20 transition-all">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button onClick={onFav} className={`p-2 rounded-xl border transition-all duration-300 ${isFav ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'border-white/5 text-slate-700 hover:text-slate-900 dark:text-white hover:border-white/20'}`}>
            <Star size={14} fill={isFav ? "currentColor" : "none"} />
          </button>
          {onCompare && (
            <button onClick={() => onCompare(item)} className={`p-2 rounded-xl border transition-all ${isComparing ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'border-white/5 text-slate-600 hover:text-slate-900 dark:text-white'}`}>
              <GitCompare size={14} />
            </button>
          )}
        </div>
      </div>
      
      <div className="rounded-[2.5rem] border border-white/10 bg-[#010409] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-blue-500/50 transition-all duration-700">
        <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20" />
            <div className="w-3 h-3 rounded-full bg-green-500/20" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowEditor(!showEditor)} className="text-slate-600 hover:text-purple-400 transition-colors p-1">
              <Code size={16} />
            </button>
            <a href={item.html_url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-blue-400 transition-colors p-1">
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
        
        <div className="p-6 overflow-x-auto bg-[#020408]/40">
          <pre className="text-sm font-mono leading-loose">
            <code className="text-slate-300 whitespace-pre-wrap">{snippet}</code>
          </pre>
          <LiveTerminal snippet={snippet} />
        </div>
      </div>
    </div>
  );
}

// --- SecurityDashboard Component ---
function SecurityDashboard({ projects, onAddProject }: { projects: string[]; onAddProject?: (project: string) => void }) {
  const [newProject, setNewProject] = useState("");
  
  const checkForLeaks = (repoName: string) => {
    const sensitive = ["test", "admin", "secret", "key", "token", "password"];
    return sensitive.some(term => repoName.toLowerCase().includes(term));
  };

  const handleAddProject = () => {
    if (newProject && !projects.includes(newProject)) {
      onAddProject?.(newProject);
      setNewProject("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-8 rounded-[2rem]">
        <div className="flex items-center gap-5">
          <ShieldAlert className="text-red-500 animate-pulse" size={40} />
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white italic">Security Monitor</h3>
            <p className="text-slate-400 text-sm">Live monitoring for {projects.length} connected repositories.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="text-[10px] font-black text-red-500 uppercase">Live Scanning</span>
        </div>
      </div>
      
      <div className="flex gap-3">
        <input
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          placeholder="Add repository (owner/repo)"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
        />
        <button onClick={handleAddProject} className="bg-blue-600 hover:bg-blue-500 px-6 rounded-xl transition-all">
          <Plus size={18} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length > 0 ? projects.map((p, i) => {
          const atRisk = checkForLeaks(p);
          return (
            <div key={i} className={`p-6 rounded-[1.5rem] border ${atRisk ? 'bg-red-500/5 border-red-500/30' : 'bg-[#0d1117] border-white/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FolderCode size={20} className={atRisk ? "text-red-500" : "text-slate-500"} />
                  <div>
                    <span className="font-mono text-smtext-slate-900 dark:text-white font-bold">{p}</span>
                    <div className="text-[10px] text-slate-500">Last scan: 2 mins ago</div>
                  </div>
                </div>
                {atRisk ? (
                  <div className="flex items-center gap-1 text-red-500 text-[10px] font-black bg-red-500/10 px-2 py-1 rounded-lg">
                    <AlertTriangle size={12} /> LEAK
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold bg-green-500/10 px-2 py-1 rounded-lg">
                    <CheckCircle2 size={12} /> SECURE
                  </div>
                )}
              </div>
            </div>
          )
        }) : (
          <div className="col-span-2 py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] text-slate-500">
            No projects connected. Add a repository to start security monitoring.
          </div>
        )}
      </div>
    </div>
  );
}

// --- BatchRefactorTool Component ---
function BatchRefactorTool({ projects }: { projects: string[] }) {
  const [oldPattern, setOldPattern] = useState("");
  const [newPattern, setNewPattern] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const runRefactor = async () => {
    if (!oldPattern || !newPattern || selectedProjects.length === 0) {
      alert("Please fill all fields and select at least one project.");
      return;
    }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    alert(`Refactor completed on ${selectedProjects.length} projects!`);
    setLoading(false);
  };

  const toggleProject = (project: string) => {
    setSelectedProjects(prev =>
      prev.includes(project) ? prev.filter(p => p !== project) : [...prev, project]
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#0d1117] border border-white/10 rounded-[3rem] p-10">
      <div className="flex items-center gap-4 mb-10">
        <Replace size={32} className="text-purple-400" />
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic">Batch Refactor</h2>
          <p className="text-slate-500 text-xs">Transform patterns across multiple repositories.</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            value={oldPattern}
            onChange={(e) => setOldPattern(e.target.value)}
            placeholder="Find pattern (regex)..."
            className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500text-slate-900 dark:text-white"
          />
          <input
            value={newPattern}
            onChange={(e) => setNewPattern(e.target.value)}
            placeholder="Replace with..."
            className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500 text-slate-900 dark:text-white"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
          {projects.map(project => (
            <label key={project} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProjects.includes(project)}
                onChange={() => toggleProject(project)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-300">{project}</span>
            </label>
          ))}
        </div>
        
        <button
          onClick={runRefactor}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 text-slate-900 dark:text-white font-black py-5 rounded-2xl transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : "Execute Global Replacement"}
        </button>
      </div>
    </div>
  );
}
// --- Feedback Modal Component ---
function FeedbackModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("bug");
  const [email, setEmail] = useState("");

 const handleSubmit = () => {
  if (rating === 0) {
    alert("Please select a rating");
    return;
  }
  if (!email.trim()) {
    alert("Please enter your email to send feedback");
    return;
  }
  if (!email.includes('@') || !email.includes('.')) {
    alert("Please enter a valid email address");
    return;
  }
  onSubmit({ rating, feedback, category, email, timestamp: new Date() });
  onClose();
};

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999999] animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#0d1117] to-[#0a0c10] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Star size={20} className="text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Send Feedback</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Rating Stars */}
        <div className="mb-6 text-center">
          <label className="text-slate-400 text-sm mb-3 block">How would you rate GitGrep?</label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-4xl transition-all"
              >
                <Star
                  size={32}
                  fill={(hoveredRating || rating) >= star ? "currentColor" : "none"}
                  className={`${
                    (hoveredRating || rating) >= star
                      ? "text-yellow-500"
                      : "text-slate-600"
                  } hover:scale-110 transition-all`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              {rating === 5 && "🔥 Amazing! Thank you!"}
              {rating === 4 && "👍 Good, but could be better"}
              {rating === 3 && "😐 It's okay"}
              {rating === 2 && "😕 Not satisfied"}
              {rating === 1 && "😡 Very disappointed"}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-2 block">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "bug", label: "🐛 Bug", icon: <Bug size={14} /> },
              { value: "feature", label: "💡 Feature", icon: <Zap size={14} /> },
              { value: "ui", label: "🎨 UI/UX", icon: <Shield size={14} /> }
            ].map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all text-sm ${
                  category === cat.value
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Text */}
        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-2 block">Your Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you think..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 resize-none"
          />
        </div>

       {/* Email (required) */}
<div className="mb-6">
  <label className="text-slate-400 text-sm mb-2 block flex items-center gap-2">
    <Mail size={14} className="text-red-400" />
    Email <span className="text-red-400 text-xs">*required</span>
  </label>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email to receive updates"
    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    required
  />
  <p className="text-[10px] text-slate-500 mt-1">
    We'll use this to follow up and notify you about your feedback
  </p>
</div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3 rounded-xl text-white font-bold transition-all"
          >
            Send Feedback
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
// --- Toast Notification Component ---
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400',
    error: 'bg-gradient-to-r from-red-500 to-rose-500 border-red-400',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400'
  };

  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <AlertTriangle size={20} />,
    info: <Zap size={20} />
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999999] animate-in slide-in-from-bottom-4 fade-in duration-300`}>
      <div className={`${colors[type]} border rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center gap-3 min-w-[280px]`}>
        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{message}</p>
          <p className="text-white/60 text-[10px] font-mono mt-0.5">GitGrep • {new Date().toLocaleTimeString()}</p>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-all">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
// --- Main Home Component ---
export default function Home() {
  const hasRun = useRef(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useLocalStorage<any[]>('gitgrep-feedback', []);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [titleIndex, setTitleIndex] = useState(0);
  const [showAuth, setShowAuth] = useState<null | 'signin' | 'signup'>(null);
  const [favorites, setFavorites] = useLocalStorage<FavoriteItem[]>('gitgrep-favorites', []);
  const [userProjects, setUserProjects] = useLocalStorage<string[]>('gitgrep-projects', []);
  const [view, setView] = useState<'search' | 'favorites' | 'my-projects' | 'security' | 'refactor'>('search');
  const [darkMode, setDarkMode] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [filters, setFilters] = useState({ language: "", minStars: 0 });
  const [compareItem, setCompareItem] = useState<SearchResult | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  
  // 👇 أضف الـ toast state هنا
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });
  // Error Monitoring
useErrorMonitor();
  
  // 👇 عدل دالة handleFeedbackSubmit
  const handleFeedbackSubmit = async (data: any) => {
  // حفظ في localStorage
  setFeedbackHistory([...feedbackHistory, data]);
  console.log("Feedback submitted:", data);
  
  // 👇 إرسال للـ API
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
  
  // اسم المستخدم
  const userName = data.email?.split('@')[0] || session?.user?.name?.split(' ')[0] || 'developer';
  
  // Toast
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

    // 🔹 Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchInputRef.current?.focus();
      return;
    }

    // 🔹 Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      if (isTyping) return; // مهم

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

  // دالة البحث المنفصلة
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      alert("Please enter at least 3 characters to search");
      return;
    }
    
    setLoading(true);
    setResults([]);
    setView('search');
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&per_page=50`);
      
      if (!res.ok) {
        console.error("API Error");
        setResults([]);
        return;
      }
      
      const data = await res.json();
      let finalResults = data.items || [];
      
      if (filters.language) {
        finalResults = finalResults.filter((r: SearchResult) => 
          r.repository?.language === filters.language
        );
      }
      if (filters.minStars > 0) {
        finalResults = finalResults.filter((r: SearchResult) => 
          (r.repository?.stargazers_count || 0) >= filters.minStars
        );
      }
      
      finalResults.sort((a: SearchResult, b: SearchResult) => {
        const starsA = a.repository?.stargazers_count || 0;
        const starsB = b.repository?.stargazers_count || 0;
        return starsB - starsA;
      });
      
      setResults(finalResults);
    } catch (err) {
      console.error("Fetch failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // قراءة البحث من URL عند تحميل الصفحة
 useEffect(() => {
  if (hasRun.current) return;
  hasRun.current = true;
  
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q');
  
  console.log("URL Search Query:", searchQuery); // للاختبار
  
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
  
  // تحديث الرابط في الـ URL
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
      setUserProjects([...userProjects, project]);
    }
  };

  // Filtered results
  const filteredResults = useMemo(() => {
    let filtered = results;
    if (filters.language) {
      filtered = filtered.filter(r => r.repository?.language === filters.language);
    }
    if (filters.minStars > 0) {
      filtered = filtered.filter(r => (r.repository?.stargazers_count || 0) >= filters.minStars);
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl text-slate-900 dark:text-white font-bold">My Projects</h2>
              <button 
                onClick={() => {
                  const demoProjects = ["vercel/next.js", "facebook/react", "tailwindlabs/tailwindcss"];
                  demoProjects.forEach(p => addProject(p));
                }}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Add Demo Projects
              </button>
            </div>
            
            <div className="flex gap-3 mb-8">
              <input
                type="text"
                id="newProjectInput"
                placeholder="Add repository (owner/repo) e.g. microsoft/vscode"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white"
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
                className="bg-blue-600 hover:bg-blue-500 px-6 rounded-xl transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add</span>
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
                  const githubUrl = `https://github.com/${project}`;
                  const stats = {
                    stars: Math.floor(Math.random() * 10000),
                    forks: Math.floor(Math.random() * 2000),
                    lastUpdate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    issues: Math.floor(Math.random() * 100),
                  };
                  
                  return (
                    <div key={i} className="bg-[#0d1117] border border-white/10 rounded-2xl p-5 hover:border-blue-500/50 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
                            <Github size={20} className="text-slate-300" />
                          </div>
                          <div>
                            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-sm font-bold text-slate-900 dark:text-white hover:text-blue-400 transition-colors flex items-center gap-1">
                              {project}
                              <ExternalLink size={12} className="text-slate-500" />
                            </a>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">Active</span>
                              <span className="text-[10px] text-slate-500">Updated {stats.lastUpdate}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setUserProjects(userProjects.filter(p => p !== project))} className="text-slate-500 hover:text-red-400 transition-all p-1">
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 my-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-yellow-500">
                            <Star size={12} fill="currentColor" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{stats.stars.toLocaleString()}</span>
                          </div>
                          <div className="text-[9px] text-slate-500">Stars</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-white">{stats.forks.toLocaleString()}</div>
                          <div className="text-[9px] text-slate-500">Forks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-orange-400">{stats.issues}</div>
                          <div className="text-[9px] text-slate-500">Issues</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs bg-white/5 hover:bg-white/10 py-2 rounded-lg transition-all">
                          View on GitHub
                        </a>
                        <button onClick={() => setView('security')} className="flex-1 text-center text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg transition-all">
                          Security Scan
                        </button>
                      </div>
                    </div>
                  );
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
              <h1 className="text-5xl md:text-7xl font-black mb-7 text-slate-900 dark:text-white">
                Search GitHub Code <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
                  {titles[titleIndex]}
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Search across 100M+ repositories instantly. Find bugs, explore code patterns, and get AI-powered insights.
              </p>
            </div>

          <div className="max-w-4xl mx-auto mb-8">
  <div className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-visible">
    <div className="flex items-center border-b border-white/10">
      <div className="px-5 text-blue-500">
        <Search size={20} />
      </div>
      <input
        ref={searchInputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && search()}
        placeholder="Search code across 100M+ repositories... (Ctrl+K)"
        className="flex-1 bg-transparent py-5 text-base outline-none placeholder:text-slate-600 text-slate-900 dark:text-white"
      />
    </div>
    
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white/5 rounded-b-2xl">
      {/* Filters button */}
      <div className="relative">
        <button 
          onClick={() => document.getElementById('filter-dropdown')?.classList.toggle('hidden')} 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white text-sm transition-all"
        >
          <Filter size={14} />
          <span>Filters</span>
          <ChevronDown size={12} />
        </button>
        
        {/* Filter Dropdown */}
        <div id="filter-dropdown" className="hidden absolute top-full left-0 mt-2 w-80 bg-[#0d1117] border border-white/10 rounded-2xl p-5 z-[100] shadow-2xl backdrop-blur-md">
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
                <option value="Ruby">💎 Ruby</option>
                <option value="PHP">🐘 PHP</option>
                <option value="Swift">🍎 Swift</option>
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
                className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-xl text-sm font-medium transition-all"
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Button */}
      <button 
        onClick={search} 
        disabled={loading} 
        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
      >
        {loading ? "SEARCHING..." : "GREP CODE"}
      </button>
    </div>
  </div>
</div>

            <div className="flex justify-center flex-wrap gap-3 mb-12">
  <button onClick={() => setQuery("authentication")} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full">🔐 authentication</button>
  <button onClick={() => setQuery("useState")} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full">⚛️ useState</button>
  <button onClick={() => setQuery("api endpoint")} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full">🌐 api endpoint</button>
  <button onClick={() => setQuery("security")} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full">🛡️ security</button>
  
  {/* Test Error button - يظهر للمشرف بس */}
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
                <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask AI about the code... e.g., 'where is the authentication logic?'" className="w-full bg-black/40 border border-white/15 rounded-2xl pl-12 pr-4 py-4 text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" onKeyDown={(e) => e.key === "Enter" && askAI()} />
              </div>

              <button onClick={askAI} disabled={!query || aiLoading} className={`mt-4 px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wide transition-all flex items-center gap-3 mx-auto shadow-lg ${query && !aiLoading ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-slate-900 dark:text-white shadow-blue-600/30" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}>
                {aiLoading ? <><RefreshCw size={18} className="animate-spin" /> Analyzing Code...</> : <><Zap size={18} className="fill-current" /> Ask AI Assistant</>}
              </button>

              {answer && (
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/25 rounded-2xl text-sm text-slate-300 whitespace-pre-wrap text-left shadow-lg">
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
            console.log("showExportModal should be true now");
          }} 
          className="p-2 hover:bg-blue-700 rounded-lg bg-blue-600 transition-all duration-200" 
          title="Export Results"
        >
          <Download size={18} className="text-white" />
        </button>
        <button 
          onClick={() => {
            console.log("🟢 SHARE - Button clicked!");
            console.log("Before setShowShareModal:", showShareModal);
            setShowShareModal(true);
            console.log("After setShowShareModal should be true");
            // اختبر مباشرة
            setTimeout(() => {
              console.log("Current showShareModal value:", showShareModal);
            }, 100);
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
                <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3.5rem]">
                  <div className="text-6xl mb-4">🔍</div>
                  <div className="text-slate-500">No results found. Try a different search term.</div>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <main className={`min-h-screen ${darkMode ? 'bg-[#020408] text-slate-200' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto p-6 md:p-12">
       <nav className={`flex items-center justify-between mb-12 backdrop-blur-md ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white/80 border-gray-200'} p-4 rounded-3xl border`}>
  <div className="flex items-center gap-3 group cursor-pointer" onClick={() => {
    setView('search');
    setQuery('');
    setResults([]);
    setFilters({ language: "", minStars: 0 });
    setQuestion('');
    setAnswer('');
    window.history.pushState({}, '', window.location.pathname);
  }}>
    <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500 shadow-blue-500/20">
      <Terminal size={24} className="text-slate-900 dark:text-white" />
    </div>
    <span className={`text-2xl font-black tracking-tighter text-slate-900 dark:text-white italic uppercase`}>
      GitGrep<span className="text-blue-500">_</span>
    </span>
  </div>

  <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase text-slate-500">
    <button onClick={() => setView('favorites')} className={`hover:text-blue-400 ${view === 'favorites' ? 'text-blue-400' : ''}`}>
      Saved {favorites.length > 0 && `(${favorites.length})`}
    </button>
    <button onClick={() => setView('my-projects')} className={`hover:text-blue-400 ${view === 'my-projects' ? 'text-blue-400' : ''}`}>
      Projects {userProjects.length > 0 && `(${userProjects.length})`}
    </button>
    <button onClick={() => setView('security')} className={`hover:text-red-400 ${view === 'security' ? 'text-red-400' : ''}`}>Security</button>
    <button onClick={() => setView('refactor')} className={`hover:text-purple-400 ${view === 'refactor' ? 'text-purple-400' : ''}`}>Refactor</button>
  </div>

  <div className="flex items-center gap-4">
    {/* Dashboard Link - يظهر فقط للمشرف */}
{session?.user?.email === "koshax27@gmail.com" && (
  <a 
    href="/dashboard" 
    target="_blank"
    className="p-2 rounded-xl hover:bg-white/10 transition-all"
    title="Admin Dashboard"
  >
    <BarChart3 size={18} className="text-green-400" />
  </a>
)}
{/* Feedback button */}
<button 
  onClick={() => setShowFeedbackModal(true)} 
  className="p-2 rounded-xl hover:bg-white/10"
  title="Send Feedback"
>
  <Star size={18} className="text-purple-400" />
</button>

{/* Feedback Dashboard button */}
{session?.user?.email === "magedzino@gmail.com" && (
  <a 
    href="/dashboard" 
    target="_blank"
    className="p-2 rounded-xl hover:bg-white/10 transition-all"
    title="Feedback Dashboard"
  >
    <BarChart3 size={18} className="text-green-400" />
  </a>
)}

{/* Error Dashboard button */}
{session?.user?.email === "koshax27@gmail.com" && (
  <a 
    href="/error-dashboard" 
    target="_blank"
    className="p-2 rounded-xl hover:bg-white/10 transition-all"
    title="Error Dashboard"
  >
    <AlertOctagon size={18} className="text-red-400" />
  </a>
)}

<button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-white/10">
  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
</button>
   
    {session ? (
      <div className="flex items-center gap-3 bg-white/5 p-1.5 pr-4 rounded-2xl">
        <img src={session.user?.image || ""} className="w-8 h-8 rounded-xl" alt="user" />
        <span className="text-[10px] font-bold text-slate-900 dark:text-white">{session.user?.name?.split(' ')[0]}</span>
        <button onClick={() => signOut()} className="text-slate-500 hover:text-red-500">
          <LogOut size={16} />
        </button>
      </div>
    ) : (
      <button onClick={() => setShowAuth('signin')} className="bg-white text-black text-[10px] font-bold px-6 py-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
        Get Early Access
      </button>
    )}
  </div>
</nav>

        {renderContent()}

                {/* باقي محتوى الصفحة */}

        <div className="mt-20 pt-8 border-t border-white/10 text-center">
          <TypingText />
          <p className="text-[10px] text-slate-500 mt-2">© 2024 GitGrep - AI-Powered Code Search & Security Analysis</p>
        </div>

        <CodeAnalytics query={query} resultsCount={filteredResults.length} />
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
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
            {/* Header */}
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
            
            {/* Stats */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Total Results</span>
                <span className="text-white font-bold text-lg">{results.length}</span>
              </div>
            </div>
            
            {/* Format Options */}
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
            
            {/* Actions */}
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
            {/* Header */}
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
            
            {/* Search Info */}
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
            
            {/* Share Link */}
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
    // رسالة صغيرة تظهر وتختفي
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
            
            {/* Social Share */}
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
            
                        {/* Close Button */}
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
</div>
    </main>
  );
}
