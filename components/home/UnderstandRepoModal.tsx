"use client";

import { X, Copy } from "lucide-react";

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
  onAnalyzeRepo: () => void;
  onAskAiAnalysis: () => void;
  onCopyRepoReport: () => void;
  onCopyAiTips: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-auto bg-black/95 backdrop-blur-sm">
      <div
        role="dialog"
        aria-labelledby="repo-modal-title"
        className="flex flex-col w-full max-w-lg max-h-[min(90vh,900px)] min-h-0 rounded-2xl border border-purple-500/20 bg-[#0a0c12] shadow-2xl overflow-hidden"
      >
        <div className="shrink-0 px-5 pt-5 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="repo-modal-title" className="text-xl font-bold text-white">
              📦 Understand Repository
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-1.5 hover:bg-white/10 rounded-lg"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Enter a GitHub repository URL to analyze its structure, authentication logic, and security
            risks.
          </p>
        </div>

        <div className="shrink-0 px-5 pt-4 space-y-3">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full min-w-0 bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500"
          />
          <button
            type="button"
            onClick={onAnalyzeRepo}
            disabled={repoAnalyzing}
            className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50"
          >
            {repoAnalyzing ? "Analyzing..." : "Analyze Repository"}
          </button>
          <button
            type="button"
            onClick={onAskAiAnalysis}
            disabled={aiAnalysisLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 py-2.5 rounded-xl text-white font-bold transition-all text-sm disabled:opacity-50"
          >
            {aiAnalysisLoading ? "🤖 Analyzing with AI..." : "🤖 Ask AI for Deep Analysis"}
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-4">
          {repoAnalysis && (
            <div className="p-4 bg-black/50 rounded-xl border border-white/5 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-400">Repository report</span>
                <button
                  type="button"
                  onClick={onCopyRepoReport}
                  title="نسخ التحليل الكامل"
                  className="flex shrink-0 items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
                >
                  <Copy size={14} />
                  Copy analysis
                </button>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words [word-break:break-word] font-mono max-w-full overflow-x-auto">
                {repoAnalysis}
              </pre>
            </div>
          )}

          {aiAnalysis && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="text-purple-400 text-sm font-bold min-w-0">🤖 AI Deep Analysis</div>
                <button
                  type="button"
                  onClick={onCopyAiTips}
                  title="نسخ نصائح إصلاح المشاكل والباجز"
                  className="flex shrink-0 items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-500/30 hover:bg-purple-500/40 text-white transition-colors"
                >
                  <Copy size={14} />
                  Copy fix tips
                </button>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words [word-break:break-word] font-mono max-w-full overflow-x-auto">
                {aiAnalysis}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
