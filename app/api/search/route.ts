// app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let query = searchParams.get('q');
  const per_page = parseInt(searchParams.get('per_page') || '30');
  const language = searchParams.get('language') || ''; // اختياري: لغة معينة

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // بناء query متقدم للبحث في الكود فقط
    // in:file = بحث في محتوى الملفات فقط (مش README أو وصف)
    // in:file هي المفتاح السحري عشان يجيب كود حقيقي
    
    let searchQuery = `${query} in:file`;
    
    // إضافة فلتر اللغة لو موجود
    if (language) {
      searchQuery += ` language:${language}`;
    } else {
      // لو مفيش لغة محددة، نجيب كل اللغات الشائعة عشان نتائج أكتر
      searchQuery += ` language:javascript OR language:typescript OR language:python OR language:java OR language:go OR language:rust OR language:php OR language:ruby OR language:csharp OR language:cpp`;
    }
    
    console.log('🔍 GitHub Search Query:', searchQuery);
    
    // GitHub Code Search مع text-match
    const response = await fetch(
      `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3.text-match+json',
        },
      }
    );

    if (!response.ok) {
      console.error('GitHub API error:', response.status);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    // استخراج الـ code snippets من text_matches
    const itemsWithCode = (data.items || []).map((item: any) => {
      const textMatches = item.text_matches || [];
      // جلب كل الـ code snippets من الملف
      const codeSnippet = textMatches.map((match: any) => match.fragment).join('\n');
      
      // استخراج لغة الملف من الاسم
      const fileExtension = item.path?.split('.').pop() || '';
      const languageMap: Record<string, string> = {
        js: 'JavaScript', ts: 'TypeScript', jsx: 'React JSX', tsx: 'React TSX',
        py: 'Python', java: 'Java', go: 'Go', rs: 'Rust', php: 'PHP',
        rb: 'Ruby', cs: 'C#', cpp: 'C++', c: 'C', swift: 'Swift', kt: 'Kotlin'
      };
      const detectedLanguage = languageMap[fileExtension] || 'Unknown';
      
      return {
        ...item,
        code_snippet: codeSnippet || 'No code snippet available',
        detected_language: detectedLanguage,
        file_extension: fileExtension,
        text_matches: textMatches,
      };
    });

    return NextResponse.json({
      total_count: data.total_count,
      items: itemsWithCode,
      search_query_used: searchQuery,
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search', items: [], total_count: 0 },
      { status: 500 }
    );
  }
}