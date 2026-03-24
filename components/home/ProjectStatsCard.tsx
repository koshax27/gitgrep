'use client';

import { useState, useEffect } from 'react';
import { Star, X, ExternalLink, Github } from 'lucide-react';

interface ProjectStatsCardProps {
  project: string;
  onRemove: () => void;
}

export function ProjectStatsCard({ project, onRemove }: ProjectStatsCardProps) {
  const [stats, setStats] = useState<{
    stars: number;
    forks: number;
    issues: number;
    updatedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const [owner, name] = project.split('/');
    
    async function fetchStats() {
      try {
        // شوف لو في localStorage
        const cacheKey = `project_${owner}_${name}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          setStats(JSON.parse(cached));
          setLoading(false);
        }

        // جيب بيانات جديدة من API
        const res = await fetch(`/api/github/repo/${owner}/${name}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        
        const data = await res.json();
        
        const statsData = {
          stars: data.stars,
          forks: data.forks,
          issues: data.issues,
          updatedAt: data.updatedAt,
        };
        
        setStats(statsData);
        localStorage.setItem(cacheKey, JSON.stringify(statsData));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(true);
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [project]);

  const [owner, name] = project.split('/');
  const lastUpdateDate = stats?.updatedAt ? new Date(stats.updatedAt).toLocaleDateString() : 'Unknown';

  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-blue-500/50 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
  <div className="flex items-center gap-3 w-full sm:w-auto">
    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
      <Github size={20} className="text-slate-300" />
    </div>
    <div className="flex-1 min-w-0">
      <a 
        href={`https://github.com/${project}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="font-mono text-xs sm:text-sm font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1 break-all"
      >
        <span className="truncate">{project}</span>
        <ExternalLink size={12} className="text-slate-500 flex-shrink-0" />
      </a>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="text-[9px] sm:text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full whitespace-nowrap">
          {loading ? 'Loading...' : 'Active'}
        </span>
        <span className="text-[9px] sm:text-[10px] text-slate-500 truncate">
          Updated {lastUpdateDate}
        </span>
      </div>
    </div>
  </div>
  <button 
    onClick={onRemove} 
    className="text-slate-500 hover:text-red-400 transition-all p-1 flex-shrink-0 self-end sm:self-center"
  >
    <X size={16} />
  </button>
</div>
      
      {loading ? (
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 my-3">
          <div className="text-center">
            <div className="h-4 w-12 bg-white/10 animate-pulse rounded mx-auto"></div>
            <div className="h-3 w-8 bg-white/5 animate-pulse rounded mx-auto mt-1"></div>
          </div>
          <div className="text-center">
            <div className="h-4 w-12 bg-white/10 animate-pulse rounded mx-auto"></div>
            <div className="h-3 w-8 bg-white/5 animate-pulse rounded mx-auto mt-1"></div>
          </div>
          <div className="text-center">
            <div className="h-4 w-12 bg-white/10 animate-pulse rounded mx-auto"></div>
            <div className="h-3 w-8 bg-white/5 animate-pulse rounded mx-auto mt-1"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-3 text-red-400 text-xs">
          Failed to load stats
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-2 py-3 border-y border-white/10 my-3">
  <div className="text-center">
    <div className="flex items-center justify-center gap-1 text-yellow-500">
      <Star size={12} fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="text-xs sm:text-sm font-bold text-white">
        {stats?.stars?.toLocaleString() || '0'}
      </span>
    </div>
    <div className="text-[8px] sm:text-[9px] text-slate-500">Stars</div>
  </div>
  <div className="text-center">
    <div className="text-xs sm:text-sm font-bold text-white">
      {stats?.forks?.toLocaleString() || '0'}
    </div>
    <div className="text-[8px] sm:text-[9px] text-slate-500">Forks</div>
  </div>
  <div className="text-center">
    <div className="text-xs sm:text-sm font-bold text-orange-400">
      {stats?.issues?.toLocaleString() || '0'}
    </div>
    <div className="text-[8px] sm:text-[9px] text-slate-500">Issues</div>
  </div>
</div>
      )}
      
      <div className="flex gap-2 mt-3">
  <a 
    href={`https://github.com/${project}`} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="flex-1 text-center text-[10px] sm:text-xs bg-white/5 hover:bg-white/10 py-2 rounded-lg transition-all"
  >
    View on GitHub
  </a>
  <button 
    className="flex-1 text-center text-[10px] sm:text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg transition-all"
  >
    Security Scan
  </button>
      </div>
    </div>
  );
}