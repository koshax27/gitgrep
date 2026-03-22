import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // استخراج owner/repo من الرابط
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }
    
    const [, owner, repo] = match;
    
    // جلب بيانات الـ repo من GitHub API
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    const repoData = await repoRes.json();
    
    if (!repoRes.ok) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }
    
    // تحليل بسيط
    const analysis = `
📦 Repository: ${repoData.full_name}
⭐ Stars: ${repoData.stargazers_count}
🔧 Language: ${repoData.language || "Unknown"}
📝 Description: ${repoData.description || "No description"}
🔐 Open Issues: ${repoData.open_issues_count}
📁 Size: ${(repoData.size / 1024).toFixed(2)} MB
🍴 Forks: ${repoData.forks_count}
📅 Last Updated: ${new Date(repoData.updated_at).toLocaleDateString()}
    `;
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to analyze repository" }, { status: 500 });
  }
}