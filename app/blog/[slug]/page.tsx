import Link from "next/link";
import { notFound } from "next/navigation";

// تعريف المقالات
const posts: Record<string, { title: string; date: string; content: string }> = {
  "test-post": {
    title: "Test Blog Post",
    date: "2026-03-26",
    content: "This is a test blog post. The routing is working correctly! GitGrep is a powerful code search tool.",
  },
  "how-to-search-github-code-like-a-pro": {
    title: "How to Search GitHub Code Like a Pro",
    date: "2026-03-20",
    content: "GitHub is the world's largest code repository. Use advanced search operators like language:javascript. Use GitGrep's AI analysis. Save your favorite results.",
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white p-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to Blogs
        </Link>
        
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-slate-400 mb-6">{post.date}</p>
          <p className="text-slate-300 leading-relaxed">{post.content}</p>
        </div>
      </div>
    </div>
  );
}