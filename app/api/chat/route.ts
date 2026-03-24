import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question, repo, context } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // جلب معلومات الـ repo
    let repoData = null;
    if (repo && repo.includes('/')) {
      try {
        const [owner, name] = repo.split('/');
        const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
        });
        if (res.ok) repoData = await res.json();
      } catch (err) {
        console.error('GitHub API error:', err);
      }
    }

    // تحليل السياق
    let contextAnalysis = '';
    if (context && context.length > 0) {
      const lines = context.split('\n').filter((l: string) => l.trim().length > 0);
      contextAnalysis = lines.slice(0, 10).map((line: string) => `• ${line.substring(0, 150)}`).join('\n');
    }

    // الكشف عن اللغة
    const isArabic = /[\u0600-\u06FF]/.test(question);
    
    // بناء إجابة تحليلية بدون API خارجي (fallback)
    let answer = '';
    
    if (repoData) {
      // تحليل حقيقي من بيانات GitHub
      const lastUpdate = new Date(repoData.updated_at);
      const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      answer = isArabic ? `
🔍 **تحليل المستودع: ${repoData.full_name}**

**الإحصائيات:**
• ⭐ ${repoData.stargazers_count.toLocaleString()} نجوم
• 🍴 ${repoData.forks_count.toLocaleString()} forks
• 🐛 ${repoData.open_issues_count.toLocaleString()} مشاكل مفتوحة
• 📅 آخر تحديث: ${lastUpdate.toLocaleDateString()} (منذ ${daysSinceUpdate} يوم)
• 🔧 اللغة الأساسية: ${repoData.language || 'غير محدد'}

**حالة المشروع:**
${daysSinceUpdate < 30 ? '✅ نشط - تحديثات مستمرة' : daysSinceUpdate < 90 ? '⚠️ نشاط متوسط' : '🔴 غير نشط - آخر تحديث منذ فترة'}

**عن سؤالك: "${question}"**

${repoData.description ? `الوصف: ${repoData.description.substring(0, 200)}` : ''}

${contextAnalysis ? `\n**من الكود الموجود:**\n${contextAnalysis}\n` : ''}

**اقتراحات:**
${repoData.open_issues_count > 50 ? '• يوجد عدد كبير من المشاكل المفتوحة، قد يحتاج المشروع لمساهمين' : '• المشاكل تحت السيطرة، المشروع في حالة جيدة'}
• يمكنك مراجعة ملف README لمزيد من التفاصيل
• ابحث عن issues مفتوحة للمساهمة إذا كنت مهتماً
` : `
🔍 **Repository Analysis: ${repoData.full_name}**

**Stats:**
• ⭐ ${repoData.stargazers_count.toLocaleString()} stars
• 🍴 ${repoData.forks_count.toLocaleString()} forks
• 🐛 ${repoData.open_issues_count.toLocaleString()} open issues
• 📅 Last updated: ${lastUpdate.toLocaleDateString()} (${daysSinceUpdate} days ago)
• 🔧 Main language: ${repoData.language || 'Unknown'}

**Project Health:**
${daysSinceUpdate < 30 ? '✅ Active - Regular updates' : daysSinceUpdate < 90 ? '⚠️ Moderate activity' : '🔴 Inactive - No recent updates'}

**About your question: "${question}"**

${repoData.description ? `Description: ${repoData.description.substring(0, 200)}` : ''}

${contextAnalysis ? `\n**From the code:**\n${contextAnalysis}\n` : ''}

**Suggestions:**
${repoData.open_issues_count > 50 ? '• High number of open issues, may need contributors' : '• Issues are manageable, project looks healthy'}
• Check the README for more details
• Look at open issues if you want to contribute
`;
    } else {
      // بدون بيانات repo
      answer = isArabic ? `
🔍 **تحليل بناءً على البحث**

**سؤالك:** "${question}"

**الكود الموجود:**
${contextAnalysis || 'لا يوجد كود محدد للتحليل'}

**ملاحظات:**
• حاول البحث عن مستودع محدد للحصول على تحليل أدق
• استخدم صيغة "owner/repo" مثل "vercel/next.js"
• يمكنني مساعدتك في تحليل أنماط الكود، الأمان، والأداء

**نصيحة:** ابحث عن مستودع معين للحصول على إحصائيات حقيقية وتحليل مفصل.
` : `
🔍 **Analysis based on search results**

**Your question:** "${question}"

**Code found:**
${contextAnalysis || 'No specific code to analyze'}

**Notes:**
• Try searching for a specific repository for more accurate analysis
• Use format "owner/repo" like "vercel/next.js"
• I can help with code patterns, security, and performance analysis

**Tip:** Search for a specific repository to get real stats and detailed analysis.
`;
    }

    return NextResponse.json({ answer });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { answer: 'Sorry, I couldn\'t analyze the code. Please try again.' },
      { status: 500 }
    );
  }
}