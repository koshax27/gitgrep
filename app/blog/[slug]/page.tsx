import Link from "next/link";
import { notFound } from "next/navigation";

// المقالات - كل مقال له slug ومحتواه
const posts: Record<string, { title: string; date: string; content: string }> = {
  "how-to-search-github-code": {
    title: "How to Search GitHub Code Like a Pro",
    date: "2026-03-27",
    content: "Use advanced search operators like `language:javascript`. Save your favorite results. Use GitGrep's AI analysis.",
  },
  "understanding-code-security": {
    title: "Understanding Code Security Vulnerabilities",
    date: "2026-03-26",
    content: "Common issues: SQL Injection, Hardcoded Secrets. Use GitGrep to detect these issues.",
  },
  "ai-code-analysis": {
    title: "AI-Powered Code Analysis",
    date: "2026-03-25",
    content: "GitGrep uses AI for code pattern recognition and security insights.",
  },
  // زود هنا المقالات الجديدة
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#020408] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/blog" className="text-blue-400 mb-8 inline-block">← Back</Link>
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white">{post.title}</h1>
          <p className="text-slate-400 mt-2">{post.date}</p>
          <p className="text-slate-300 mt-6">{post.content}</p>
        </div>
      </div>
    </div>
  );
}