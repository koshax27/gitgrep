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

    // ✅ البحث في الكود (code) مش repositories
    const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(query)}+in:file&per_page=${per_page}`;
    
    console.log('🔍 GitHub Search URL:', searchUrl);

    const res = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3.text-match+json',
        'User-Agent': 'GitGrep-App'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('GitHub API error:', res.status, errorText);
      return NextResponse.json({ items: [], total_count: 0 }, { status: res.status });
    }

    const data = await res.json();
    
    // تنسيق النتائج
    const itemsWithCode = (data.items || []).map((item: any) => {
      const textMatches = item.text_matches || [];
      const codeSnippet = textMatches.map((match: any) => match.fragment).join('\n');
      
      return {
        name: item.name,
        path: item.path,
        html_url: item.html_url,
        code_snippet: codeSnippet || '// No code snippet available',
        detected_language: item.repository?.language || 'Unknown',
        repository_info: {
          full_name: item.repository?.full_name || '',
          stargazers_count: item.repository?.stargazers_count || 0,
          forks_count: item.repository?.forks_count || 0,
          description: item.repository?.description || '',
          language: item.repository?.language || '',
          updated_at: item.repository?.updated_at || '',
        },
        text_matches: textMatches
      };
    });

    return NextResponse.json({
      total_count: data.total_count || 0,
      items: itemsWithCode,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ items: [], total_count: 0 }, { status: 500 });
  }
}