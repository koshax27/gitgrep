// app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get('q');
    const per_page = parseInt(searchParams.get('per_page') || '30');

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('GITHUB_TOKEN is missing');
      return NextResponse.json({ error: 'GitHub token not configured', items: [], total_count: 0 }, { status: 500 });
    }
    
    // ✅ البحث في repositories أولاً
    const reposRes = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${per_page}&sort=stars&order=desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!reposRes.ok) {
      const errorText = await reposRes.text();
      console.error('GitHub API error:', reposRes.status, errorText);
      return NextResponse.json({ items: [], total_count: 0 }, { status: 200 });
    }

    const reposData = await reposRes.json();
    
    // ✅ لكل repo، جيب أول ملف كود فيه
    const itemsWithCode = [];
    
    for (const repo of (reposData.items || [])) {
      try {
        // جيب محتويات الـ repo
        const contentsRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/contents?ref=${repo.default_branch}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (contentsRes.ok) {
          const contents = await contentsRes.json();
          // لاقي أول ملف كود (js, ts, py, etc.)
          const codeFile = contents.find((f: any) => 
            f.name.match(/\.(js|ts|jsx|tsx|py|go|rs|java|cpp|c|cs|php|rb)$/i)
          );
          
          if (codeFile) {
            // جيب محتوى الملف
            const fileRes = await fetch(codeFile.download_url);
            if (fileRes.ok) {
              const fileContent = await fileRes.text();
              itemsWithCode.push({
                name: codeFile.name,
                path: codeFile.path,
                html_url: codeFile.html_url,
                code_snippet: fileContent.substring(0, 500),
                detected_language: codeFile.name.split('.').pop(),
                repository_info: {
                  full_name: repo.full_name,
                  stargazers_count: repo.stargazers_count,
                  forks_count: repo.forks_count,
                  description: repo.description,
                  language: repo.language,
                  updated_at: repo.updated_at
                }
              });
            }
          }
        }
        
        // خد بالك من rate limit (كل repo بيعمل 3-4 requests)
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`Error fetching code for ${repo.full_name}:`, err);
      }
    }

    return NextResponse.json({
      total_count: reposData.total_count || 0,
      items: itemsWithCode,
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ items: [], total_count: 0 }, { status: 200 });
  }
}