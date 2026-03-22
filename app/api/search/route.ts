import { NextResponse } from "next/server"
import { rateLimit } from "../../../lib/rateLimit"; // 👈 أضف هذا السطر

export async function GET(req: Request) {
  // 👇 أضف Rate Limiting هنا
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimitResult = rateLimit(ip, 20, 60000); // 20 requests per minute

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
  // 👆 نهاية Rate Limiting

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  if (!q) return NextResponse.json({ items: [] })

  const token = process.env.GITHUB_TOKEN

  console.log("🔍 Searching for:", q, "Token exists:", !!token)

  try {
    // 1. البحث في GitHub Code
    const res = await fetch(
      `https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=70`,
      {
        headers: {
          ...(token && { Authorization: `token ${token}` }),
          "Accept": "application/vnd.github.v3.text-match+json",
          "User-Agent": "GitGrep-App",
        },
      }
    )

    if (!res.ok) {
      const errorData = await res.json()
      console.error("❌ GitHub API Error:", errorData)
      
      return NextResponse.json(getMockData(q))
    }

    const data = await res.json()
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ items: [], total_count: 0 })
    }

    console.log(`📦 Enriching ${data.items.length} repositories...`)
    
    const enrichedItems = await Promise.all(
      data.items.map(async (item: any) => {
        try {
          const repoUrl = item.repository.url
          const repoRes = await fetch(repoUrl, {
            headers: {
              ...(token && { Authorization: `token ${token}` }),
              "User-Agent": "GitGrep-App",
            },
          })
          
          if (repoRes.ok) {
            const repoData = await repoRes.json()
            return {
              ...item,
              repository: {
                ...item.repository,
                stargazers_count: repoData.stargazers_count || 0,
                language: repoData.language || "Unknown",
                updated_at: repoData.updated_at,
                description: repoData.description || "",
              },
            }
          }
        } catch (err) {
          console.error("Error fetching repo details:", err)
        }
        
        return {
          ...item,
          repository: {
            ...item.repository,
            stargazers_count: 0,
            language: item.repository.language || "Unknown",
            updated_at: new Date().toISOString(),
          },
        }
      })
    )

    console.log(`✅ Found ${enrichedItems.length} results with stars data`)
    
    return NextResponse.json({
      items: enrichedItems,
      total_count: data.total_count,
    })

  } catch (error: any) {
    console.error("❌ Search API Crash:", error)
    
    return NextResponse.json(getMockData(q))
  }
}

// بيانات تجريبية للاختبار
function getMockData(query: string) {
  const mockItems = [
    {
      html_url: "https://github.com/facebook/react/blob/main/packages/react/src/React.js",
      repository: {
        full_name: "facebook/react",
        stargazers_count: 218000,
        language: "JavaScript",
        updated_at: "2024-03-15",
        description: "The library for web and native user interfaces"
      },
      path: "packages/react/src/React.js",
      text_matches: [
        { fragment: "const [state, setState] = useState(initialState)" }
      ]
    },
    {
      html_url: "https://github.com/vercel/next.js/blob/main/packages/next/client/index.tsx",
      repository: {
        full_name: "vercel/next.js",
        stargazers_count: 120000,
        language: "TypeScript",
        updated_at: "2024-03-14",
        description: "The React Framework"
      },
      path: "packages/next/client/index.tsx",
      text_matches: [
        { fragment: "const [router, setRouter] = useState(null)" }
      ]
    },
    {
      html_url: "https://github.com/neroneroffy/react-music-player/blob/main/src/components/Player.js",
      repository: {
        full_name: "neroneroffy/react-music-player",
        stargazers_count: 456,
        language: "JavaScript",
        updated_at: "2024-01-15",
        description: "A beautiful music player built with React"
      },
      path: "src/components/Player.js",
      text_matches: [
        { fragment: "const [lyric, setLyric] = useState('')\nconst [tlyric, setTlyric] = useState('')\nconst [lyricLoading, setLyricLoading] = useState(false)" }
      ]
    },
    {
      html_url: "https://github.com/tailwindlabs/tailwindcss/blob/main/src/index.js",
      repository: {
        full_name: "tailwindlabs/tailwindcss",
        stargazers_count: 78000,
        language: "JavaScript",
        updated_at: "2024-03-10",
        description: "A utility-first CSS framework"
      },
      path: "src/index.js",
      text_matches: [
        { fragment: "const [config, setConfig] = useState(defaultConfig)" }
      ]
    }
  ];
  
  const filtered = mockItems.filter(item => 
    item.repository.full_name.toLowerCase().includes(query.toLowerCase()) ||
    item.path.toLowerCase().includes(query.toLowerCase())
  );
  
  return {
    items: filtered.length > 0 ? filtered : mockItems,
    total_count: filtered.length > 0 ? filtered.length : mockItems.length,
  };
}