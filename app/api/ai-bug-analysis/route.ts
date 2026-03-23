import { NextResponse } from "next/server";
import { githubHeaders } from "@/lib/github";

export async function POST(req: Request) {
  try {
    let body: { url?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const url = body?.url?.trim();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing repository URL" }, { status: 400 });
    }

    const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }

    const [, owner, repo] = match;

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
            .slice(0, 2000);
        }
      }
    } catch {
      /* optional */
    }

    let deps: string[] = [];
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
          };
          deps = Object.keys(packageJson.dependencies || {}).slice(0, 10);
        }
      }
    } catch {
      /* optional */
    }

    const readmeLower = readme.toLowerCase();
    const analysis = `🤖 **AI Deep Analysis for ${owner}/${repo}**

📋 **Documentation Quality:**
${readme.length > 800 ? "✅ README is comprehensive and well-documented." : "⚠️ README is brief. Consider adding more documentation."}

📦 **Dependencies:**
${deps.length > 0 ? `Found ${deps.length} dependencies:\n${deps.map((d) => `  • ${d}`).join("\n")}` : "No dependencies found or package.json not accessible."}

🔧 **Potential Concerns:**
${readmeLower.includes("bug") ? "• README mentions bugs - check issues section." : "• No explicit bug mentions in README."}
${readmeLower.includes("security") ? "• Security considerations documented." : "• Security best practices not explicitly documented."}

💡 **Recommendations:**
1. ${deps.length > 30 ? "High number of dependencies - review for security vulnerabilities." : "Dependency count is manageable."}
2. ${readme.length < 500 ? "Expand README with setup instructions and examples." : "README is well-maintained."}
3. Review open issues regularly and prioritize critical bugs.

*Note: This is an automated analysis. For critical decisions, review the code manually.*`;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
