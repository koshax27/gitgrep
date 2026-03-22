"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");

  return (
    <main className="min-h-screen bg-[#020408] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">GitGrep</h1>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search code..."
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
        />
      </div>
    </main>
  );
}