// app/not-found.tsx
'use client';

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-9xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-8">
          404
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-slate-400 mb-8">Oops! The page you're looking for doesn't exist.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all">Go Home</Link>
          <button onClick={() => window.history.back()} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">Go Back</button>
        </div>
      </div>
    </div>
  );
}