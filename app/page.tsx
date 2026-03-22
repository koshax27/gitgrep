"use client";

import { useState } from "react";
import { Terminal, Sun, Moon } from "lucide-react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [query, setQuery] = useState("");

  return (
    <main className={`min-h-screen ${darkMode ? 'bg-[#020408] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        {/* Navbar */}
        <nav className="flex items-center justify-between mb-12 backdrop-blur-md bg-black/20 border-white/5 p-4 rounded-3xl border">
          <div className="flex items-center gap-3">
            <Terminal size={24} className="text-blue-500" />
            <span className="text-2xl font-bold">GitGrep</span>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-white/10">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* Search */}
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code..."
            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white"
          />
        </div>
      </div>
    </main>
  );
}