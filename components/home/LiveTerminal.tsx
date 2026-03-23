"use client";

import { useState, useRef } from "react";
import { Terminal } from "lucide-react";

export function LiveTerminal({ snippet }: { snippet: string }) {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "// Terminal ready...",
    "// Type 'run' to execute snippet",
    "// Type 'help' for commands",
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, { desc: string; action: () => Promise<void> | void }> = {
    run: {
      desc: "Execute security scan",
      action: async () => {
        setIsExecuting(true);
        setLogs((prev) => [...prev, "> Initiating Security Scan..."]);

        for (let i = 1; i <= 5; i++) {
          await new Promise((r) => setTimeout(r, 300));
          const bar = "█".repeat(i * 4) + "░".repeat(20 - i * 4);
          setLogs((prev) => [...prev.slice(0, -1), `> Scanning: [${bar}] ${i * 20}%`]);
        }

        await new Promise((r) => setTimeout(r, 500));
        setLogs((prev) => [
          ...prev,
          "---------------------------------",
          "✓ Security Analysis Complete",
          "✓ 0 Critical Vulnerabilities",
          "✓ 2 Low Risk Issues Found",
          "✓ Code Quality: 94%",
          "Recommendation: Safe to Use",
        ]);
        setIsExecuting(false);
      },
    },
    analyze: {
      desc: "Deep code analysis",
      action: async () => {
        setLogs((prev) => [...prev, "> Running deep analysis..."]);
        await new Promise((r) => setTimeout(r, 1000));
        setLogs((prev) => [
          ...prev,
          "📊 Analysis Results:",
          "  - Complexity: Medium",
          "  - Maintainability: Good",
          "  - Test Coverage: Unknown",
          "  - Dependencies: 3",
        ]);
      },
    },
    help: {
      desc: "Show available commands",
      action: () => {
        setLogs((prev) => [
          ...prev,
          "Available Commands:",
          "  run     - Execute security scan",
          "  analyze - Deep code analysis",
          "  clear   - Clear terminal",
          "  export  - Export logs",
          "  help    - Show this message",
        ]);
      },
    },
    clear: {
      desc: "Clear terminal",
      action: () => setLogs([]),
    },
    export: {
      desc: "Export logs",
      action: () => {
        const logText = logs.join("\n");
        navigator.clipboard.writeText(logText);
        setLogs((prev) => [...prev, "✓ Logs copied to clipboard!"]);
      },
    },
  };

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const cmd = input.toLowerCase().trim();

      if (commands[cmd]) {
        await commands[cmd].action();
      } else if (cmd) {
        setLogs((prev) => [
          ...prev,
          `> ${input}`,
          `Error: Unknown command. Type 'help' for available commands.`,
        ]);
      }

      setInput("");

      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="mt-4 bg-[#010409] border border-white/5 rounded-2xl overflow-hidden font-mono text-xs shadow-inner">
      <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-blue-400" />
          <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">
            Live Terminal v2.0
          </span>
        </div>
        {isExecuting && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-[8px] text-blue-400">executing...</span>
          </div>
        )}
      </div>
      <div ref={terminalRef} className="p-4 h-40 overflow-y-auto space-y-1 custom-scrollbar">
        <div
          className="text-slate-600 text-[10px] mb-1 border-b border-white/5 pb-1 truncate"
          title={snippet}
        >
          // context: {snippet.slice(0, 96)}
          {snippet.length > 96 ? "…" : ""}
        </div>
        {logs.map((log, i) => (
          <div
            key={i}
            className={
              log.startsWith("Error")
                ? "text-red-400"
                : log.includes("✓")
                  ? "text-green-400"
                  : log.includes("📊")
                    ? "text-yellow-400"
                    : "text-slate-500"
            }
          >
            {log}
          </div>
        ))}
        <div className="flex gap-2 text-slate-900 dark:text-white items-center">
          <span className="text-blue-500 font-bold">$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            className="bg-transparent outline-none flex-1 font-mono text-xs"
            placeholder="Type 'help' for commands..."
            disabled={isExecuting}
          />
        </div>
      </div>
    </div>
  );
}
