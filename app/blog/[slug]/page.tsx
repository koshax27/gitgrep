// app/blog/[slug]/page.tsx
import Link from "next/link";

export default function BlogPost({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  return (
    <div className="min-h-screen bg-[#020408] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/blog" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">← Back to Blogs</Link>
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Blog Post: {slug}</h1>
          <p className="text-slate-300">This is a test blog post. Routing is working!</p>
        </div>
      </div>
    </div>
  );
}