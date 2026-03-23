import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { projects } = await req.json();
    console.log("📊 Fetching stats for:", projects);
    
    if (!projects || projects.length === 0) {
      return NextResponse.json({ stats: {} });
    }
    
    const stats: Record<string, any> = {};
    
    for (const project of projects) {
      try {
        const res = await fetch(`https://api.github.com/repos/${project}`, {
          headers: {
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "GitGrep-App",
          },
        });
        
        console.log(`📊 ${project}: ${res.status}`);
        
        if (res.ok) {
          const data = await res.json();
          stats[project] = {
            stars: data.stargazers_count || 0,
            forks: data.forks_count || 0,
            issues: data.open_issues_count || 0,
            lastUpdate: new Date(data.updated_at).toLocaleDateString(),
          };
        } else {
          console.log(`❌ ${project}: failed with status ${res.status}`);
          stats[project] = { stars: 0, forks: 0, issues: 0, lastUpdate: "Unknown" };
        }
      } catch (error) {
        console.error(`❌ Failed to fetch ${project}:`, error);
        stats[project] = { stars: 0, forks: 0, issues: 0, lastUpdate: "Error" };
      }
    }
    
    console.log("✅ Final stats:", stats);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}