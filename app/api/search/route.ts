import { NextResponse } from "next/server"
import { rateLimit } from "../../../lib/rateLimit"

export async function GET(req: Request) {
  // Rate Limiting
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimitResult = rateLimit(ip, 20, 60000);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  if (!q) return NextResponse.json({ items: [] })

  const token = process.env.GITHUB_TOKEN

  console.log("🔍 Searching for:", q, "Token exists:", !!token)

  try {
    // البحث في GitHub Repositories
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=70`,
      {
        headers: {
          ...(token && { Authorization: `token ${token}` }),
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "GitGrep-App",
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json()
      console.error("❌ GitHub API Error:", errorData)
      return NextResponse.json({ items: [], total_count: 0 })
    }

    const data = await res.json()
    console.log("📦 GitHub returned:", data.total_count, "repos")

    // تحويل الـ repositories لنفس شكل الـ code search
    const mappedItems = data.items.map((repo: any) => ({
      html_url: repo.html_url,
      repository: {
        full_name: repo.full_name,
        stargazers_count: repo.stargazers_count,
        language: repo.language,
        updated_at: repo.updated_at,
        description: repo.description,
      },
      path: repo.name,
      text_matches: repo.description ? [{ fragment: repo.description }] : [],
    }));

    return NextResponse.json({
      items: mappedItems,
      total_count: data.total_count,
    });

  } catch (error: any) {
    console.error("❌ Search API Crash:", error)
    return NextResponse.json({ items: [], total_count: 0 })
  }
}