// app/not-found.tsx
import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-ping" />
          </div>
          <div className="relative z-10">
            <div className="text-9xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent animate-bounce">
              404
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-slate-400 text-lg mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Terminal animation */}
        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 mb-8 text-left">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-slate-500 ml-2">terminal</span>
          </div>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-slate-400">
              <span className="text-green-400">$</span> git grep --find-page
            </p>
            <p className="text-red-400 animate-pulse">
              ❌ Error: Page not found in repository
            </p>
            <p className="text-slate-400 mt-2">
              <span className="text-green-400">$</span> git grep --suggest
            </p>
            <div className="flex gap-2 mt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm transition-all"
              >
                <Home size={16} />
                Go Home
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
              >
                <Search size={16} />
                Search Code
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-all"
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
            </div>
          </div>
        </div>

        {/* Floating particles animation */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-500/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}