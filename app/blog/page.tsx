import Link from "next/link";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020408] text-white p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">GitGrep Blogs</h1>
        <p className="text-slate-400 mb-12">Tips and insights for better code search</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/blog/test-post" className="bg-[#0d1117] border border-white/10 rounded-xl p-6 hover:border-blue-500 transition-all">
            <h2 className="text-xl font-bold mb-2">Test Blog Post</h2>
            <p className="text-slate-400 text-sm">This is a test blog post to verify routing works.</p>
            <div className="mt-4 text-blue-400">Read more →</div>
          </Link>
        </div>
      </div>
    </div>
  );
}