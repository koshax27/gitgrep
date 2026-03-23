"use client";

import { useState, useEffect, useMemo } from "react";

export function TypingText() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const texts = useMemo(
    () => [
      { text: "17 developers joined this week", color: "text-green-400" },
      { text: "Scanning repositories...", color: "text-blue-400" },
      { text: "3 secrets detected in public code", color: "text-red-400" },
      { text: "AI analyzing code patterns...", color: "text-purple-400" },
      { text: "95% security score achieved", color: "text-emerald-400" },
    ],
    []
  );

  const [displayed, setDisplayed] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex].text;

    if (!isDeleting && charIndex < current.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + current[charIndex]);
        setCharIndex(charIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && charIndex === current.length) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    } else if (isDeleting && charIndex > 0) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev.slice(0, -1));
        setCharIndex(charIndex - 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }
  }, [charIndex, textIndex, isDeleting, texts]);

  if (!isMounted) {
    return <p className="text-xs mt-3 font-mono text-center text-slate-500">...</p>;
  }

  return (
    <p
      className={`text-xs mt-3 font-mono text-center ${texts[textIndex].color} transition-all duration-300`}
    >
      <span className="text-slate-500">{">"}</span> {displayed}
      <span className="animate-pulse">_</span>
    </p>
  );
}
