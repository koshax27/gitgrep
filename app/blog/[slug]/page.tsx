import Link from "next/link";
import { notFound } from "next/navigation";

export default function BlogPost({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  if (!slug) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white p-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to Blogs
        </Link>
        
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-4">Blog Post: {slug}</h1>
          <p className="text-slate-400 mb-6">Published on {new Date().toLocaleDateString()}</p>
          <p className="text-slate-300 leading-relaxed">
            This is a test blog post. The routing is working correctly!
          </p>
        </div>
      </div>
    </div>
  );
}