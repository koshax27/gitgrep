"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setSent(false), 3000);
    }, 1000);
  };    
  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4">
            <Mail size={32} className="text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Have questions, feedback, or suggestions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <a href="mailto:hello@gitgrep.com" className="text-blue-400 hover:underline">
                  hello@gitgrep.com
                </a>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Support</p>
                <a href="mailto:support@gitgrep.com" className="text-blue-400 hover:underline">
                  support@gitgrep.com
                </a>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Legal</p>
                <a href="mailto:legal@gitgrep.com" className="text-blue-400 hover:underline">
                  legal@gitgrep.com
                </a>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your Message"
                rows={4}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 resize-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? "Sending..." : <><Send size={16} /> Send Message</>}
              </button>
              {sent && (
                <p className="text-green-400 text-sm text-center">✓ Message sent! We'll get back to you soon.</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};