// app/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

const posts: Record<string, { title: string; date: string; content: string }> = {
  "how-to-search-github-code": {
    title: "How to Search GitHub Code Like a Pro",
    date: "March 20, 2026",
    content: "Use advanced search operators like `language:javascript`. Use GitGrep's AI analysis. Save your favorite results. Combine operators for precision: `useState language:typescript stars:>100`",
  },
  "code-security-vulnerabilities": {
    title: "Understanding Code Security Vulnerabilities",
    date: "March 18, 2026",
    content: "Common issues: SQL Injection, Hardcoded Secrets, XSS. Use GitGrep's security analysis to identify these issues. Always use environment variables for secrets.",
  },
  "ai-code-analysis": {
    title: "AI-Powered Code Analysis",
    date: "March 15, 2026",
    content: "GitGrep uses AI for code pattern recognition, security insights, and documentation assessment. Try the AI Assistant after any search.",
  },
  "top-github-repos": {
    title: "Top 10 GitHub Repositories",
    date: "March 12, 2026",
    content: "freeCodeCamp, Awesome, React, Vue, TensorFlow, VS Code, Tailwind CSS, Next.js, TypeScript. Use GitGrep to search within these repositories.",
  },
  "understand-repo": {
    title: "How to Use Understand Repo",
    date: "March 10, 2026",
    content: "Click Understand Repo, enter GitHub URL, click Analyze. Get stats, structure, security insights, and AI deep analysis.",
  },
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
        <Link href="/blog" className="text-blue-400 mb-8 inline-block">← Back to Blogs</Link>
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          <p className="text-slate-400 mb-6">{post.date}</p>
          <p className="text-slate-300">{post.content}</p>
        </div>
      </div>
    </div>
  );
}