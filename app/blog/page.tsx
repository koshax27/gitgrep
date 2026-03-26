// app/blog/page.tsx
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const posts = [
  {
    slug: "how-to-search-github-code-like-a-pro",
    title: "How to Search GitHub Code Like a Pro",
    excerpt: "Learn advanced GitHub code search techniques to find exactly what you're looking for.",
    date: "2026-03-20",
    readTime: "5 min",
    category: "Tutorial",
    tags: ["GitHub", "Search", "Tips"],
  },
  {
    slug: "understanding-code-security-vulnerabilities",
    title: "Understanding Code Security Vulnerabilities",
    excerpt: "Common security issues in open source code and how to detect them.",
    date: "2026-03-18",
    readTime: "8 min",
    category: "Security",
    tags: ["Security", "Vulnerabilities", "Best Practices"],
  },
  {
    slug: "ai-powered-code-analysis-guide",
    title: "AI-Powered Code Analysis: A Complete Guide",
    excerpt: "How AI is changing the way we analyze and understand code.",
    date: "2026-03-15",
    readTime: "6 min",
    category: "AI",
    tags: ["AI", "Code Analysis", "Machine Learning"],
  },
  {
    slug: "top-10-github-repositories-every-developer-should-know",
    title: "Top 10 GitHub Repositories Every Developer Should Know",
    excerpt: "Must-know open source projects that will level up your development skills.",
    date: "2026-03-12",
    readTime: "7 min",
    category: "Resources",
    tags: ["GitHub", "Open Source", "Learning"],
  },
  {
    slug: "how-to-use-understand-repo-feature",
    title: "How to Use the 'Understand Repo' Feature",
    excerpt: "Master our repository analysis tool to quickly understand any codebase.",
    date: "2026-03-10",
    readTime: "4 min",
    category: "Tutorial",
    tags: ["GitGrep", "Tutorial", "Repository Analysis"],
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            GitGrep Blogs
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Tips, tricks, and insights for better code search and analysis
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-[#0d1117] border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">
                  {post.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={12} />
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-slate-400 text-sm mb-4">{post.excerpt}</p>
              
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                Read more
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}