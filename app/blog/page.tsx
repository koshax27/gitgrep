// app/blog/page.tsx
import Link from "next/link";

const posts = [
  { slug: "how-to-search-github-code", title: "How to Search GitHub Code Like a Pro", date: "March 20, 2026" },
  { slug: "code-security-vulnerabilities", title: "Understanding Code Security Vulnerabilities", date: "March 18, 2026" },
  { slug: "ai-code-analysis", title: "AI-Powered Code Analysis", date: "March 15, 2026" },
  { slug: "top-github-repos", title: "Top 10 GitHub Repositories", date: "March 12, 2026" },
  { slug: "understand-repo", title: "How to Use Understand Repo", date: "March 10, 2026" },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020408] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-4">GitGrep Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="bg-[#0d1117] border border-white/10 rounded-xl p-6 hover:border-blue-500">
              <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
              <p className="text-slate-400 text-sm">{post.date}</p>
              <div className="mt-4 text-blue-400">Read more →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}