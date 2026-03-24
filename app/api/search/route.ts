// app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let query = searchParams.get('q');
  const per_page = parseInt(searchParams.get('per_page') || '30');
  const language = searchParams.get('language') || '';

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // ✅ البحث في ملفات الكود فقط (مش README, LICENSE, docs)
    // in:file = في الملفات فقط
    // extension: = امتدادات الكود فقط
    
    let searchQuery = `${query} in:file`;
    
    // امتدادات الكود الحقيقية (مش وصف ولا رخص)
    const codeExtensions = [
      'js', 'ts', 'jsx', 'tsx',           // JavaScript/TypeScript
      'py',                                // Python
      'go',                                // Go
      'rs',                                // Rust
      'java',                              // Java
      'c', 'cpp', 'h', 'hpp',              // C/C++
      'cs',                                // C#
      'php',                               // PHP
      'rb',                                // Ruby
      'swift', 'kt',                       // Swift/Kotlin
      'sql',                               // SQL
      'sh', 'bash',                        // Shell
      'yml', 'yaml', 'json', 'xml'         // Config (كمان دي أحياناً فيها كود)
    ];
    
    // فلترة بالامتدادات عشان نجيب ملفات الكود بس
    const extensionFilter = codeExtensions.map(ext => `extension:${ext}`).join(' OR ');
    searchQuery += ` (${extensionFilter})`;
    
    // لو المستخدم اختار لغة معينة
    if (language && codeExtensions.includes(language)) {
      searchQuery = `${query} in:file extension:${language}`;
    }
    
    console.log('🔍 GitHub Search Query:', searchQuery);
    
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
    
    // ✅ فلتر إضافي: نشيل النتائج اللي فيها كلمات تدل على وصف مش كود
    const nonCodeKeywords = [
      'license', 'readme', 'contributing', 'changelog', 
      'authors', 'code of conduct', 'security policy',
      'GNU General Public License', 'MIT License', 'Apache License'
    ];
    
    const filteredItems = (data.items || []).filter((item: any) => {
      const path = item.path?.toLowerCase() || '';
      // نشيل أي ملف اسمه README, LICENSE, CONTRIBUTING, إلخ
      if (path.includes('readme') || path.includes('license') || 
          path.includes('contributing') || path.includes('changelog')) {
        return false;
      }
      return true;
    });
    
    // استخراج الـ code snippets من text_matches
    const itemsWithCode = filteredItems.map((item: any) => {
      const textMatches = item.text_matches || [];
      const codeSnippet = textMatches.map((match: any) => match.fragment).join('\n');
      
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
      filtered_count: itemsWithCode.length,
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