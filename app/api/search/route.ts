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

    // ✅ البحث المباشر عن الكود بدون تعقيد الفلاتر لضمان وصول النتائج
    const searchQuery = query;
    
    // استخدام search/code للبحث عن الكود مباشرة
    const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${per_page}`;
    
    console.log('🔍 GitHub Search URL:', searchUrl);

    const res = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3.text-match+json', // 👈 جلب مقاطع الكود مباشرة
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
      console.log('No results found for query:', searchQuery);
      return NextResponse.json({ items: [], total_count: 0 });
    }
    
    // تنسيق النتائج لتتوافق مع الواجهة الأمامية
    const formattedItems = data.items.map((file: any) => ({
      name: file.name,
      path: file.path,
      html_url: file.html_url,
      repository: {
        full_name: file.repository?.full_name || '',
        stargazers_count: file.repository?.stargazers_count || 0,
        forks_count: file.repository?.forks_count || 0,
        description: file.repository?.description || '',
        language: file.repository?.language || '',
        updated_at: file.repository?.updated_at || '',
      },
      text_matches: file.text_matches?.map((m: any) => ({
        fragment: m.fragment || '',
      })) || [],
      score: file.score || 0
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