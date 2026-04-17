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

    // ✅ طريقة صحيحة للبحث في عدة لغات باستخدام OR
    const languages = ['javascript', 'typescript', 'python', 'go', 'rust', 'java', 'cpp', 'csharp', 'php', 'ruby', 'swift', 'kotlin'];
    const languageFilter = languages.map(lang => `language:${lang}`).join(' OR ');
    const searchQuery = `${query} (${languageFilter})`;
    
    const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${per_page}`;
    
    console.log('🔍 GitHub Search URL:', searchUrl);

    const res = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('GitHub API error:', res.status, errorText);
      return NextResponse.json({ items: [], total_count: 0 }, { status: res.status });
    }

    const data = await res.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('No results found for query:', searchQuery);
      return NextResponse.json({ items: [], total_count: 0 });
    }
    
    // جلب محتوى الملفات
    const languageMap: Record<string, string> = {
      js: 'JavaScript', jsx: 'JavaScript', mjs: 'JavaScript',
      ts: 'TypeScript', tsx: 'TypeScript',
      py: 'Python', pyw: 'Python',
      go: 'Go',
      rs: 'Rust',
      java: 'Java',
      cpp: 'C++', cxx: 'C++', hpp: 'C++',
      c: 'C',
      cs: 'C#',
      php: 'PHP',
      rb: 'Ruby', rbw: 'Ruby',
      swift: 'Swift',
      kt: 'Kotlin', kts: 'Kotlin'
    };

    const itemsWithCode = await Promise.all(
      data.items.slice(0, per_page).map(async (file: any) => {
        try {
          const fileRes = await fetch(file.url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!fileRes.ok) return null;
          
          const fileData = await fileRes.json();
          
          let decodedContent = '';
          if (fileData.content) {
            decodedContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
          }
          
          const extension = file.name.split('.').pop()?.toLowerCase() || '';

          return {
            name: file.name,
            path: file.path,
            html_url: file.html_url,
            code_snippet: decodedContent.substring(0, 600),
            detected_language: languageMap[extension] || 'Unknown',
            file_extension: extension,
            repository_info: {
              full_name: file.repository?.full_name || '',
              stargazers_count: file.repository?.stargazers_count || 0,
              forks_count: file.repository?.forks_count || 0,
              description: file.repository?.description || '',
              language: file.repository?.language || ''
            }
          };
        } catch (err) {
          console.error(`Error fetching file ${file.path}:`, err);
          return null;
        }
      })
    );

    const validItems = itemsWithCode.filter(Boolean);

    return NextResponse.json({
      total_count: data.total_count || 0,
      items: validItems,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ items: [], total_count: 0 }, { status: 500 });
  }
}