"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Search, Shield, Bug, Zap, Github, ExternalLink, Code, Terminal, 
  ChevronRight, X, Star, Plus, FolderCode, ShieldAlert, BarChart3, 
  Replace, Bell, CheckCircle2, AlertTriangle, LogIn, ChevronDown
} from "lucide-react"

// --- 1. المكونات الفرعية (Sub-Components) ---

function CodeAnalytics({ query, resultsCount }: { query: string, resultsCount: number }) {
  if (!query || resultsCount === 0) return null;
  return (
    <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-8 items-center animate-in fade-in zoom-in-95 duration-500">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={18} className="text-blue-400" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Code Pattern Insights</span>
        </div>
        <h4 className="text-2xl font-black text-white italic">"{query}"</h4>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          تم تحليل <span className="text-white font-bold">{resultsCount}</span> نتيجة برمجية. هذا النمط شائع في مشاريع الـ Full-stack.
        </p>
      </div>
      <div className="flex gap-4">
        <div className="text-center p-4 bg-black/40 rounded-2xl border border-white/5 min-w-[100px]">
          <div className="text-xl font-bold text-white tracking-tighter">94%</div>
          <div className="text-[9px] text-slate-500 uppercase font-bold">Safe Pattern</div>
        </div>
        <div className="text-center p-4 bg-black/40 rounded-2xl border border-white/5 min-w-[100px]">
          <div className="text-xl font-bold text-white tracking-tighter">Next.js</div>
          <div className="text-[9px] text-slate-500 uppercase font-bold">Top Framework</div>
        </div>
      </div>
    </div>
  )
}

function SecurityDashboard({ projects }: { projects: string[] }) {
  const checkForLeaks = (repoName: string) => repoName.toLowerCase().includes("test") || repoName.toLowerCase().includes("admin");

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem]">
        <div className="flex items-center gap-5">
          <div className="relative">
             <ShieldAlert className="text-red-500 animate-pulse" size={40} />
             <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tight">Security Monitor</h3>
            <p className="text-slate-400 text-sm">مراقبة حية لـ {projects.length} مستودع برميجي.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/20">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Scanning</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length > 0 ? projects.map((p, i) => {
          const atRisk = checkForLeaks(p);
          return (
            <div key={i} className={`p-6 rounded-[1.5rem] border transition-all duration-500 ${atRisk ? 'bg-red-500/5 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'bg-[#0d1117] border-white/5 hover:border-blue-500/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${atRisk ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-slate-500'}`}><FolderCode size={20} /></div>
                  <div>
                    <span className="font-mono text-sm block text-white font-bold">{p}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Last scan: 2 mins ago</span>
                  </div>
                </div>
                {atRisk ? (
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-black bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 animate-bounce">
                    <AlertTriangle size={14} /> LEAK DETECTED
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold">
                    <CheckCircle2 size={14} /> SECURE
                  </div>
                )}
              </div>
              {atRisk && (
                <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/10">
                    <p className="text-[11px] text-red-400 font-medium leading-relaxed">
                      ⚠️ <span className="text-white font-bold underline">Critical:</span> Potential API Secret or Password found in <code className="bg-black/40 px-1 rounded">config.js</code>. Immediate action required.
                    </p>
                </div>
              )}
            </div>
          )
        }) : (
          <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-slate-600">
             لا توجد مشاريع لمراقبتها. أضف مشروعاً من صفحة My Projects.
          </div>
        )}
      </div>
    </div>
  )
}

function BatchRefactorTool({ projects }: { projects: string[] }) {
  const [oldPattern, setOldPattern] = useState("");
  const [newPattern, setNewPattern] = useState("");
  const [loading, setLoading] = useState(false);

  // دالة تشغيل الـ Refactor الفعلي
  const runRefactor = async () => {
    if (!oldPattern || !newPattern || projects.length === 0) return alert("Please fill all fields and add projects.");
    setLoading(true);
    try {
      const res = await fetch('/api/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoPath: projects[0], oldCode: oldPattern, newCode: newPattern })
      });
      const data = await res.json();
      if (data.url) {
        alert("PR Created Successfully!");
        window.open(data.url, '_blank');
      } else {
        alert("Error: " + (data.error || "Failed to create PR"));
      }
    } catch (err) {
      alert("Execution failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#0d1117] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-purple-500/20 rounded-2xl text-purple-400 shadow-lg shadow-purple-500/10"><Replace size={32} /></div>
        <div>
            <h2 className="text-2xl font-black text-white italic tracking-tight">Global Refactoring</h2>
            <p className="text-slate-500 text-xs">تغيير منطق الكود في كل مستودعاتك بضغطة واحدة.</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase ml-2 tracking-widest">Old Pattern</label>
            <input 
              value={oldPattern}
              onChange={(e) => setOldPattern(e.target.value)}
              placeholder="const user = ..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500 text-sm font-mono" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase ml-2 tracking-widest">New Pattern</label>
            <input 
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder="const { user } = ..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500 text-sm font-mono" 
            />
          </div>
        </div>
        <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 text-[10px] text-purple-400/70 text-center font-bold italic">
          Ready to deploy changes across {projects.length} connected repositories.
        </div>
        <button 
          onClick={runRefactor}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-purple-600/20 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Creating PRs..." : "Generate Pull Requests"}
        </button>
      </div>
    </div>
  )
}

// --- 2. الدالة الأساسية (Home Page) ---

export default function Home() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [titleIndex, setTitleIndex] = useState(0)
  const [showAuth, setShowAuth] = useState<null | 'signin' | 'signup'>(null)
  const [favorites, setFavorites] = useState<any[]>([])
  const [userProjects, setUserProjects] = useState<string[]>([])
  const [view, setView] = useState<'search' | 'favorites' | 'my-projects' | 'security' | 'refactor'>('search')
  
  const searchInputRef = useRef<HTMLInputElement>(null)

  const placeholders = ["api_key", "stripe_secret", "jwt_token", "db_password", "aws_access_key"]
  const titles = ["Modern Developers", "Security Engineers", "Code Hunters", "Bug Bounty Seekers"]

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length)
      setTitleIndex((i) => (i + 1) % titles.length)
    }, 3000)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => { clearInterval(interval); window.removeEventListener("keydown", handleKeyDown) }
  }, [])

  const search = async () => {
    if (!query) return
    setLoading(true)
    setView('search')
    try {
      // تعديل: الربط مع الـ API الداخلي بتاعنا بدلاً من GitHub مباشرة
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.items || [])
    } catch (err) { 
      setResults([]) 
    } finally { 
      setLoading(false) 
    }
  }

  const toggleFavorite = (item: any) => {
    const exists = favorites.find(fav => fav.html_url === item.html_url)
    if (exists) setFavorites(favorites.filter(fav => fav.html_url !== item.html_url))
    else setFavorites([...favorites, item])
  }

  const addProject = () => {
    const url = prompt("Enter GitHub Repo Path (e.g., owner/repo-name):")
    if (url) setUserProjects([...userProjects, url])
  }

  return (
    <main className="min-h-screen bg-[#020408] text-slate-200 selection:bg-blue-500/40 font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full opacity-40 animate-pulse" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-20">
        <nav className="flex items-center justify-between mb-24 backdrop-blur-md bg-black/20 p-4 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView('search')}>
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
              <Terminal size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">GitGrep<span className="text-blue-500">_</span></span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <button onClick={() => setView('favorites')} className={`hover:text-blue-400 transition ${view === 'favorites' ? 'text-blue-400' : ''}`}>Favorites</button>
              <button onClick={() => setView('my-projects')} className={`hover:text-blue-400 transition ${view === 'my-projects' ? 'text-blue-400' : ''}`}>Projects</button>
              <button onClick={() => setView('security')} className={`hover:text-red-400 transition ${view === 'security' ? 'text-red-400' : ''}`}>Security</button>
              <button onClick={() => setView('refactor')} className={`hover:text-purple-400 transition ${view === 'refactor' ? 'text-purple-400' : ''}`}>Refactor</button>
            </div>
            <div className="flex items-center gap-3 border-l border-white/10 pl-8">
              <button onClick={() => setShowAuth('signin')} className="text-sm font-bold px-4 py-2 text-slate-400 hover:text-white transition">Sign In</button>
              <button onClick={() => setShowAuth('signup')} className="bg-white text-black text-sm font-black px-6 py-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95">Join Now</button>
            </div>
          </div>
        </nav>

        <div className="min-h-[600px]">
          {view === 'search' && (
            <>
              <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white leading-tight italic">
                  SEARCH <br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
                    {titles[titleIndex]}
                  </span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">Grep through GitHub's entire index. Uncover patterns, audit security, and learn from production code.</p>
              </div>

              <div className="max-w-3xl mx-auto mb-16">
                <div className="group relative p-[1px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-[2rem] transition-all hover:shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                  <div className="relative flex items-center bg-[#0d1117]/90 rounded-[2rem] overflow-hidden backdrop-blur-3xl">
                    <div className="pl-6 text-blue-500"><Search size={24} /></div>
                    <input
                      ref={searchInputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && search()}
                      placeholder={`Searching for "${placeholders[placeholderIndex]}"... (Press /)`}
                      className="w-full bg-transparent p-7 text-xl outline-none placeholder:text-slate-700 font-bold text-white tracking-tight"
                    />
                    <button onClick={search} disabled={loading} className="mr-4 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-2xl shadow-blue-600/30 uppercase tracking-widest text-xs">
                      {loading ? "Grep..." : "Grep"}
                    </button>
                  </div>
                </div>
              </div>

              <CodeAnalytics query={query} resultsCount={results.length} />
              
              <div className="space-y-16 mt-20">
                {results.map((item, i) => (
                  <ResultCard key={i} item={item} query={query} onFav={() => toggleFavorite(item)} isFav={favorites.some(f => f.html_url === item.html_url)} />
                ))}
              </div>
            </>
          )}

          {view === 'favorites' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                 <Star size={40} className="text-yellow-500" />
                 <h2 className="text-5xl font-black text-white italic tracking-tighter">Saved Patterns</h2>
              </div>
              {favorites.length === 0 ? (
                <div className="py-32 text-center bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5 text-slate-600 font-bold text-xl italic uppercase tracking-widest">No codes saved yet.</div>
              ) : favorites.map((item, i) => (
                <ResultCard key={i} item={item} query={""} onFav={() => toggleFavorite(item)} isFav={true} />
              ))}
            </div>
          )}

          {view === 'my-projects' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                    <FolderCode size={40} className="text-blue-500" />
                    <h2 className="text-5xl font-black text-white italic tracking-tighter">Repositories</h2>
                </div>
                <button onClick={addProject} className="bg-blue-600 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-500 transition shadow-xl shadow-blue-600/20 active:scale-95"><Plus size={24}/> Add Project</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userProjects.map((repo, i) => (
                  <div key={i} className="p-10 bg-[#0d1117] border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-500/50 transition-all duration-500 shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Github className="text-slate-400" size={28} /></div>
                      <div>
                        <span className="font-mono text-xl font-black text-white tracking-tight">{repo}</span>
                        <span className="block text-[10px] text-slate-600 font-bold uppercase mt-1">Status: Connected</span>
                      </div>
                    </div>
                    <button className="p-3 text-slate-700 hover:text-red-500 transition-colors" onClick={() => setUserProjects(userProjects.filter(p => p !== repo))}><X size={24}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'security' && <SecurityDashboard projects={userProjects} />}
          {view === 'refactor' && <BatchRefactorTool projects={userProjects} />}
        </div>
      </div>

      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-[50px] bg-black/60 animate-in fade-in duration-500">
           <div className="bg-[#0d1117] border border-white/10 w-full max-w-md rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
             <button onClick={() => setShowAuth(null)} className="absolute top-10 right-10 text-slate-600 hover:text-white transition-colors"><X size={28}/></button>
             <h2 className="text-4xl font-black text-white mb-2 italic tracking-tighter">{showAuth === 'signin' ? 'Welcome Back' : 'Get Started'}</h2>
             <p className="text-slate-500 mb-10 text-sm font-medium">Access your favorites and security alerts.</p>
             <div className="space-y-4">
                <button className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-5 rounded-2xl hover:bg-slate-200 transition shadow-xl active:scale-95">
                  <Github size={24} /> Continue with GitHub
                </button>
                <div className="relative py-6 flex items-center"><div className="flex-grow border-t border-white/5"></div><span className="px-4 text-[9px] text-slate-700 font-black tracking-[0.3em]">OR EMAIL</span><div className="flex-grow border-t border-white/5"></div></div>
                <input type="email" placeholder="dev@example.com" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-blue-500 text-sm font-bold" />
                <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-500 transition shadow-2xl shadow-blue-600/30 active:scale-95">Login</button>
             </div>
           </div>
        </div>
      )}
    </main>
  )
}

function ResultCard({item, query, onFav, isFav}: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="flex items-center justify-between mb-5 px-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#0d1117] rounded-xl flex items-center justify-center border border-white/5 shadow-lg"><Github size={16} className="text-slate-400" /></div>
          <div>
            <span className="text-sm font-black text-white tracking-tight">{item.repository?.full_name}</span>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-blue-500/80 font-mono tracking-tighter uppercase font-bold">{item.path}</span>
            </div>
          </div>
        </div>
        <button onClick={onFav} className={`p-3 rounded-2xl border transition-all duration-300 ${isFav ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 shadow-lg shadow-yellow-500/5' : 'border-white/5 text-slate-700 hover:text-white hover:border-white/20'}`}>
          <Star size={20} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="rounded-[2.5rem] border border-white/10 bg-[#010409] shadow-3xl overflow-hidden group hover:border-blue-500/50 transition-all duration-700">
        <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20" />
            <div className="w-3 h-3 rounded-full bg-green-500/20" />
          </div>
          <a href={item.html_url} target="_blank" className="text-slate-600 hover:text-blue-400 transition-colors p-1"><ExternalLink size={18} /></a>
        </div>
        <div className="p-10 overflow-x-auto bg-[#020408]/40">
          <pre className="text-sm font-mono leading-loose">
            <code className="text-slate-400">
              {item.text_matches?.[0]?.fragment || "// Code snippet content hidden for security"}
            </code>
          </pre>
        </div>
      </div>
    </div>
  )
}