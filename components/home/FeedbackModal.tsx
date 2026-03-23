"use client";

import { useState } from "react";
import { Star, X, Bug, Zap, Shield, Mail } from "lucide-react";

export function FeedbackModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: {
    rating: number;
    feedback: string;
    category: string;
    email: string;
    timestamp: Date;
  }) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("bug");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    if (!email.trim()) {
      alert("Please enter your email to send feedback");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address");
      return;
    }
    onSubmit({ rating, feedback, category, email, timestamp: new Date() });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999999] animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#0d1117] to-[#0a0c10] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Star size={20} className="text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Send Feedback</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="mb-6 text-center">
          <label className="text-slate-400 text-sm mb-3 block">How would you rate GitGrep?</label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-4xl transition-all"
              >
                <Star
                  size={32}
                  fill={(hoveredRating || rating) >= star ? "currentColor" : "none"}
                  className={`${
                    (hoveredRating || rating) >= star ? "text-yellow-500" : "text-slate-600"
                  } hover:scale-110 transition-all`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              {rating === 5 && "🔥 Amazing! Thank you!"}
              {rating === 4 && "👍 Good, but could be better"}
              {rating === 3 && "😐 It's okay"}
              {rating === 2 && "😕 Not satisfied"}
              {rating === 1 && "😡 Very disappointed"}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-2 block">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "bug", label: "🐛 Bug", icon: <Bug size={14} /> },
              { value: "feature", label: "💡 Feature", icon: <Zap size={14} /> },
              { value: "ui", label: "🎨 UI/UX", icon: <Shield size={14} /> },
            ].map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all text-sm ${
                  category === cat.value
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-2 block">Your Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you think..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="mb-6">
          <label className="text-slate-400 text-sm mb-2 block flex items-center gap-2">
            <Mail size={14} className="text-red-400" />
            Email <span className="text-red-400 text-xs">*required</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to receive updates"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <p className="text-[10px] text-slate-500 mt-1">
            We&apos;ll use this to follow up and notify you about your feedback
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3 rounded-xl text-white font-bold transition-all"
          >
            Send Feedback
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
