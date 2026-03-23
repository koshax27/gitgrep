'use client';

import { useState, useEffect } from 'react';

interface RepoStatsProps {
  owner: string;
  name: string;
}

interface StatsData {
  stars: number;
  forks: number;
  issues: number;
  updatedAt: string;
}

export function RepoStats({ owner, name }: RepoStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. شوف لو فيه بيانات في localStorage
        const cacheKey = `repo_stats_${owner}_${name}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          const parsed = JSON.parse(cached);
          setStats(parsed);
          setLoading(false);
        }
        
        // 2. جيب بيانات جديدة من API
        const response = await fetch(`/api/github/repo/${owner}/${name}`);
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        
        // 3. خزن في localStorage
        localStorage.setItem(cacheKey, JSON.stringify(data));
        
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching repo stats:', err);
        setError(true);
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [owner, name]);

  if (loading && !stats) {
    return (
      <div className="flex gap-4">
        <div className="animate-pulse bg-gray-200 h-5 w-16 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-5 w-16 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-5 w-16 rounded"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm">فشل في جلب البيانات</div>;
  }

  return (
    <div className="flex gap-4 text-sm">
      <span className="flex items-center gap-1">
        ⭐ {stats?.stars?.toLocaleString() || '0'} Stars
      </span>
      <span className="flex items-center gap-1">
        🍴 {stats?.forks?.toLocaleString() || '0'} Forks
      </span>
      <span className="flex items-center gap-1">
        🐛 {stats?.issues?.toLocaleString() || '0'} Issues
      </span>
    </div>
  );
}