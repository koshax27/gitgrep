import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { projects } = await req.json();
    const stats: Record<string, any> = {};
    
    for (const project of projects) {
      try {
        const res = await fetch(`https://api.github.com/repos/${project}`, {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "GitGrep-App",
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          stats[project] = {
            stars: data.stargazers_count || 0,
            forks: data.forks_count || 0,
            issues: data.open_issues_count || 0,
            lastUpdate: new Date(data.updated_at).toLocaleDateString(),
          };
        } else {
          stats[project] = { stars: 0, forks: 0, issues: 0, lastUpdate: "Unknown" };
        }
      } catch (error) {
        stats[project] = { stars: 0, forks: 0, issues: 0, lastUpdate: "Error" };
      }
    }
    
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}