// app/contact/page.tsx
'use client';

import { useState } from "react";
import { Mail, Github, Twitter, Linkedin, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // هنا تضيف logic إرسال الإيميل
    // مؤقتاً هنعرض رسالة نجاح
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#020408] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Have questions, feedback, or suggestions? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail size={18} className="text-blue-400" />
                  <a href="mailto:hello@gitgrep.com" className="hover:text-blue-400 transition-colors">
                    hello@gitgrep.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Github size={18} className="text-purple-400" />
                  <a href="https://github.com/gitgrep" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                    github.com/gitgrep
                  </a>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Twitter size={18} className="text-blue-400" />
                  <a href="https://twitter.com/gitgrep" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                    @gitgrep
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link href="/blog" className="block text-slate-400 hover:text-blue-400 transition-colors">Blog</Link>
                <Link href="/privacy" className="block text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block text-slate-400 hover:text-blue-400 transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-slate-400">We've received your message and will get back to you soon.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Message *</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all resize-none"
                      placeholder="What would you like to tell us?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Sending..." : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}