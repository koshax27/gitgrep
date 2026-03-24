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
      <div className="bg-gradient-to-b from-[#0d1117] to-[#0a0c10] border border-white/10 rounded-2xl p-5 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Star size={16} className="text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Send Feedback</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="mb-4 text-center">
          <label className="text-slate-400 text-xs mb-2 block">How would you rate GitGrep?</label>
          <div className="flex gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-all"
              >
                <Star
                  size={24}
                  fill={(hoveredRating || rating) >= star ? "currentColor" : "none"}
                  className={`${
                    (hoveredRating || rating) >= star ? "text-yellow-500" : "text-slate-600"
                  } hover:scale-110 transition-all`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-[10px] text-slate-500 mt-1">
              {rating === 5 && "🔥 Amazing! Thank you!"}
              {rating === 4 && "👍 Good, but could be better"}
              {rating === 3 && "😐 It's okay"}
              {rating === 2 && "😕 Not satisfied"}
              {rating === 1 && "😡 Very disappointed"}
            </p>
          )}
        </div>

        <div className="mb-3">
          <label className="text-slate-400 text-xs mb-1 block">Category</label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { value: "bug", label: "Bug", icon: <Bug size={12} /> },
              { value: "feature", label: "Feature", icon: <Zap size={12} /> },
              { value: "ui", label: "UI/UX", icon: <Shield size={12} /> },
            ].map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all text-xs ${
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

        <div className="mb-3">
          <label className="text-slate-400 text-xs mb-1 block">Your Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you think..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="text-slate-400 text-xs mb-1 block flex items-center gap-1">
            <Mail size={10} className="text-red-400" />
            Email <span className="text-red-400 text-[10px]">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-blue-500"
            required
          />
          <p className="text-[9px] text-slate-500 mt-1">
            We'll notify you about your feedback
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-2 rounded-lg text-white font-bold text-sm transition-all"
          >
            Send
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-slate-400 hover:text-white text-sm transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
