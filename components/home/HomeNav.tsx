"use client";

import { useState } from "react";
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
  userCount,
  onNavigate,
  onLogoClick,
  onFeedback,
  onSignIn,
}: {
  session: Session | null;
  view: View;
  favoritesCount: number;
  projectsCount: number;
  userCount: number;
  onNavigate: (v: View) => void;
  onLogoClick: () => void;
  onFeedback: () => void;
  onSignIn: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between mb-12 backdrop-blur-md bg-black/20 border-white/5 p-4 rounded-3xl border relative">
      {/* Logo */}
      <div
        className="flex items-center gap-3 group cursor-pointer"
        onClick={onLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onLogoClick()}
      >
        <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500 shadow-blue-500/20">
          <Terminal size={24} className="text-white" />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white italic uppercase">
          GitGrep<span className="text-blue-500">_</span>
        </span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase text-slate-500">
        <button
          type="button"
          onClick={() => onNavigate("favorites")}
          className={`hover:text-blue-400 transition-colors ${
            view === "favorites" ? "text-blue-400" : ""
          }`}
        >
          Saved {favoritesCount > 0 && `(${favoritesCount})`}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("my-projects")}
          className={`hover:text-blue-400 transition-colors ${
            view === "my-projects" ? "text-blue-400" : ""
          }`}
        >
          Projects {projectsCount > 0 && `(${projectsCount})`}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("security")}
          className={`hover:text-red-400 transition-colors ${
            view === "security" ? "text-red-400" : ""
          }`}
        >
          Security
        </button>
        <button
          type="button"
          onClick={() => onNavigate("refactor")}
          className={`hover:text-purple-400 transition-colors ${
            view === "refactor" ? "text-purple-400" : ""
          }`}
        >
          Refactor
        </button>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-4">
        {/* User counter - يظهر للضيوف فقط */}
        {!session && (
          <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 rounded-full px-2 sm:px-3 py-1.5">
            <span className="text-[8px] sm:text-[10px] font-bold text-purple-400">🔥</span>
            <span className="text-[8px] sm:text-[10px] font-bold text-white">{userCount}/100</span>
            <span className="hidden sm:inline text-[8px] sm:text-[10px] text-slate-400">users</span>
          </div>
        )}

        {/* Admin Dashboard */}
        {session?.user?.email === "koshax27@gmail.com" && (
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-white/10 transition-all"
            title="Admin Dashboard"
          >
            <BarChart3 size={18} className="text-green-400" />
          </a>
        )}

        {/* Feedback button */}
        <button
          type="button"
          onClick={onFeedback}
          className="p-2 rounded-xl hover:bg-white/10 transition-all"
          title="Send Feedback"
        >
          <Star size={18} className="text-purple-400" />
        </button>

        {/* Feedback Dashboard */}
        {session?.user?.email === "magedzino@gmail.com" && (
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-white/10 transition-all"
            title="Feedback Dashboard"
          >
            <BarChart3 size={18} className="text-green-400" />
          </a>
        )}

        {/* Error Dashboard */}
        {session?.user?.email === "koshax27@gmail.com" && (
          <a
            href="/error-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-white/10 transition-all"
            title="Error Dashboard"
          >
            <AlertOctagon size={18} className="text-red-400" />
          </a>
        )}

        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* User menu or sign in button */}
        {session ? (
          <div className="flex items-center gap-3 bg-white/5 p-1.5 pr-4 rounded-2xl">
            <img
              src={session.user?.image || ""}
              className="w-8 h-8 rounded-xl"
              alt={session.user?.name || "User"}
            />
            <span className="text-[10px] font-bold text-white">
              {session.user?.name?.split(" ")[0]}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-slate-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="bg-white text-black text-[9px] sm:text-[10px] font-bold px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
          >
            Get Early Access
          </button>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <>
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu */}
          <div className="fixed top-0 left-0 right-0 bg-[#0d1117] border-b border-white/10 rounded-b-2xl p-5 flex flex-col gap-2 z-50 shadow-xl lg:hidden animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <span className="text-white font-bold text-lg">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <button
              onClick={() => {
                onNavigate("search");
                setMobileMenuOpen(false);
              }}
              className={`text-base text-left hover:text-blue-400 transition-colors py-3 px-2 rounded-lg ${
                view === "search" ? "text-blue-400 bg-white/5" : "text-white"
              }`}
            >
              🔍 Search
            </button>
            
            <button
              onClick={() => {
                onNavigate("favorites");
                setMobileMenuOpen(false);
              }}
              className={`text-base text-left hover:text-blue-400 transition-colors py-3 px-2 rounded-lg ${
                view === "favorites" ? "text-blue-400 bg-white/5" : "text-white"
              }`}
            >
              ⭐ Saved {favoritesCount > 0 && `(${favoritesCount})`}
            </button>
            
            <button
              onClick={() => {
                onNavigate("my-projects");
                setMobileMenuOpen(false);
              }}
              className={`text-base text-left hover:text-blue-400 transition-colors py-3 px-2 rounded-lg ${
                view === "my-projects" ? "text-blue-400 bg-white/5" : "text-white"
              }`}
            >
              📁 Projects {projectsCount > 0 && `(${projectsCount})`}
            </button>
            
            <button
              onClick={() => {
                onNavigate("security");
                setMobileMenuOpen(false);
              }}
              className={`text-base text-left hover:text-red-400 transition-colors py-3 px-2 rounded-lg ${
                view === "security" ? "text-red-400 bg-white/5" : "text-white"
              }`}
            >
              🛡️ Security
            </button>
            
            <button
              onClick={() => {
                onNavigate("refactor");
                setMobileMenuOpen(false);
              }}
              className={`text-base text-left hover:text-purple-400 transition-colors py-3 px-2 rounded-lg ${
                view === "refactor" ? "text-purple-400 bg-white/5" : "text-white"
              }`}
            >
              🔧 Refactor
            </button>
            
            {/* Sign Out button for mobile */}
            {session && (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="text-base text-left text-red-400 hover:text-red-300 transition-colors py-3 px-2 rounded-lg mt-2 border-t border-white/10 pt-3"
              >
                🚪 Sign Out
              </button>
            )}
          </div>
        </>
      )}
    </nav>
  );
}