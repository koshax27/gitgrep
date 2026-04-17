import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get('q');
    const per_page = Math.min(parseInt(searchParams.get('per_page') || '30'), 30);

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('GITHUB_TOKEN is missing');
      return NextResponse.json({ error: 'GitHub token not configured', items: [], total_count: 0 }, { status: 500 });
    }

    // ✅ تغيير: بحث في repositories بدل code (أكثر استقراراً)
    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${per_page}&sort=stars&order=desc`;
    
    console.log('🔍 GitHub Search URL:', searchUrl);

    const res = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitGrep-App'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('GitHub API error:', res.status, errorText);
      return NextResponse.json({ 
        error: `GitHub API error: ${res.status}`, 
        details: errorText,
        items: [], 
        total_count: 0 
      }, { status: res.status });
    }

    const data = await res.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('No results found for query:', query);
      return NextResponse.json({ items: [], total_count: 0 });
    }
    
    // تنسيق النتائج
    const formattedItems = data.items.map((repo: any) => ({
      name: repo.name,
      path: repo.full_name,
      html_url: repo.html_url,
      code_snippet: repo.description || 'No description available',
      detected_language: repo.language || 'Unknown',
      repository_info: {
        full_name: repo.full_name,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        description: repo.description,
        language: repo.language,
        updated_at: repo.updated_at,
      },
      text_matches: []
    }));

    return NextResponse.json({
      total_count: data.total_count || 0,
      items: formattedItems,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ items: [], total_count: 0 }, { status: 500 });
  }
}