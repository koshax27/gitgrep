// app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const per_page = parseInt(searchParams.get('per_page') || '30');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // GitHub Code Search مع text-match
    const response = await fetch(
      `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3.text-match+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    // استخراج الـ code snippets من text_matches
    const itemsWithCode = (data.items || []).map((item: any) => {
      const textMatches = item.text_matches || [];
      const codeSnippet = textMatches.map((match: any) => match.fragment).join('\n');
      
      return {
        ...item,
        code_snippet: codeSnippet || 'No code snippet available',
        text_matches: textMatches,
      };
    });

    return NextResponse.json({
      total_count: data.total_count,
      items: itemsWithCode,
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search', items: [] },
      { status: 500 }
    );
  }
}