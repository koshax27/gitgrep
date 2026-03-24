import { NextResponse } from "next/server";
import { githubHeaders } from "@/lib/github";

export async function POST(req: Request) {
  try {
    const { url, repo } = await req.json();
    
    // تطبيع الإدخال: يدعم رابط GitHub أو صيغة owner/repo
    let repoPath: string | null = null;
    
    if (repo && typeof repo === "string") {
      repoPath = repo;
    } else if (url && typeof url === "string") {
      const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (match) {
        repoPath = match[1];
      }
    }
    
    if (!repoPath) {
      return NextResponse.json({ error: "Missing repository (use owner/repo format or GitHub URL)" }, { status: 400 });
    }
    
    const [owner, repoName] = repoPath.split("/");
    if (!owner || !repoName) {
      return NextResponse.json({ error: "Invalid repository format. Use owner/repo (e.g., vercel/next.js)" }, { status: 400 });
    }
    
    // جلب بيانات الـ repo
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: githubHeaders(),
    });
    const repoData = await repoRes.json();
    
    if (!repoRes.ok) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }
    
    // جلب الـ languages
    const langsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/languages`,
      { headers: githubHeaders() }
    );
    const languages = await langsRes.json();
    const topLang = Object.keys(languages)[0] || "Unknown";
    
    // 📦 Dependencies Scanner
    let dependenciesAnalysis = "";
    let hasPackageJson = false;
    let totalDeps = 0;
    let outdatedDeps: string[] = [];

    try {
      const packageRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contents/package.json`,
        { headers: githubHeaders() }
      );
      if (packageRes.ok) {
        const packageData = await packageRes.json();
        if (packageData?.content) {
          hasPackageJson = true;
          const packageJson = JSON.parse(Buffer.from(packageData.content, "base64").toString("utf-8"));
          const deps = packageJson.dependencies || {};
          const devDeps = packageJson.devDependencies || {};
          totalDeps = Object.keys(deps).length + Object.keys(devDeps).length;
          
          const riskyPackages = [
            { name: "lodash", version: "< 4.17.21", risk: "Prototype pollution vulnerability" },
            { name: "axios", version: "< 0.21.2", risk: "SSRF vulnerability" },
            { name: "express", version: "< 4.17.3", risk: "Multiple vulnerabilities" },
            { name: "next", version: "< 12.0.9", risk: "Security patches required" },
            { name: "react", version: "< 17.0.2", risk: "Outdated version" },
          ];
          
          for (const [name, version] of Object.entries(deps)) {
            for (const risky of riskyPackages) {
              if (name === risky.name) {
                outdatedDeps.push(`⚠️ ${name}@${version} - ${risky.risk}`);
              }
            }
          }
          
          dependenciesAnalysis = `📦 **Dependencies:**
  - Total dependencies: ${totalDeps}
  - Production: ${Object.keys(deps).length}
  - Development: ${Object.keys(devDeps).length}
${outdatedDeps.length > 0 ? `\n⚠️ **Potential Risks:**
${outdatedDeps.map(d => `  ${d}`).join("\n")}` : "\n  ✅ No obvious risky packages detected"}`;
        }
      }
    } catch (e) {
      console.error("Package.json fetch error:", e);
    }
    
    // جلب هيكل الملفات
    let structureTree = "";
    try {
      const contentsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contents?per_page=30`,
        { headers: githubHeaders() }
      );
      if (contentsRes.ok) {
        const contents = await contentsRes.json();
        const folders = contents.filter((item: any) => item.type === "dir").map((item: any) => `📁 ${item.name}`);
        const files = contents.filter((item: any) => item.type === "file").map((item: any) => `📄 ${item.name}`);
        const allItems = [...folders, ...files].slice(0, 15);
        structureTree = allItems.map(item => `  ${item}`).join("\n");
      }
    } catch (e) {
      console.error("Structure fetch error:", e);
    }
    
    // جلب الـ README وتحليلها
    let readme = "";
    let authPatterns: { pattern: RegExp; name: string; icon: string }[] = [];
    let aiSummary = "";
    
    try {
      const readmeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/readme`,
        { headers: githubHeaders() }
      );
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        if (readmeData?.content) {
          readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
        }
        
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
    
    // 🐞 Bug Mode Analysis
    let bugAnalysis: string[] = [];
    try {
      if (repoData.open_issues_count > 100) {
        bugAnalysis.push(`🐛 ${repoData.open_issues_count} open issues - قد تحتوي على bugs غير محلولة`);
      }
      if (readme.toLowerCase().includes("bug") || readme.toLowerCase().includes("issue")) {
        bugAnalysis.push(`📝 README mentions bugs/issues - راجع قسم troubleshooting`);
      }
      
      try {
        const packageRes = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/contents/package.json`,
          { headers: githubHeaders() }
        );
        if (packageRes.ok) {
          const packageData = await packageRes.json();
          if (packageData?.content) {
            const packageJson = JSON.parse(Buffer.from(packageData.content, "base64").toString("utf-8"));
            const deps = packageJson.dependencies || {};
            const totalDeps = Object.keys(deps).length;
            if (totalDeps > 50) {
              bugAnalysis.push(`📦 High dependencies (${totalDeps}) - راقب الـ vulnerabilities`);
            }
          }
        }
      } catch (e) {}
      
      if (languages["JavaScript"] && !languages["TypeScript"]) {
        bugAnalysis.push(`🔧 Pure JavaScript - استخدم TypeScript لتحسين الأمان`);
      } else if (languages["TypeScript"]) {
        bugAnalysis.push(`✅ TypeScript project - يوفر أمان أفضل`);
      }
      
      if (bugAnalysis.length === 0) {
        bugAnalysis.push("✅ No obvious bug indicators found");
      }
    } catch (e) {
      console.error("Bug analysis error:", e);
      bugAnalysis.push("⚠️ Could not perform full bug analysis");
    }
    
    // بناء التقرير النهائي
    const analysis = `
📦 **Repository:** ${repoData.full_name}
⭐ **Stars:** ${repoData.stargazers_count.toLocaleString()}
🔧 **Main Language:** ${topLang}
📝 **Description:** ${repoData.description || "No description"}

🤖 **AI Summary:**
${aiSummary || "  No summary available"}

📁 **Project Structure (Top Level):**
${structureTree || "  No structure data available"}

📁 **Languages:**
${Object.keys(languages).slice(0, 5).map(lang => `  - ${lang}: ${languages[lang].toLocaleString()} bytes`).join("\n") || "  - No language data"}

🔐 **Authentication Patterns Found:**
${authPatterns.length > 0 ? authPatterns.map(p => `  ${p.icon} ${p.name}`).join("\n") : "  ❌ No clear authentication patterns detected"}

⚠️ **Security & Risk Assessment:**
${risks.length > 0 ? risks.map(r => `  ${r}`).join("\n") : "  ✅ No major security concerns detected"}

🐞 **Bug Mode Analysis:**
${bugAnalysis.map(b => `  ${b}`).join("\n")}
${hasPackageJson ? dependenciesAnalysis : "📦 **Dependencies:**\n  No package.json found"}


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