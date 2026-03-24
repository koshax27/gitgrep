"use client";

import { X, Copy, Check, Zap, Code } from "lucide-react";
import { useState } from "react";

// أيقونة Sparkles للإضافة
function Sparkles({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3L14 8L19 8L15 11L17 16L12 13L7 16L9 11L5 8L10 8L12 3Z" />
      <path d="M19 4L20 7L23 7L21 9L22 12L19 10L16 12L17 9L15 7L18 7L19 4Z" />
    </svg>
  );
}

export function UnderstandRepoModal({
  repoUrl,
  setRepoUrl,
  repoAnalyzing,
  repoAnalysis,
  aiAnalysisLoading,
  aiAnalysis,
  onClose,
  onAnalyzeRepo,
  onAskAiAnalysis,
  onCopyRepoReport,
  onCopyAiTips,
}: {
  repoUrl: string;
  setRepoUrl: (v: string) => void;
  repoAnalyzing: boolean;
  repoAnalysis: string;
  aiAnalysisLoading: boolean;
  aiAnalysis: string;
  onClose: () => void;
  onAnalyzeRepo: (repoIdentifier?: string) => void;
  onAskAiAnalysis: () => void;
  onCopyRepoReport: () => void;
  onCopyAiTips: () => void;
}) {
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedTips, setCopiedTips] = useState(false);

  const handleCopyReport = async () => {
    await onCopyRepoReport();
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleCopyTips = async () => {
    await onCopyAiTips();
    setCopiedTips(true);
    setTimeout(() => setCopiedTips(false), 2000);
  };

  // تطبيع الإدخال: يدعم رابط GitHub أو صيغة owner/repo
  const normalizeRepoInput = (input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // إذا كان الإدخال يحتوي على github.com، استخرج owner/repo
    if (trimmed.includes('github.com')) {
      const match = trimmed.match(/github\.com\/([^\/]+\/[^\/]+)/);
      return match ? match[1] : null;
    }
    // إذا كان الإدخال بصيغة owner/repo
    if (trimmed.includes('/') && !trimmed.includes(' ')) {
      return trimmed;
    }
    return null;
  };

  // استخراج اسم المستودع من الرابط لعرضه
  const getRepoName = () => {
    const normalized = normalizeRepoInput(repoUrl);
    return normalized;
  };
  const repoName = getRepoName();

  const handleAnalyze = () => {
    const normalized = normalizeRepoInput(repoUrl);
    if (normalized) {
      onAnalyzeRepo(normalized);
    } else {
      alert('Please enter a valid GitHub repo URL or owner/repo format (e.g., vercel/next.js)');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-auto bg-black/95 backdrop-blur-sm">
      <div
        role="dialog"
        aria-labelledby="repo-modal-title"
        className="flex flex-col w-full max-w-2xl max-h-[min(90vh,900px)] min-h-0 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0a0c12] to-[#05070c] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Code size={20} className="text-purple-400" />
              </div>
              <div>
                <h2 id="repo-modal-title" className="text-xl font-bold text-white">
                  📦 Understand Repository
                </h2>
                {repoName && (
                  <p className="text-purple-400 text-xs mt-0.5 font-mono">{repoName}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 hover:bg-white/10 rounded-lg transition-all"
              aria-label="Close"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Analyze GitHub repositories for structure, authentication patterns, security risks, and get AI-powered insights.
          </p>
        </div>

        {/* Input Section */}
        <div className="shrink-0 px-6 pt-5 pb-3 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo  or  owner/repo"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-500"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={repoAnalyzing}
              className="flex-1 bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {repoAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Analyze Repository
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onAskAiAnalysis}
              disabled={aiAnalysisLoading || !repoAnalysis}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 py-3 rounded-xl text-white font-bold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {aiAnalysisLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  AI Deep Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-5">
          {/* Repository Report */}
          {repoAnalysis && (
            <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Code size={14} className="text-purple-400" />
                  <span className="text-xs font-semibold text-slate-300">Repository Report</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-all"
                >
                  {copiedReport ? (
                    <>
                      <Check size={12} className="text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words font-mono max-h-64 overflow-y-auto">
                  {repoAnalysis}
                </pre>
              </div>
            </div>
          )}

          {/* AI Deep Analysis */}
          {aiAnalysis && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-purple-500/20 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">🤖 AI Deep Analysis</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTips}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-purple-500/30 hover:bg-purple-500/40 text-white transition-all"
                >
                  {copiedTips ? (
                    <>
                      <Check size={12} className="text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words font-mono max-h-80 overflow-y-auto">
                  {aiAnalysis}
                </pre>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!repoAnalysis && !aiAnalysis && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Code size={28} className="text-purple-400" />
              </div>
              <p className="text-slate-500 text-sm">
                Enter a repository URL or owner/repo and click "Analyze Repository"
              </p>
              <p className="text-slate-600 text-xs mt-1">
                Example: https://github.com/vercel/next.js  or  vercel/next.js
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-white/10 bg-white/5">
          <p className="text-[10px] text-slate-500 text-center">
            Analysis includes: project structure • languages • dependencies • security risks • authentication patterns • bug analysis
          </p>
        </div>
      </div>
    </div>
  );
}

