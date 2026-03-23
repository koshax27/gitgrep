"use client";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import {
  Terminal,
  BarChart3,
  Star,
  AlertOctagon,
  LogOut,
} from "lucide-react";

type View = "search" | "favorites" | "my-projects" | "security" | "refactor";

export function HomeNav({
  session,
  view,
  favoritesCount,
  projectsCount,
  onNavigate,
  onLogoClick,
  onFeedback,
  onSignIn,
}: {
  session: Session | null;
  view: View;
  favoritesCount: number;
  projectsCount: number;
  onNavigate: (v: View) => void;
  onLogoClick: () => void;
  onFeedback: () => void;
  onSignIn: () => void;
}) {
  return (
    <nav className="flex items-center justify-between mb-12 backdrop-blur-md bg-black/20 border-white/5 p-4 rounded-3xl border">
      <div
        className="flex items-center gap-3 group cursor-pointer"
        onClick={onLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onLogoClick()}
      >
        <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500 shadow-blue-500/20">
          <Terminal size={24} className="text-slate-900 dark:text-white" />
        </div>
        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white italic uppercase">
          GitGrep<span className="text-blue-500">_</span>
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase text-slate-600 dark:text-slate-500">
        <button
          type="button"
          onClick={() => onNavigate("favorites")}
          className={`hover:text-blue-500 dark:hover:text-blue-400 ${view === "favorites" ? "text-blue-600 dark:text-blue-400" : ""}`}
        >
          Saved {favoritesCount > 0 && `(${favoritesCount})`}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("my-projects")}
          className={`hover:text-blue-500 dark:hover:text-blue-400 ${view === "my-projects" ? "text-blue-600 dark:text-blue-400" : ""}`}
        >
          Projects {projectsCount > 0 && `(${projectsCount})`}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("security")}
          className={`hover:text-red-500 dark:hover:text-red-400 ${view === "security" ? "text-red-600 dark:text-red-400" : ""}`}
        >
          Security
        </button>
        <button
          type="button"
          onClick={() => onNavigate("refactor")}
          className={`hover:text-purple-600 dark:hover:text-purple-400 ${view === "refactor" ? "text-purple-600 dark:text-purple-400" : ""}`}
        >
          Refactor
        </button>
      </div>

      <div className="flex items-center gap-4">
        {session?.user?.email === "koshax27@gmail.com" && (
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-slate-200/90 dark:hover:bg-white/10 transition-all"
            title="Admin Dashboard"
          >
            <BarChart3 size={18} className="text-green-400" />
          </a>
        )}
        <button
          type="button"
          onClick={onFeedback}
          className="p-2 rounded-xl hover:bg-slate-200/90 dark:hover:bg-white/10"
          title="Send Feedback"
        >
          <Star size={18} className="text-purple-400" />
        </button>

        {session?.user?.email === "magedzino@gmail.com" && (
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-slate-200/90 dark:hover:bg-white/10 transition-all"
            title="Feedback Dashboard"
          >
            <BarChart3 size={18} className="text-green-400" />
          </a>
        )}

        {session?.user?.email === "koshax27@gmail.com" && (
          <a
            href="/error-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-slate-200/90 dark:hover:bg-white/10 transition-all"
            title="Error Dashboard"
          >
            <AlertOctagon size={18} className="text-red-400" />
          </a>
        )}

        {session ? (
          <div className="flex items-center gap-3 bg-slate-200/80 dark:bg-white/5 p-1.5 pr-4 rounded-2xl">
            <img src={session.user?.image || ""} className="w-8 h-8 rounded-xl" alt="" />
            <span className="text-[10px] font-bold text-slate-900 dark:text-white">
              {session.user?.name?.split(" ")[0]}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-slate-600 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-500"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="bg-white text-black text-[10px] font-bold px-6 py-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
          >
            Get Early Access
          </button>
        )}
      </div>
    </nav>
  );
}
