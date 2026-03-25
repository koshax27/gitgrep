// app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get('q');
    const per_page = parseInt(searchParams.get('per_page') || '70');
    const language = searchParams.get('language') || '';

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // بناء query متقدم للبحث في الكود فقط مع دعم فلتر اللغة
    let searchQuery = `${query} in:file`;
    
    // إضافة فلتر اللغة على مستوى GitHub API إذا كانت محددة
    if (language && language !== '') {
      const languageExtensions: Record<string, string> = {
        'JavaScript': 'js jsx mjs',
        'TypeScript': 'ts tsx',
        'Python': 'py',
        'Java': 'java',
        'Go': 'go',
        'Rust': 'rs',
        'C++': 'cpp cxx hpp',
        'C': 'c h',
        'C#': 'cs',
        'PHP': 'php',
        'Ruby': 'rb',
        'Swift': 'swift',
        'Kotlin': 'kt'
      };
      
      const exts = languageExtensions[language];
      if (exts) {
        const extFilter = exts.split(' ').map(ext => `extension:${ext}`).join(' OR ');
        searchQuery = `${searchQuery} (${extFilter})`;
      }
    } else {
      // كل اللغات الشائعة
      const allExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'cs', 'php', 'rb', 'swift', 'kt'];
      const extFilter = allExtensions.map(ext => `extension:${ext}`).join(' OR ');
      searchQuery = `${searchQuery} (${extFilter})`;
    }
    
    console.log('🔍 GitHub Search Query:', searchQuery);
    
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('GITHUB_TOKEN is missing');
      return NextResponse.json({ error: 'GitHub token not configured', items: [], total_count: 0 }, { status: 200 });
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
      return NextResponse.json({ 
        error: `GitHub API error: ${response.status}`,
        items: [],
        total_count: 0
      }, { status: 200 });
    }

    const data = await response.json();
    
    // خريطة اللغات من الامتدادات
    const languageMap: Record<string, string> = {
      js: 'JavaScript', jsx: 'JavaScript', mjs: 'JavaScript',
      ts: 'TypeScript', tsx: 'TypeScript',
      py: 'Python', pyw: 'Python',
      java: 'Java',
      go: 'Go',
      rs: 'Rust',
      cpp: 'C++', cxx: 'C++', hpp: 'C++', cc: 'C++',
      c: 'C', h: 'C',
      cs: 'C#',
      php: 'PHP',
      rb: 'Ruby', rbw: 'Ruby',
      swift: 'Swift',
      kt: 'Kotlin', kts: 'Kotlin'
    };
    
    // معالجة النتائج وإضافة code_snippet و detected_language
    const itemsWithCode = (data.items || []).map((item: any) => {
      const textMatches = item.text_matches || [];
      const codeSnippet = textMatches.map((match: any) => match.fragment).join('\n');
      
      const fileExtension = item.path?.split('.').pop()?.toLowerCase() || '';
      const detectedLanguage = languageMap[fileExtension] || 'Unknown';
      
      // استخراج معلومات الـ repository
      const repoFullName = item.repository?.full_name || '';
      const repoStars = item.repository?.stargazers_count || 0;
      const repoForks = item.repository?.forks_count || 0;
      
      return {
        ...item,
        code_snippet: codeSnippet || 'No code snippet available',
        detected_language: detectedLanguage,
        file_extension: fileExtension,
        text_matches: textMatches,
        repository_info: {
          full_name: repoFullName,
          stargazers_count: repoStars,
          forks_count: repoForks
        }
      };
    });
    
    // فلترة إضافية للنتائج التي لا تحتوي على كود حقيقي
    const filteredItems = itemsWithCode.filter((item: any) => {
      const snippet = item.code_snippet || '';
      // تأكد إن فيه كود حقيقي مش مجرد وصف
      const hasRealCode = snippet.length > 20 && (
        snippet.includes('{') || 
        snippet.includes('}') ||
        snippet.includes('function') || 
        snippet.includes('=>') ||
        snippet.includes('import') ||
        snippet.includes('const') ||
        snippet.includes('let') ||
        snippet.includes('var') ||
        snippet.includes('return')
      );
      return hasRealCode || item.detected_language !== 'Unknown';
    });

    return NextResponse.json({
      total_count: data.total_count || 0,
      items: filteredItems,
      original_count: data.items?.length || 0,
      filtered_count: filteredItems.length
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search', items: [], total_count: 0 },
      { status: 200 }
    );
  }
}