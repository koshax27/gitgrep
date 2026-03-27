// app/blog/page.tsx
import Link from "next/link";

const posts = [
  {
    slug: "how-to-search-github-code-like-a-pro",
    title: "How to Search GitHub Code Like a Pro",
    date: "March 20, 2026",
    excerpt: "Learn advanced GitHub code search techniques to find exactly what you're looking for.",
  },
  {
    slug: "understanding-code-security-vulnerabilities",
    title: "Understanding Code Security Vulnerabilities",
    date: "March 18, 2026",
    excerpt: "Common security issues in open source code and how to detect them.",
  },
  {
    slug: "ai-powered-code-analysis-guide",
    title: "AI-Powered Code Analysis: A Complete Guide",
    date: "March 15, 2026",
    excerpt: "How AI is changing the way we analyze and understand code.",
  },
  {
    slug: "top-10-github-repositories-every-developer-should-know",
    title: "Top 10 GitHub Repositories Every Developer Should Know",
    date: "March 12, 2026",
    excerpt: "Must-know open source projects that will level up your development skills.",
  },
  {
    slug: "how-to-use-understand-repo-feature",
    title: "How to Use the 'Understand Repo' Feature",
    date: "March 10, 2026",
    excerpt: "Master our repository analysis tool to quickly understand any codebase.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020408] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-4">GitGrep Blog</h1>
        <p className="text-slate-400 mb-12">Tips, tricks, and insights for better code search</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-[#0d1117] border border-white/10 rounded-xl p-6 hover:border-blue-500 transition-all"
            >
              <h2 className="text-xl font-bold text-white mb-2 hover:text-blue-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-slate-400 text-sm mb-3">{post.date}</p>
              <p className="text-slate-500 text-sm">{post.excerpt}</p>
              <div className="mt-4 text-blue-400 text-sm font-medium">Read more →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}