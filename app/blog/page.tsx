import Link from "next/link";

// مقالاتك - كل ما تزود، تزود هنا
const posts = [
  { id: 1, slug: "how-to-search-github-code", title: "How to Search GitHub Code Like a Pro", date: "2026-03-27" },
  { id: 2, slug: "understanding-code-security", title: "Understanding Code Security Vulnerabilities", date: "2026-03-26" },
  { id: 3, slug: "ai-code-analysis", title: "AI-Powered Code Analysis", date: "2026-03-25" },
  // زود هنا بقى للـ 50 مقال
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020408] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="bg-[#0d1117] border border-white/10 rounded-xl p-6 hover:border-blue-500">
              <h2 className="text-xl font-bold text-white">{post.title}</h2>
              <p className="text-slate-400 text-sm mt-2">{post.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}