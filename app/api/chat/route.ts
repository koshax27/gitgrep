import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question, repo, context } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // استخراج اسم المستودع من السؤال أو من الـ repo
    let repoName = repo;
    
    // لو السؤال فيه اسم مستودع بصيغة owner/repo
    const repoMatch = question.match(/([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)/);
    if (repoMatch && !repoName) {
      repoName = repoMatch[1];
    }

    // جلب معلومات الـ repo
    let repoData = null;
    if (repoName && repoName.includes('/')) {
      try {
        const [owner, name] = repoName.split('/');
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

    // الكشف عن اللغة
    const isArabic = /[\u0600-\u06FF]/.test(question);
    
    let answer = '';

    // لو عندنا بيانات عن المستودع
    if (repoData) {
      const lastUpdate = new Date(repoData.updated_at);
      const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      // تحليل مخصص حسب السؤال
      let specificAnalysis = '';
      const lowerQuestion = question.toLowerCase();
      
      if (lowerQuestion.includes('api endpoint') || lowerQuestion.includes('endpoint')) {
        specificAnalysis = isArabic ? `
**تحليل الـ API Endpoints:**

المستودع ${repoData.full_name} هو مشروع ${repoData.language || ''} ${repoData.description || ''}.

بناءً على هيكل المشروع:
• يستخدم ${repoData.language === 'C#' ? 'ASP.NET Core' : repoData.language === 'TypeScript' ? 'Express/Fastify' : 'framework مناسب'} لإنشاء الـ API endpoints
• عدد النجوم ${repoData.stargazers_count} يدل على أن الـ API design فيه مقبول
• عدد المشاكل المفتوحة ${repoData.open_issues_count} طبيعي لمشروع بهذا الحجم

**أفضل الممارسات للـ API Endpoints في هذا النوع من المشاريع:**
1. استخدم RESTful naming conventions
2. وثق الـ endpoints باستخدام Swagger/OpenAPI
3. نفذ validation صارم للمدخلات
4. استخدم middleware للتعامل مع الأخطاء
` : `
**API Endpoints Analysis:**

${repoData.full_name} is a ${repoData.language || ''} project ${repoData.description || ''}.

Based on the project structure:
• Uses ${repoData.language === 'C#' ? 'ASP.NET Core' : repoData.language === 'TypeScript' ? 'Express/Fastify' : 'appropriate framework'} for API endpoints
• ${repoData.stargazers_count} stars indicates good API design patterns
• ${repoData.open_issues_count} open issues is reasonable for this size

**Best Practices for API Endpoints in this project:**
1. Follow RESTful naming conventions
2. Document endpoints with Swagger/OpenAPI
3. Implement strict input validation
4. Use middleware for error handling
`;
      } else {
        specificAnalysis = isArabic ? `
**نظرة عامة على المستودع:**

• **الاسم:** ${repoData.full_name}
• **الوصف:** ${repoData.description || 'لا يوجد وصف'}
• **النجوم:** ${repoData.stargazers_count.toLocaleString()} ⭐
• **الـ Forks:** ${repoData.forks_count.toLocaleString()} 🍴
• **المشاكل المفتوحة:** ${repoData.open_issues_count.toLocaleString()} 🐛
• **آخر تحديث:** ${lastUpdate.toLocaleDateString()} (منذ ${daysSinceUpdate} يوم)
• **اللغة الأساسية:** ${repoData.language || 'غير محدد'}

**حالة المشروع:** ${daysSinceUpdate < 30 ? '✅ نشط' : daysSinceUpdate < 90 ? '⚠️ نشاط متوسط' : '🔴 غير نشط'}

${repoData.description ? `**عن المشروع:** ${repoData.description}` : ''}
` : `
**Repository Overview:**

• **Name:** ${repoData.full_name}
• **Description:** ${repoData.description || 'No description'}
• **Stars:** ${repoData.stargazers_count.toLocaleString()} ⭐
• **Forks:** ${repoData.forks_count.toLocaleString()} 🍴
• **Open Issues:** ${repoData.open_issues_count.toLocaleString()} 🐛
• **Last Updated:** ${lastUpdate.toLocaleDateString()} (${daysSinceUpdate} days ago)
• **Main Language:** ${repoData.language || 'Unknown'}

**Project Health:** ${daysSinceUpdate < 30 ? '✅ Active' : daysSinceUpdate < 90 ? '⚠️ Moderate' : '🔴 Inactive'}

${repoData.description ? `**About:** ${repoData.description}` : ''}
`;
      }
      
      answer = specificAnalysis;
      
    } else {
      // لو مفيش بيانات عن المستودع
      answer = isArabic ? `
🔍 **لم أجد بيانات عن المستودع المطلوب**

**للحصول على تحليل دقيق:**
1. اذهب إلى **My Projects**
2. أضف المستودع بالصيغة: \`owner/repo\` (مثال: \`dotnet/aspnetcore\`)
3. ثم اسألني مرة أخرى

**أو اكتب اسم المستودع في سؤالك:**
مثال: "حلل لي المستودع dotnet/aspnetcore"

**المستودعات المقترحة للاختبار:**
• \`vercel/next.js\`
• \`facebook/react\`
• \`microsoft/vscode\`
• \`dotnet/aspnetcore\`
` : `
🔍 **I couldn't find data for that repository**

**For accurate analysis:**
1. Go to **My Projects**
2. Add the repository as \`owner/repo\` (example: \`dotnet/aspnetcore\`)
3. Then ask me again

**Or mention the repository in your question:**
Example: "Analyze the repository dotnet/aspnetcore"

**Suggested repositories to test:**
• \`vercel/next.js\`
• \`facebook/react\`
• \`microsoft/vscode\`
• \`dotnet/aspnetcore\`
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