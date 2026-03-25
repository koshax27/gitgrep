// app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get('q');
    const per_page = parseInt(searchParams.get('per_page') || '30');

    console.log('🔍 Search query:', query);
    console.log('🔍 GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // بحث بسيط
    let searchQuery = `${query} in:file`;
    
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('❌ GITHUB_TOKEN is missing');
      return NextResponse.json({ error: 'GitHub token not configured', items: [], total_count: 0 }, { status: 500 });
    }
    
    const response = await fetch(
      `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3.text-match+json',
        },
      }
    );

    console.log('🔍 GitHub API status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GitHub API error:', response.status, errorText);
      return NextResponse.json({ 
        error: `GitHub API error: ${response.status}`,
        items: [],
        total_count: 0
      }, { status: 200 });
    }

    const data = await response.json();
    
    const itemsWithCode = (data.items || []).map((item: any) => {
      const textMatches = item.text_matches || [];
      const codeSnippet = textMatches.map((match: any) => match.fragment).join('\n');
      
      return {
        ...item,
        code_snippet: codeSnippet || 'No code snippet available',
      };
    });

    return NextResponse.json({
      total_count: data.total_count || 0,
      items: itemsWithCode,
    });
    
  } catch (error) {
    console.error('❌ Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search', items: [], total_count: 0 },
      { status: 500 }
    );
  }
}