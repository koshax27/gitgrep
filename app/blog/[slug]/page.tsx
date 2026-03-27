// app/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const posts: Record<string, { title: string; date: string; content: string }> = {
  "how-to-search-github-code-like-a-pro": {
    title: "How to Search GitHub Code Like a Pro",
    date: "March 20, 2026",
    content: "Use advanced search operators like `language:javascript`. Use GitGrep's AI analysis. Save your favorite results.",
  },
  "understanding-code-security-vulnerabilities": {
    title: "Understanding Code Security Vulnerabilities",
    date: "March 18, 2026",
    content: "Common issues: SQL Injection, Hardcoded Secrets. Use GitGrep to identify these issues.",
  },
  "ai-powered-code-analysis-guide": {
    title: "AI-Powered Code Analysis: A Complete Guide",
    date: "March 15, 2026",
    content: "GitGrep uses AI for code pattern recognition, security insights, and documentation assessment.",
  },
  "top-10-github-repositories-every-developer-should-know": {
    title: "Top 10 GitHub Repositories Every Developer Should Know",
    date: "March 12, 2026",
    content: "freeCodeCamp, Awesome, React, Vue, TensorFlow, VS Code, Tailwind CSS, Next.js, TypeScript.",
  },
  "how-to-use-understand-repo-feature": {
    title: "How to Use the 'Understand Repo' Feature",
    date: "March 10, 2026",
    content: "Click Understand Repo, enter GitHub URL, click Analyze. Get stats, structure, security insights.",
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
    <div className="min-h-screen bg-[#020408] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/blog" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">← Back to Blogs</Link>
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          <p className="text-slate-400 mb-6">{post.date}</p>
          <p className="text-slate-300 leading-relaxed">{post.content}</p>
        </div>
      </div>
    </div>
  );
}