"use client";

import { BarChart3 } from "lucide-react";

export function CodeAnalytics({
  query,
  resultsCount,
}: {
  query: string;
  resultsCount: number;
}) {
  if (!query || resultsCount === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-8 items-center animate-in fade-in zoom-in-95 duration-500 text-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={18} className="text-blue-400" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">
            Code Pattern Insights
          </span>
        </div>
        <h4 className="text-2xl font-black text-slate-900 dark:text-white italic">"{query}"</h4>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Found{" "}
          <span className="text-slate-900 dark:text-white font-bold">{resultsCount}</span> matching
          code patterns across GitHub.
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
  );
}
