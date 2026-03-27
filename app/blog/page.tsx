// app/blog/page.tsx
import Link from "next/link";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const posts = [
  { slug: "how-to-search-github-code-like-a-pro", title: "How to Search GitHub Code Like a Pro", date: "March 20, 2026" },
  { slug: "understanding-code-security-vulnerabilities", title: "Understanding Code Security Vulnerabilities", date: "March 18, 2026" },
  { slug: "ai-powered-code-analysis-guide", title: "AI-Powered Code Analysis: A Complete Guide", date: "March 15, 2026" },
  { slug: "top-10-github-repositories-every-developer-should-know", title: "Top 10 GitHub Repositories Every Developer Should Know", date: "March 12, 2026" },
  { slug: "how-to-use-understand-repo-feature", title: "How to Use the 'Understand Repo' Feature", date: "March 10, 2026" },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020408] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-4">GitGrep Blog</h1>
        <p className="text-slate-400 mb-12">Tips, tricks, and insights for better code search</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="bg-[#0d1117] border border-white/10 rounded-xl p-6 hover:border-blue-500 transition-all">
              <h2 className="text-xl font-bold text-white mb-2 hover:text-blue-400 transition-colors">{post.title}</h2>
              <p className="text-slate-400 text-sm">{post.date}</p>
              <div className="mt-4 text-blue-400 text-sm">Read more →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}