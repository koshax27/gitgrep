// app/blog/page.tsx
import Link from "next/link";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020408] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">GitGrep Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/blog/test" className="bg-[#0d1117] border border-white/10 rounded-xl p-6 hover:border-blue-500">
            <h2 className="text-xl font-bold text-white mb-2">Test Blog Post</h2>
            <p className="text-slate-400">Click to test if blog works</p>
          </Link>
        </div>
      </div>
    </div>
  );
}