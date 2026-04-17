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
    
    // ✅ البحث في repositories بدل code
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${per_page}&sort=stars&order=desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      return NextResponse.json({ items: [], total_count: 0 }, { status: 200 });
    }

    const data = await response.json();
    
    // ✅ تحويل الـ repos إلى format يشبه نتائج code
    const itemsWithCode = (data.items || []).map((item: any) => {
      return {
        name: item.name,
        path: `${item.full_name}/README.md`,
        html_url: item.html_url,
        repository: item,
        code_snippet: item.description || 'No description available',
        detected_language: item.language || 'Unknown',
        file_extension: 'md',
        text_matches: [],
        repository_info: {
          full_name: item.full_name,
          stargazers_count: item.stargazers_count,
          forks_count: item.forks_count,
          description: item.description,
          language: item.language,
          updated_at: item.updated_at
        }
      };
    });

    return NextResponse.json({
      total_count: data.total_count || 0,
      items: itemsWithCode,
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ items: [], total_count: 0 }, { status: 200 });
  }
}