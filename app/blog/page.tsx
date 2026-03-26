import Link from "next/link";

const posts = [
  { slug: "test-post", title: "Test Blog Post", date: "2026-03-26" },
  { slug: "how-to-search-github-code-like-a-pro", title: "How to Search GitHub Code Like a Pro", date: "2026-03-20" },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020408] text-white p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">GitGrep Blogs</h1>
        <p className="text-slate-400 mb-12">Tips and insights for better code search</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-[#0d1117] border border-white/10 rounded-xl p-6 hover:border-blue-500 transition-all"
            >
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-slate-400 text-sm">{post.date}</p>
              <div className="mt-4 text-blue-400">Read more →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}