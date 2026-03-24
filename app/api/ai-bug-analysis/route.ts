import { NextResponse } from "next/server";
import { githubHeaders } from "@/lib/github";

export async function POST(req: Request) {
  try {
    let body: { url?: string; repo?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // تطبيع الإدخال: يدعم رابط GitHub أو صيغة owner/repo
    let repoPath = body?.repo?.trim() || body?.url?.trim();
    if (!repoPath || typeof repoPath !== "string") {
      return NextResponse.json({ error: "Missing repository (use owner/repo or GitHub URL)" }, { status: 400 });
    }

    // استخراج owner/repo من الرابط أو استخدامه مباشرة
    let owner: string, repo: string;
    const githubMatch = repoPath.match(/github\.com\/([^\/]+)\/([^\/?#]+)/);
    if (githubMatch) {
      owner = githubMatch[1];
      repo = githubMatch[2];
    } else if (repoPath.includes('/') && !repoPath.includes(' ')) {
      const parts = repoPath.split('/');
      if (parts.length >= 2) {
        owner = parts[0];
        repo = parts[1];
      } else {
        return NextResponse.json({ error: "Invalid repository format. Use owner/repo (e.g., vercel/next.js)" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Invalid GitHub URL or format. Use owner/repo or full GitHub URL" }, { status: 400 });
    }

    // جلب الـ README
    let readme = "";
    try {
      const readmeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        { headers: githubHeaders() }
      );
      if (readmeRes.ok) {
        const readmeData = (await readmeRes.json()) as { content?: string };
        if (readmeData?.content) {
          readme = Buffer.from(readmeData.content, "base64")
            .toString("utf-8")
            .slice(0, 3000);
        }
      }
    } catch {
      /* optional */
    }

    // جلب الـ package.json
    let deps: string[] = [];
    let devDeps: string[] = [];
    let totalDeps = 0;
    try {
      const packageRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
        { headers: githubHeaders() }
      );
      if (packageRes.ok) {
        const packageData = (await packageRes.json()) as { content?: string };
        if (packageData?.content) {
          const raw = Buffer.from(packageData.content, "base64").toString("utf-8");
          const packageJson = JSON.parse(raw) as {
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
          };
          deps = Object.keys(packageJson.dependencies || {}).slice(0, 15);
          devDeps = Object.keys(packageJson.devDependencies || {}).slice(0, 10);
          totalDeps = (Object.keys(packageJson.dependencies || {}).length) + (Object.keys(packageJson.devDependencies || {}).length);
        }
      }
    } catch {
      /* optional */
    }

    // جلب معلومات الـ repo للإحصائيات
    let repoData: { open_issues_count?: number; stargazers_count?: number } = {};
    try {
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: githubHeaders()
      });
      if (repoRes.ok) {
        repoData = await repoRes.json();
      }
    } catch {
      /* optional */
    }

    const readmeLower = readme.toLowerCase();
    const hasSecurityDocs = readmeLower.includes("security") || readmeLower.includes("vulnerability");
    const hasBugDocs = readmeLower.includes("bug") || readmeLower.includes("issue");
    const hasAuthDocs = readmeLower.includes("auth") || readmeLower.includes("login") || readmeLower.includes("oauth");
    const openIssues = repoData.open_issues_count || 0;
    
    // تحليل الـ documentation quality
    let docQuality = "";
    if (readme.length > 2000) {
      docQuality = "✅ README is comprehensive and well-documented (2000+ chars).";
    } else if (readme.length > 800) {
      docQuality = "✅ README is good (800+ chars).";
    } else if (readme.length > 200) {
      docQuality = "⚠️ README is brief. Consider adding more documentation.";
    } else {
      docQuality = "🔴 README is very short or missing. Add setup instructions and examples.";
    }
    
    // تحليل الـ dependencies
    let depsAnalysis = "";
    if (totalDeps > 0) {
      if (totalDeps > 100) {
        depsAnalysis = `⚠️ High number of dependencies (${totalDeps}) - review for security vulnerabilities and consider reducing.`;
      } else if (totalDeps > 50) {
        depsAnalysis = `📦 ${totalDeps} dependencies total. Moderate count - review regularly.`;
      } else {
        depsAnalysis = `✅ ${totalDeps} dependencies total. Manageable count.`;
      }
      
      if (deps.length > 0) {
        depsAnalysis += `\n\n**Production dependencies:**\n${deps.map(d => `  • ${d}`).join("\n")}`;
      }
      if (devDeps.length > 0) {
        depsAnalysis += `\n\n**Development dependencies:**\n${devDeps.map(d => `  • ${d}`).join("\n")}`;
      }
    } else {
      depsAnalysis = "📦 No package.json found or dependencies not accessible.";
    }
    
    // تحليل المشاكل المحتملة
    const concerns = [];
    if (openIssues > 500) concerns.push(`⚠️ High number of open issues (${openIssues}) - may indicate active bug reports or maintenance challenges.`);
    else if (openIssues > 100) concerns.push(`⚠️ Moderate open issues (${openIssues}) - regular review recommended.`);
    
    if (!hasSecurityDocs) concerns.push("⚠️ Security best practices not explicitly documented in README.");
    if (!hasAuthDocs) concerns.push("⚠️ No authentication documentation found - check if auth is needed for your use case.");
    if (!hasBugDocs && openIssues > 50) concerns.push("⚠️ Bugs/issues mentioned in README would help users understand common problems.");
    
    if (concerns.length === 0) concerns.push("✅ No major concerns detected.");
    
    // توصيات
    const recommendations = [];
    if (totalDeps > 80) recommendations.push("🔧 Run `npm audit` regularly to check for vulnerabilities.");
    if (readme.length < 800) recommendations.push("📝 Expand README with setup instructions, examples, and API documentation.");
    if (!hasSecurityDocs) recommendations.push("🛡️ Add a SECURITY.md file or security section in README.");
    if (openIssues > 100) recommendations.push("🐛 Review open issues regularly and prioritize critical bugs.");
    
    if (recommendations.length === 0) {
      recommendations.push("✅ Project appears well-maintained. Continue good practices!");
      recommendations.push("💡 Consider adding contribution guidelines if not already present.");
    }
    
    // إحصائيات إضافية
    const statsSection = `
📊 **Repository Stats:**
• ⭐ ${repoData.stargazers_count?.toLocaleString() || 'N/A'} stars
• 🐛 ${openIssues.toLocaleString()} open issues
• 📅 Last analysis: ${new Date().toLocaleDateString()}
`;

    const analysis = `🤖 **AI Deep Analysis for ${owner}/${repo}**

📋 **Documentation Quality:**
${docQuality}

📦 **Dependencies:**
${depsAnalysis}

🔧 **Potential Concerns:**
${concerns.map(c => `• ${c}`).join("\n")}

💡 **Recommendations:**
${recommendations.map(r => `• ${r}`).join("\n")}

${statsSection}
*Note: This is an automated analysis based on repository metadata and README content. For critical decisions, review the code manually.*`;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze repository. Please try again." }, { status: 500 });
  }
}