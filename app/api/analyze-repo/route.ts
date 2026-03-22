import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }
    
    const [, owner, repo] = match;
    
    // جلب بيانات الـ repo
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    const repoData = await repoRes.json();
    
    if (!repoRes.ok) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }
    
    // جلب الـ languages
    const langsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
    const languages = await langsRes.json();
    const topLang = Object.keys(languages)[0] || "Unknown";
    
    // جلب الـ README وتحليلها
    let readme = "";
    let authPatterns: { pattern: RegExp; name: string; icon: string }[] = [];
    let aiSummary = "";
    
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
        
        // أنماط الـ authentication
        const patterns = [
          { pattern: /jwt/i, name: "JWT", icon: "🔑" },
          { pattern: /oauth/i, name: "OAuth", icon: "🔐" },
          { pattern: /passport/i, name: "Passport.js", icon: "🛂" },
          { pattern: /firebase.*auth/i, name: "Firebase Auth", icon: "🔥" },
          { pattern: /nextauth/i, name: "NextAuth.js", icon: "⚡" },
          { pattern: /supabase.*auth/i, name: "Supabase Auth", icon: "🐘" },
          { pattern: /clerk/i, name: "Clerk", icon: "📝" },
          { pattern: /auth0/i, name: "Auth0", icon: "0️⃣" },
          { pattern: /better[-_]auth/i, name: "Better Auth", icon: "✨" },
        ];
        
        patterns.forEach(p => {
          if (p.pattern.test(readme)) {
            authPatterns.push(p);
          }
        });
        
        // 🤖 AI Summary
        aiSummary = `📋 **Quick Summary:**\n`;
        aiSummary += `- ${repoData.description || "No description"}\n`;
        aiSummary += `- Main language: ${topLang}\n`;
        aiSummary += `- ${authPatterns.length > 0 ? `Uses ${authPatterns.map(p => p.name).join(", ")} for authentication` : "No clear authentication framework detected"}\n`;
        aiSummary += `- ${repoData.open_issues_count > 100 ? "Has many open issues" : "Has manageable open issues"}\n`;
      }
    } catch (e) {
      console.error("README fetch error:", e);
    }
    
    // تحليل المخاطر
    let risks = [];
    if (repoData.open_issues_count > 100) risks.push("⚠️ High number of open issues (>100)");
    if (!readme || !readme.toLowerCase().includes("auth")) risks.push("⚠️ No authentication documentation found in README");
    if (repoData.archived) risks.push("📦 Repository is archived");
    if (repoData.open_issues_count > 50) risks.push("⚠️ Moderate number of open issues (>50)");
    
    // بناء التقرير النهائي
    const analysis = `
📦 **Repository:** ${repoData.full_name}
⭐ **Stars:** ${repoData.stargazers_count.toLocaleString()}
🔧 **Main Language:** ${topLang}
📝 **Description:** ${repoData.description || "No description"}

🤖 **AI Summary:**
${aiSummary || "  No summary available"}

📁 **Languages:**
${Object.keys(languages).slice(0, 5).map(lang => `  - ${lang}: ${languages[lang].toLocaleString()} bytes`).join("\n") || "  - No language data"}

🔐 **Authentication Patterns Found:**
${authPatterns.length > 0 ? authPatterns.map(p => `  ${p.icon} ${p.name}`).join("\n") : "  ❌ No clear authentication patterns detected"}

⚠️ **Security & Risk Assessment:**
${risks.length > 0 ? risks.map(r => `  ${r}`).join("\n") : "  ✅ No major security concerns detected"}

📊 **Stats:**
- Open Issues: ${repoData.open_issues_count.toLocaleString()}
- Forks: ${repoData.forks_count.toLocaleString()}
- Last Updated: ${new Date(repoData.updated_at).toLocaleDateString()}
- Size: ${(repoData.size / 1024).toFixed(2)} MB
`;
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to analyze repository" }, { status: 500 });
  }
}