// app/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

const posts: Record<string, { title: string; date: string; content: string }> = {
  "how-to-search-github-code-like-a-pro": {
    title: "How to Search GitHub Code Like a Pro",
    date: "March 20, 2026",
    content: `
GitHub is the world's largest code repository, but finding exactly what you need can be challenging.

## 1. Use Advanced Search Operators

### Search by Language
\`\`\`
useState language:javascript
\`\`\`

### Search by Repository
\`\`\`
api endpoint repo:vercel/next.js
\`\`\`

## 2. Use GitGrep's AI Analysis

Our AI assistant can analyze search results and provide insights.

## 3. Save Your Favorite Results

Star code snippets you find useful and access them later.

Start searching like a pro today!
    `,
  },
  "understanding-code-security-vulnerabilities": {
    title: "Understanding Code Security Vulnerabilities",
    date: "March 18, 2026",
    content: `
Security vulnerabilities in open source code can have serious consequences.

## Common Vulnerabilities

### SQL Injection
\`\`\`javascript
// Vulnerable
const query = "SELECT * FROM users WHERE id = " + userId;

// Secure
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId]);
\`\`\`

### Hardcoded Secrets
Never commit API keys, passwords, or tokens to your repository.

Stay secure and code responsibly!
    `,
  },
  "ai-powered-code-analysis-guide": {
    title: "AI-Powered Code Analysis: A Complete Guide",
    date: "March 15, 2026",
    content: `
Artificial intelligence is revolutionizing how developers understand and work with code.

## How GitGrep Uses AI

- Code Pattern Recognition
- Security Insights
- Documentation Quality Assessment

## Getting Started

Try GitGrep's AI Assistant after any search.

The future of code search is here!
    `,
  },
  "top-10-github-repositories-every-developer-should-know": {
    title: "Top 10 GitHub Repositories Every Developer Should Know",
    date: "March 12, 2026",
    content: `
These repositories are essential resources for any developer.

1. **freeCodeCamp** - Learn to code
2. **Awesome** - Curated resources
3. **React** - Frontend framework
4. **Vue** - Progressive framework
5. **TensorFlow** - Machine learning
6. **VS Code** - Code editor
7. **Tailwind CSS** - CSS framework
8. **Next.js** - React framework
9. **TypeScript** - Typed JavaScript

Use GitGrep to search within these repositories and learn from the best!
    `,
  },
  "how-to-use-understand-repo-feature": {
    title: "How to Use the 'Understand Repo' Feature",
    date: "March 10, 2026",
    content: `
GitGrep's most powerful feature helps you understand any repository in seconds.

## Getting Started

1. Click the "Understand Repo" button on the homepage
2. Enter a GitHub repository URL (e.g., https://github.com/vercel/next.js)
3. Click "Analyze Repository"

## What You'll Get

- Repository Stats (stars, forks, issues)
- Project Structure
- Authentication Patterns
- Security & Risk Assessment

## AI Deep Analysis

After analyzing, click "AI Deep Analysis" for detailed insights.

Start exploring any codebase today!
    `,
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
        <Link href="/blog" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to Blogs
        </Link>
        
        <article className="bg-[#0d1117] border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          <p className="text-slate-400 mb-8">{post.date}</p>
          <div className="prose prose-invert max-w-none">
            {post.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return <h1 key={i} className="text-2xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold text-white mt-4 mb-2">{line.slice(3)}</h2>;
              }
              if (line.startsWith('```') && line.endsWith('```')) {
                return <pre key={i} className="bg-black/50 p-4 rounded-lg overflow-x-auto my-3"><code className="text-slate-300">{line.slice(3, -3)}</code></pre>;
              }
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return <li key={i} className="ml-4 mb-1 text-slate-300">{line.slice(2)}</li>;
              }
              if (line.trim()) {
                return <p key={i} className="text-slate-300 mb-3 leading-relaxed">{line}</p>;
              }
              return <br key={i} />;
            })}
          </div>
        </article>
      </div>
    </div>
  );
}