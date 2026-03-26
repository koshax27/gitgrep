// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";

const posts = {
  "how-to-search-github-code-like-a-pro": {
    title: "How to Search GitHub Code Like a Pro",
    date: "2026-03-20",
    readTime: "5 min",
    category: "Tutorial",
    tags: ["GitHub", "Search", "Tips"],
    content: `
# How to Search GitHub Code Like a Pro

GitHub is the world's largest code repository, but finding exactly what you need can be challenging. Here are some pro tips to level up your code search game.

## 1. Use Advanced Search Operators

GitHub supports powerful search operators that can narrow down your results dramatically.

### Search by Language
\`\`\`
useState language:javascript
\`\`\`
This finds code containing "useState" only in JavaScript files.

### Search by Repository
\`\`\`
api endpoint repo:vercel/next.js
\`\`\`
Searches only within the Next.js repository.

### Exclude Terms
\`\`\`
api endpoint -test -example
\`\`\`
Excludes results containing "test" or "example".

## 2. Use GitGrep's AI Analysis

Our AI assistant can analyze search results and provide insights about code patterns, security issues, and best practices.

## 3. Save Your Favorite Results

Star code snippets you find useful and access them later in your Saved Items.

## 4. Use Filters Effectively

- **Language Filter**: Narrow down to your preferred programming language
- **Stars Filter**: Find code from popular repositories

## 5. Master the "Understand Repo" Feature

Paste any GitHub repository URL to get:
- Project structure
- Language statistics
- Authentication patterns
- Security risks

---

**Pro Tip**: Combine operators for precision. Example: \`useState language:typescript stars:>100\` finds TypeScript useState code from repositories with over 100 stars.

Start searching like a pro today!
`,
  },
  "understanding-code-security-vulnerabilities": {
    title: "Understanding Code Security Vulnerabilities",
    date: "2026-03-18",
    readTime: "8 min",
    category: "Security",
    tags: ["Security", "Vulnerabilities", "Best Practices"],
    content: `
# Understanding Code Security Vulnerabilities

Security vulnerabilities in open source code can have serious consequences. Here's what you need to know.

## Common Vulnerabilities

### 1. SQL Injection
When user input is directly inserted into SQL queries.

**Example of vulnerable code:**
\`\`\`javascript
const query = "SELECT * FROM users WHERE id = " + userId;
\`\`\`

**Secure alternative:**
\`\`\`javascript
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId]);
\`\`\`

### 2. Cross-Site Scripting (XSS)
When user input is rendered without sanitization.

### 3. Hardcoded Secrets
Never commit API keys, passwords, or tokens to your repository.

## Using GitGrep for Security

GitGrep's security analysis can help you identify:
- Hardcoded secrets
- Known vulnerable patterns
- Authentication issues

## Best Practices

1. **Use environment variables** for sensitive data
2. **Regularly update dependencies** to patch vulnerabilities
3. **Enable automated security scanning**
4. **Review code before merging**

Stay secure and code responsibly!
`,
  },
  "ai-powered-code-analysis-guide": {
    title: "AI-Powered Code Analysis: A Complete Guide",
    date: "2026-03-15",
    readTime: "6 min",
    category: "AI",
    tags: ["AI", "Code Analysis", "Machine Learning"],
    content: `
# AI-Powered Code Analysis: A Complete Guide

Artificial intelligence is revolutionizing how developers understand and work with code.

## How GitGrep Uses AI

### Code Pattern Recognition
Our AI identifies common patterns in your search results, helping you understand code structure quickly.

### Security Insights
AI analyzes code for potential security vulnerabilities and suggests fixes.

### Documentation Quality Assessment
Get automated feedback on README quality and documentation completeness.

## Benefits of AI Code Analysis

- **Faster onboarding** to new codebases
- **Early detection** of security issues
- **Code quality improvement** suggestions
- **Learning** from best practices

## Getting Started

Try GitGrep's AI Assistant after any search:
1. Enter your search query
2. Click "Ask AI Assistant"
3. Get detailed analysis of the code

The future of code search is here!
`,
  },
  "top-10-github-repositories-every-developer-should-know": {
    title: "Top 10 GitHub Repositories Every Developer Should Know",
    date: "2026-03-12",
    readTime: "7 min",
    category: "Resources",
    tags: ["GitHub", "Open Source", "Learning"],
    content: `
# Top 10 GitHub Repositories Every Developer Should Know

These repositories are essential resources for any developer.

## 1. [freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp)
Learn to code with free, interactive lessons.

## 2. [Awesome](https://github.com/sindresorhus/awesome)
Curated lists of awesome resources for every programming topic.

## 3. [You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS)
Deep dive into JavaScript concepts.

## 4. [React](https://github.com/facebook/react)
The most popular frontend framework.

## 5. [Vue](https://github.com/vuejs/vue)
Progressive JavaScript framework.

## 6. [TensorFlow](https://github.com/tensorflow/tensorflow)
Machine learning library.

## 7. [VS Code](https://github.com/microsoft/vscode)
The most popular code editor.

## 8. [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss)
Utility-first CSS framework.

## 9. [Next.js](https://github.com/vercel/next.js)
React framework for production.

## 10. [TypeScript](https://github.com/microsoft/TypeScript)
Typed JavaScript at any scale.

Use GitGrep to search within these repositories and learn from the best!
`,
  },
  "how-to-use-understand-repo-feature": {
    title: "How to Use the 'Understand Repo' Feature",
    date: "2026-03-10",
    readTime: "4 min",
    category: "Tutorial",
    tags: ["GitGrep", "Tutorial", "Repository Analysis"],
    content: `
# How to Use the 'Understand Repo' Feature

GitGrep's most powerful feature helps you understand any repository in seconds.

## Getting Started

1. Click the **"Understand Repo"** button on the homepage
2. Enter a GitHub repository URL (e.g., \`https://github.com/vercel/next.js\`)
3. Click **"Analyze Repository"**

## What You'll Get

### 📊 Repository Stats
- Stars, forks, and open issues
- Last update date
- Primary languages

### 📁 Project Structure
See top-level folders and files at a glance.

### 🔐 Authentication Patterns
Detect authentication frameworks used in the project.

### ⚠️ Security & Risk Assessment
Get insights about potential security concerns.

### 🐞 Bug Mode Analysis
Understand potential bug areas in the codebase.

## AI Deep Analysis

After analyzing, click **"AI Deep Analysis"** to get:
- Documentation quality assessment
- Dependency recommendations
- Potential concerns
- Improvement suggestions

## Pro Tips

- Use \`owner/repo\` format (e.g., \`vercel/next.js\`) for faster analysis
- Save important repositories to My Projects for quick access
- Share analysis with your team using the copy button

Start exploring any codebase today!
`,
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts[params.slug as keyof typeof posts];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        {/* Article */}
        <article className="bg-[#0d1117] border border-white/10 rounded-2xl p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">
              {post.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} />
              <span>{new Date(post.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={12} />
              <span>{post.readTime}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 bg-white/5 rounded-full text-slate-400">
                <Tag size={10} className="inline mr-1" />
                {tag}
              </span>
            ))}
          </div>

          <div className="prose prose-invert max-w-none">
            {post.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return <h1 key={i} className="text-3xl font-bold mt-8 mb-4 text-white">{line.slice(2)}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-white">{line.slice(3)}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-bold mt-4 mb-2 text-white">{line.slice(4)}</h3>;
              }
              if (line.startsWith('```') && line.endsWith('```')) {
                return <pre key={i} className="bg-black/50 p-4 rounded-lg overflow-x-auto my-4"><code className="text-slate-300">{line.slice(3, -3)}</code></pre>;
              }
              if (line.startsWith('```')) {
                return null;
              }
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return <li key={i} className="ml-4 mb-1 text-slate-300">{line.slice(2)}</li>;
              }
              if (line.trim()) {
                return <p key={i} className="text-slate-300 leading-relaxed mb-4">{line}</p>;
              }
              return <br key={i} />;
            })}
          </div>
        </article>
      </div>
    </div>
  );
}