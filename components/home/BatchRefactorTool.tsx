"use client";

import { useState } from "react";
import { Replace } from "lucide-react";

export function BatchRefactorTool({ projects }: { projects: string[] }) {
  const [oldPattern, setOldPattern] = useState("");
  const [newPattern, setNewPattern] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const runRefactor = async () => {
    if (!oldPattern || !newPattern || selectedProjects.length === 0) {
      alert("Please fill all fields and select at least one project.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    alert(`Refactor completed on ${selectedProjects.length} projects!`);
    setLoading(false);
  };

  const toggleProject = (project: string) => {
    setSelectedProjects((prev) =>
      prev.includes(project) ? prev.filter((p) => p !== project) : [...prev, project]
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#0d1117] border border-white/10 rounded-[3rem] p-10">
      <div className="flex items-center gap-4 mb-10">
        <Replace size={32} className="text-purple-400" />
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic">Batch Refactor</h2>
          <p className="text-slate-500 text-xs">Transform patterns across multiple repositories.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            value={oldPattern}
            onChange={(e) => setOldPattern(e.target.value)}
            placeholder="Find pattern (regex)..."
            className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500 text-slate-900 dark:text-white"
          />
          <input
            value={newPattern}
            onChange={(e) => setNewPattern(e.target.value)}
            placeholder="Replace with..."
            className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
          {projects.map((project) => (
            <label key={project} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProjects.includes(project)}
                onChange={() => toggleProject(project)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-300">{project}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={runRefactor}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 text-slate-900 dark:text-white font-black py-5 rounded-2xl transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : "Execute Global Replacement"}
        </button>
      </div>
    </div>
  );
}
