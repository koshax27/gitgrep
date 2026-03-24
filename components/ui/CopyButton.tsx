'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/10 ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check size={16} className="text-green-400" />
      ) : (
        <Copy size={16} className="text-slate-400 hover:text-white" />
      )}
    </button>
  );
}