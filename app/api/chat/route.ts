import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question, repo, context } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // الكشف عن اللغة
    const isArabic = /[\u0600-\u06FF]/.test(question);
    
    let answer = '';

    // حالة 1: لو فيه نتائج بحث (context) - يحللها
    if (context && context.length > 0) {
      const lines = context.split('\n').filter((l: string) => l.trim().length > 0);
      const codeSnippets = lines.slice(0, 10).map((line: string) => `• ${line.substring(0, 200)}`).join('\n');
      
      // تحليل مخصص حسب السؤال
      const lowerQuestion = question.toLowerCase();
      
      if (lowerQuestion.includes('api') || lowerQuestion.includes('endpoint')) {
        answer = isArabic ? `
🔍 **تحليل الـ API Endpoints من نتائج البحث:**

**الكود الموجود:**
${codeSnippets}

**الملاحظات:**
• تم العثور على ${lines.length} سطر من الكود المتعلق بـ API endpoints
• الأنماط المكتشفة: ${lowerQuestion.includes('asp.net') ? 'ASP.NET Core' : lowerQuestion.includes('rest') ? 'RESTful' : 'HTTP endpoints'}

**التوصيات:**
• تأكد من توثيق الـ endpoints باستخدام Swagger/OpenAPI
• استخدم validation middleware للمدخلات
• طبق rate limiting لحماية الـ API
` : `
🔍 **API Endpoints Analysis from search results:**

**Code found:**
${codeSnippets}

**Observations:**
• Found ${lines.length} lines of code related to API endpoints
• Detected patterns: ${lowerQuestion.includes('asp.net') ? 'ASP.NET Core' : lowerQuestion.includes('rest') ? 'RESTful' : 'HTTP endpoints'}

**Recommendations:**
• Document endpoints using Swagger/OpenAPI
• Use validation middleware for inputs
• Implement rate limiting for API protection
`;
      } 
      else if (lowerQuestion.includes('security') || lowerQuestion.includes('vulnerability')) {
        answer = isArabic ? `
🔒 **تحليل الأمان من نتائج البحث:**

**الكود الموجود:**
${codeSnippets}

**المخاطر المحتملة:**
• تأكد من عدم وجود hardcoded secrets
• تحقق من input validation
• استخدم parameterized queries لمنع SQL injection

**نصائح:**
• استخدم environment variables للأسرار
• طبق CSP (Content Security Policy)
• حدث dependencies بانتظام
` : `
🔒 **Security Analysis from search results:**

**Code found:**
${codeSnippets}

**Potential risks:**
• Check for hardcoded secrets
• Verify input validation
• Use parameterized queries to prevent SQL injection

**Tips:**
• Use environment variables for secrets
• Implement CSP (Content Security Policy)
• Regularly update dependencies
`;
      }
      else {
        answer = isArabic ? `
🔍 **تحليل الكود من نتائج البحث:**

**الكود الموجود:**
${codeSnippets}

**الملخص:**
• تم العثور على ${lines.length} سطر من الكود
• ${lines.length > 0 ? 'يظهر أن الكود يتعلق بـ ' + (lowerQuestion.includes('api') ? 'API endpoints' : lowerQuestion.includes('auth') ? 'authentication' : 'تطوير عام') : 'لا يوجد كود كافٍ للتحليل'}

**ماذا تريد أن تعرف بالضبط؟**
• أنماط الكود (Code patterns)
• مشاكل أمان (Security issues)
• أداء (Performance)
• أفضل الممارسات (Best practices)

اكتب سؤالك بشكل أكثر تحديداً للحصول على تحليل أدق.
` : `
🔍 **Code Analysis from search results:**

**Code found:**
${codeSnippets}

**Summary:**
• Found ${lines.length} lines of code
• ${lines.length > 0 ? 'Code appears to be related to ' + (lowerQuestion.includes('api') ? 'API endpoints' : lowerQuestion.includes('auth') ? 'authentication' : 'general development') : 'Not enough code to analyze'}

**What would you like to know?**
• Code patterns
• Security issues
• Performance
• Best practices

Be more specific in your question for a detailed analysis.
`;
      }
    }
    // حالة 2: لو مفيش نتائج بحث، يحاول يجيب repo من الاسم
    else {
      // استخراج اسم المستودع من السؤال
      const repoMatch = question.match(/([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)/);
      let repoName = repo || (repoMatch ? repoMatch[1] : null);
      
      if (repoName && repoName.includes('/')) {
        try {
          const [owner, name] = repoName.split('/');
          const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            },
          });
          
          if (res.ok) {
            const repoData = await res.json();
            const lastUpdate = new Date(repoData.updated_at);
            const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
            
            answer = isArabic ? `
📦 **تحليل المستودع: ${repoData.full_name}**

**الإحصائيات:**
• ⭐ ${repoData.stargazers_count.toLocaleString()} نجوم
• 🍴 ${repoData.forks_count.toLocaleString()} forks
• 🐛 ${repoData.open_issues_count.toLocaleString()} مشاكل مفتوحة
• 📅 آخر تحديث: ${lastUpdate.toLocaleDateString()} (منذ ${daysSinceUpdate} يوم)
• 🔧 اللغة: ${repoData.language || 'غير محدد'}

**الوصف:**
${repoData.description || 'لا يوجد وصف'}

**حالة المشروع:** ${daysSinceUpdate < 30 ? '✅ نشط' : daysSinceUpdate < 90 ? '⚠️ نشاط متوسط' : '🔴 غير نشط'}

**لتحليل أعمق:**
1. ابحث عن الكود داخل هذا المستودع باستخدام شريط البحث
2. اسألني عن حاجة محددة مثل "حلل الـ API endpoints في هذا المستودع"
` : `
📦 **Repository Analysis: ${repoData.full_name}**

**Stats:**
• ⭐ ${repoData.stargazers_count.toLocaleString()} stars
• 🍴 ${repoData.forks_count.toLocaleString()} forks
• 🐛 ${repoData.open_issues_count.toLocaleString()} open issues
• 📅 Last updated: ${lastUpdate.toLocaleDateString()} (${daysSinceUpdate} days ago)
• 🔧 Language: ${repoData.language || 'Unknown'}

**Description:**
${repoData.description || 'No description'}

**Project Health:** ${daysSinceUpdate < 30 ? '✅ Active' : daysSinceUpdate < 90 ? '⚠️ Moderate' : '🔴 Inactive'}

**For deeper analysis:**
1. Search for code inside this repository using the search bar
2. Ask me something specific like "analyze the API endpoints in this repo"
`;
          } else {
            throw new Error('Repo not found');
          }
        } catch (err) {
          answer = isArabic ? `
🔍 **لم أجد المستودع "${repoName}"**

**للحصول على تحليل:**
• تأكد من صحة الاسم (مثال: \`vercel/next.js\`)
• ابحث عن الكود أولاً باستخدام شريط البحث
• ثم اسألني عن تحليل النتائج
` : `
🔍 **Repository "${repoName}" not found**

**To get analysis:**
• Verify the repository name (example: \`vercel/next.js\`)
• First search for code using the search bar
• Then ask me to analyze the results
`;
        }
      } else {
        answer = isArabic ? `
🔍 **لا يوجد كود لتحليله**

**لتحصل على تحليل:**
1. ابحث عن كود باستخدام شريط البحث
2. اسألني عن تحليل النتائج
3. أو اكتب اسم مستودع مثل \`vercel/next.js\` في سؤالك

**مثال:** "حلل لي الكود اللي طلع من البحث عن api endpoints"
` : `
🔍 **No code to analyze**

**To get analysis:**
1. Search for code using the search bar
2. Ask me to analyze the results
3. Or mention a repository name like \`vercel/next.js\` in your question

**Example:** "Analyze the code from searching for api endpoints"
`;
      }
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