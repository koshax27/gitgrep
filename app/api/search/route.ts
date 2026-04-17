// app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get('q');
    const per_page = parseInt(searchParams.get('per_page') || '70');

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // ✅ البحث في الكود فقط (مش README أو وصف)
    // in:file = بس في الملفات
    // NOT README = استبعاد ملفات README
    let searchQuery = `${query} in:file NOT README.md NOT CONTRIBUTING.md NOT LICENSE`;
    
    // ✅ إضافة امتدادات الكود الحقيقية
    const extensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'swift', 'kt'];
    const extFilter = extensions.map(ext => `extension:${ext}`).join(' OR ');
    searchQuery = `${searchQuery} (${extFilter})`;
    
    console.log('🔍 GitHub Search Query:', searchQuery);
    
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('GITHUB_TOKEN is missing');
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      return NextResponse.json({ items: [], total_count: 0 }, { status: 200 });
    }

    const data = await response.json();
    
    // ✅ فلترة إضافية: استبعاد النتائج اللي فيها كلمات تدل على وصف
    const itemsWithCode = (data.items || [])
      .filter((item: any) => {
        const path = item.path?.toLowerCase() || '';
        // استبعاد ملفات README, CONTRIBUTING, LICENSE, docs, etc.
        if (path.includes('readme') || path.includes('contributing') || path.includes('license') || path.includes('.md')) {
          return false;
        }
        return true;
      })
      .map((item: any) => {
        const textMatches = item.text_matches || [];
        // خد أول 500 حرف من الكود
        const codeSnippet = textMatches.map((match: any) => match.fragment).join('\n').substring(0, 500);
        
        const fileExtension = item.path?.split('.').pop() || '';
        const languageMap: Record<string, string> = {
          js: 'JavaScript', ts: 'TypeScript', jsx: 'JavaScript', tsx: 'TypeScript',
          py: 'Python', go: 'Go', rs: 'Rust', java: 'Java',
          cpp: 'C++', c: 'C', cs: 'C#', php: 'PHP', rb: 'Ruby',
          swift: 'Swift', kt: 'Kotlin'
        };
        
        return {
          ...item,
          code_snippet: codeSnippet || '// No code snippet available',
          detected_language: languageMap[fileExtension] || 'Unknown',
          file_extension: fileExtension,
          text_matches: textMatches,
          repository_info: {
            full_name: item.repository?.full_name || '',
            stargazers_count: item.repository?.stargazers_count || 0,
            forks_count: item.repository?.forks_count || 0
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