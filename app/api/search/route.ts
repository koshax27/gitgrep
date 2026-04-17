import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const per_page = Math.min(parseInt(searchParams.get('per_page') || '10'), 15); // تقليل العدد للسرعة

    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 });

    const token = process.env.GITHUB_TOKEN;
    
    // 1. البحث المباشر في الكود أسرع بكتير وبيجيب نتائج أدق
    const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=${per_page}`;

    const res = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 } // عمل كاش للطلب لمدة ساعة
    });

    if (!res.ok) {
      return NextResponse.json({ items: [], total_count: 0 }, { status: res.status });
    }

    const data = await res.json();

    // 2. استخدام Promise.all لجلب محتوى الملفات بالتوازي
    const itemsWithCode = await Promise.all(
      data.items.map(async (file: any) => {
        try {
          const fileRes = await fetch(file.url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fileData = await fileRes.json();
          
          // محتوى الملف في جيت هاب بيبقى Base64
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8');

          return {
            name: file.name,
            path: file.path,
            html_url: file.html_url,
            code_snippet: content.substring(0, 600),
            repository: file.repository.full_name,
            stars: file.repository.stargazers_count
          };
        } catch (e) {
          return null;
        }
      })
    );

    return NextResponse.json({
      total_count: data.total_count,
      items: itemsWithCode.filter(Boolean), // تنظيف النتائج من الـ null
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}