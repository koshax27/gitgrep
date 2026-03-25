"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Folder,
  Plus,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export function SecurityDashboard({
  projects,
  onAddProject,
}: {
  projects: string[];
  onAddProject?: (project: string) => void;
}) {
  const [newProject, setNewProject] = useState("");

  const checkForLeaks = (repoName: string) => {
    const sensitive = ["test", "admin", "secret", "key", "token", "password"];
    return sensitive.some((term) => repoName.toLowerCase().includes(term));
  };

  const handleAddProject = () => {
    if (newProject && !projects.includes(newProject)) {
      onAddProject?.(newProject);
      setNewProject("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-8 rounded-[2rem]">
        <div className="flex items-center gap-5">
          <ShieldAlert className="text-red-500 animate-pulse" size={40} />
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white italic">
              Security Monitor
            </h3>
            <p className="text-slate-400 text-sm">
              Live monitoring for {projects.length} connected repositories.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="text-[10px] font-black text-red-500 uppercase">Live Scanning</span>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          placeholder="Add repository (owner/repo)"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
        />
        <button
          type="button"
          onClick={handleAddProject}
          className="bg-blue-600 hover:bg-blue-500 px-6 rounded-xl transition-all"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length > 0 ? (
          projects.map((p, i) => {
            const atRisk = checkForLeaks(p);
            return (
              <div
                key={i}
                className={`p-6 rounded-[1.5rem] border ${atRisk ? "bg-red-500/5 border-red-500/30" : "bg-[#0d1117] border-white/5"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Folder size={20} className={atRisk ? "text-red-500" : "text-slate-500"} />
                    <div>
                      <span className="font-mono text-sm text-slate-900 dark:text-white font-bold">
                        {p}
                      </span>
                      <div className="text-[10px] text-slate-500">Last scan: 2 mins ago</div>
                    </div>
                  </div>
                  {atRisk ? (
                    <div className="flex items-center gap-1 text-red-500 text-[10px] font-black bg-red-500/10 px-2 py-1 rounded-lg">
                      <AlertTriangle size={12} /> LEAK
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold bg-green-500/10 px-2 py-1 rounded-lg">
                      <CheckCircle2 size={12} /> SECURE
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] text-slate-500">
            No projects connected. Add a repository to start security monitoring.
          </div>
        )}
      </div>
    </div>
  );
}
