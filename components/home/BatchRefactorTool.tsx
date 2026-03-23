"use client";

import { useState } from "react";
import { Replace, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface RepoFile {
  name: string;
  path: string;
  url: string;
}

export function BatchRefactorTool({ projects }: { projects: string[] }) {
  const [oldPattern, setOldPattern] = useState("");
  const [newPattern, setNewPattern] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [results, setResults] = useState<{ repo: string; files: RepoFile[]; success: boolean }[]>([]);
  const [refactorResults, setRefactorResults] = useState<{ repo: string; file: string; success: boolean; newUrl?: string }[]>([]);

  const searchInRepo = async (repo: string, pattern: string) => {
    try {
      const [owner, repoName] = repo.split('/');
      console.log(`🔍 Searching ${owner}/${repoName} for "${pattern}"`);
      
      const res = await fetch(
        `/api/github/search/code?q=${encodeURIComponent(pattern)}+repo:${owner}/${repoName}&per_page=30`
      );

      console.log(`📡 ${repo}: ${res.status}`);
      
      if (!res.ok) {
        console.log(`❌ ${repo}: ${res.status}`);
        return { repo, files: [], success: false };
      }
      
      const data = await res.json();
      const files: RepoFile[] = data.items?.map((item: any) => ({
        name: item.name,
        path: item.path,
        url: item.html_url,
      })) || [];
      
      console.log(`✅ ${repo}: found ${files.length} files`);
      return { repo, files, success: true };
    } catch (error) {
      console.error(`Error searching in ${repo}:`, error);
      return { repo, files: [], success: false };
    }
  };

  const runRefactor = async () => {
    if (!oldPattern || !newPattern || selectedProjects.length === 0) {
      alert("Please fill all fields and select at least one project.");
      return;
    }
    
    setLoading(true);
    setResults([]);
    setRefactorResults([]);
    
    const searchResults = await Promise.all(
      selectedProjects.map(project => searchInRepo(project, oldPattern))
    );
    
    setResults(searchResults);
    
    // Build refactor results from actual search results
    const newRefactorResults: { repo: string; file: string; success: boolean; newUrl?: string }[] = [];
    searchResults.forEach(result => {
      result.files.forEach(file => {
        newRefactorResults.push({
          repo: result.repo,
          file: file.path,
          success: true,
          newUrl: file.url.replace(file.path, file.path.replace(oldPattern, newPattern))
        });
      });
    });
    
    setRefactorResults(newRefactorResults);
    setLoading(false);
  };

  const toggleProject = (project: string) => {
    setSelectedProjects((prev) =>
      prev.includes(project) ? prev.filter((p) => p !== project) : [...prev, project]
    );
  };

  const totalMatches = results.reduce((acc, r) => acc + r.files.length, 0);

  return (
    <div className="max-w-6xl mx-auto bg-[#0d1117] border border-white/10 rounded-[2rem] p-6 sm:p-10">
      <div className="flex items-center gap-4 mb-8">
        <Replace size={32} className="text-purple-400" />
        <div>
          <h2 className="text-2xl font-black text-white italic">Batch Refactor</h2>
          <p className="text-slate-500 text-sm">Search and replace patterns across multiple repositories</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={oldPattern}
            onChange={(e) => setOldPattern(e.target.value)}
            placeholder="Find pattern (regex) e.g. useState"
            className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500 text-white placeholder:text-slate-500"
          />
          <input
            value={newPattern}
            onChange={(e) => setNewPattern(e.target.value)}
            placeholder="Replace with e.g. useMemo"
            className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500 text-white placeholder:text-slate-500"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Select repositories to refactor:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2">
            {projects.length === 0 ? (
              <p className="text-slate-500 col-span-full text-center py-8">No projects added. Add some from the Projects tab.</p>
            ) : (
              projects.map(project => (
                <label key={project} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project)}
                    onChange={() => toggleProject(project)}
                    className="w-4 h-4 accent-purple-500"
                  />
                  <span className="text-sm text-slate-300 font-mono">{project}</span>
                </label>
              ))
            )}
          </div>
        </div>
        
        <button
          onClick={runRefactor}
          disabled={loading || selectedProjects.length === 0 || !oldPattern || !newPattern}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <><RefreshCw size={18} className="animate-spin" /> Scanning repositories...</>
          ) : (
            <><Replace size={18} /> Execute Refactor</>
          )}
        </button>
        
        {results.length > 0 && (
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-3">🔍 Search Results</h3>
            <p className="text-slate-400 text-sm mb-4">Found {totalMatches} matches in {results.length} repositories</p>
            {results.map((result, idx) => (
              <div key={idx} className="mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400">📁</span>
                  <span className="text-white font-mono text-sm">{result.repo}</span>
                  <span className="text-xs text-slate-500">{result.files.length} matches</span>
                </div>
                <div className="pl-6 space-y-1">
                  {result.files.slice(0, 5).map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">📄</span>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                        {file.path}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {refactorResults.length > 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} /> Refactor Preview
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Found {refactorResults.length} occurrences of "{oldPattern}" that will be replaced with "{newPattern}"
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {refactorResults.slice(0, 10).map((result, idx) => (
                <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="font-mono">{result.repo}:</span>
                  <span className="text-slate-400 truncate">{result.file}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
              <p className="text-xs text-yellow-400 flex items-center gap-1">
                <AlertCircle size={14} />
                Note: This is a preview. GitHub API does not support direct code modification. Use the links above to manually update files.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}