"use client";

import { X, Zap, Star, Shield } from "lucide-react";

interface SignupPromptModalProps {
  onClose: () => void;
  onSignup: () => void;
  type: 'search' | 'analysis';
}

export function SignupPromptModal({ onClose, onSignup, type }: SignupPromptModalProps) {
  const benefits = [
    { icon: <Star size={14} />, text: "حفظ نتائج البحث" },
    { icon: <Zap size={14} />, text: "AI Deep Analysis" },
    { icon: <Shield size={14} />, text: "Bug Mode & Security" },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[999999]">
      <div className="bg-gradient-to-b from-[#0d1117] to-[#0a0c10] border border-purple-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {type === 'search' ? 'اكتشفت نتائج مفيدة!' : 'تحليل رائع!'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-4">
          {type === 'search' 
            ? 'عايز تحفظ نتائج البحث دي أو ترجع لها بعدين؟'
            : 'عايز تحفظ التحليل ده وتستخدم الميزات المتقدمة؟'}
        </p>

        <div className="space-y-2 mb-6">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
              <span className="text-purple-400">{benefit.icon}</span>
              {benefit.text}
            </div>
          ))}
        </div>

        <button
          onClick={onSignup}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-2.5 rounded-xl text-white font-bold transition-all"
        >
          سجل دخول في 5 ثواني 🚀
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-slate-500 hover:text-white text-sm py-2 transition-all"
        >
          تذكرني لاحقًا
        </button>
      </div>
    </div>
  );
}