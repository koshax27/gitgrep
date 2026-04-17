"use client";

import { useState, useEffect } from "react";
import {
  Github,
  ExternalLink,
  Code,
  Star,
  Copy,
  Check,
  GitCompare,
  Eye,
  GitFork,
  Calendar,
} from "lucide-react";
import type { SearchResult } from "@/lib/types/search";
import { LiveTerminal } from "./LiveTerminal";

export function ResultCard({
  item,
  onFav,
  isFav,
  onCompare,
  isComparing,
}: {
  item: SearchResult | any;
  onFav: () => void;
  isFav: boolean;
  onCompare?: (item: any) => void;
  isComparing?: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // دعم كل من صيغة الكود (Code) وصيغة المستودع (Repository)
  const isRepoFormat = !!item.stargazers_count || !!item.repository_info?.stargazers_count;
  
  // استخراج البيانات حسب الصيغة
  const repoName = item.repository_info?.full_name || item.full_name || item.repository?.full_name || "";
  const repoStars = item.stargazers_count || item.repository_info?.stargazers_count || item.repository?.stargazers_count || 0;
  const repoForks = item.forks_count || item.repository_info?.forks_count || item.repository?.forks_count || 0;
  const repoLanguage = item.language || item.repository_info?.language || item.repository?.language || "Unknown";
  const repoDescription = item.description || item.repository_info?.description || item.repository?.description || "";
  const repoUpdatedAt = item.updated_at || item.repository_info?.updated_at || item.repository?.updated_at || "";
  const repoUrl = item.html_url || item.repository?.html_url || "";
  const repoPath = item.path || item.repository?.full_name || repoName;
  
  // الكود المستخرج (إذا كان موجوداً)
  const snippet = item.code_snippet || item.text_matches?.[0]?.fragment || "";

  const formatStars = (stars: number) => {
    if (!stars) return "0";
    if (stars >= 1000) return `${(stars / 1000).toFixed(1)}k`;
    return stars.toString();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(repoPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) {
    return <div className="animate-pulse bg-white/5 rounded-2xl h-48" />;
  }

  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-12 duration-1000 text-start ${isComparing ? "ring-2 ring-blue-500 scale-[1.01]" : ""}`}
    >
      <div className="flex items-center justify-between mb-5 px-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl flex-shrink-0">
            <Github size={16} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-black text-slate-900 dark:text-white tracking-tight italic uppercase hover:text-blue-400 transition-colors cursor-pointer block truncate"
            >
              {repoName || "Unknown Repository"}
            </a>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] text-blue-500/80 font-mono tracking-tighter uppercase font-bold truncate">
                {repoPath?.split("/").pop() || repoPath}
              </span>

              {repoLanguage && repoLanguage !== "Unknown" && (
                <span className="text-[8px] px-2 py-0.5 bg-white/10 rounded-full text-slate-300">
                  {repoLanguage}
                </span>
              )}

              {repoStars > 0 && (
                <span className="text-[8px] flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                  <Star size={8} fill="currentColor" /> {formatStars(repoStars)}
                </span>
              )}

              {repoForks > 0 && (
                <span className="text-[8px] flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  <GitFork size={8} /> {formatStars(repoForks)}
                </span>
              )}

              {repoUpdatedAt && (
                <span className="text-[8px] flex items-center gap-1 text-slate-500">
                  <Calendar size={8} /> {formatDate(repoUpdatedAt)}
                </span>
              )}
            </div>
            {repoDescription && (
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{repoDescription}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleCopyPath}
            className="p-2 rounded-xl border border-white/5 text-slate-600 hover:text-slate-900 dark:text-white hover:border-white/20 transition-all"
            aria-label="Copy repository name"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            onClick={onFav}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
            className="p-2 rounded-xl hover:bg-white/5 transition-all"
          >
            <Star size={16} fill={isFav ? "currentColor" : "none"} />
          </button>
          {onCompare && (
            <button
              onClick={() => onCompare(item)}
              aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
              title={isComparing ? "Remove from comparison" : "Add to comparison"}
              className="p-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <GitCompare size={16} />
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
            {snippet && (
              <button
                type="button"
                onClick={() => setShowEditor(!showEditor)}
                className="text-slate-600 hover:text-purple-400 transition-colors p-1"
                aria-label={showEditor ? "Hide code editor" : "Show code editor"}
              >
                <Code size={16} />
              </button>
            )}
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-blue-400 transition-colors p-1"
              aria-label="View on GitHub"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="p-6 overflow-x-auto bg-[#020408]/40">
          {snippet ? (
            <>
              <pre className="text-sm font-mono leading-loose">
                <code className="text-slate-300 whitespace-pre-wrap">{snippet}</code>
              </pre>
              <LiveTerminal snippet={snippet} />
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Eye size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No code snippet available</p>
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-xs mt-2 inline-block hover:underline"
              >
                View repository on GitHub →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}