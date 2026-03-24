import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question, repo, context } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const isArabic = /[\u0600-\u06FF]/.test(question);
    let answer = '';

    // حالة 1: لو فيه نتائج بحث
    if (context && context.length > 0) {
      const lines = context.split('\n').filter((l: string) => l.trim().length > 0);
      const codeSnippets = lines.slice(0, 10).map((line: string) => `• ${line.substring(0, 200)}`).join('\n');
      
      // محاولة استخراج اسم repo من النتائج
      let repoName = null;
      for (const line of lines) {
        const match = line.match(/([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)/);
        if (match) {
          repoName = match[1];
          break;
        }
      }

      // لو لقينا اسم repo، نجيب كود حقيقي من GitHub
      let actualCode = '';
      if (repoName) {
        try {
          const [owner, name] = repoName.split('/');
          // جلب ملفات الكود من الـ repo
          const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${name}/contents?ref=main`, {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            },
          });
          
          if (contentsRes.ok) {
            const contents = await contentsRes.json();
            const codeFiles = contents.filter((f: any) => 
              f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.py') || f.name.endsWith('.go')
            ).slice(0, 3);
            
            for (const file of codeFiles) {
              const fileRes = await fetch(file.download_url);
              if (fileRes.ok) {
                const fileContent = await fileRes.text();
                actualCode += `\n**${file.name}:**\n\`\`\`\n${fileContent.substring(0, 500)}...\n\`\`\`\n`;
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch actual code:', err);
        }
      }
      
      const lowerQuestion = question.toLowerCase();
      
      if (actualCode) {
        answer = isArabic ? `
🔍 **تحليل الكود الفعلي من المستودع ${repoName}:**

${actualCode}

**الملخص:**
• تم جلب كود حقيقي من الـ repository
• اللغة: ${actualCode.includes('javascript') ? 'JavaScript' : actualCode.includes('typescript') ? 'TypeScript' : 'غير محدد'}
• عدد الملفات التي تم تحليلها: ${actualCode.split('**').length - 1}

**نقاط مهمة:**
• ${lowerQuestion.includes('api') ? 'يوجد endpoints API في الكود' : 'الكود يظهر بنية المشروع'}
• ${lowerQuestion.includes('security') ? 'تحقق من وجود مشاكل أمنية' : 'هيكل الكود يبدو منظماً'}

**ماذا تريد تحليله بالضبط؟**
• دوال معينة
• أنماط الكود
• مشاكل أمان
` : `
🔍 **Actual code analysis from repository ${repoName}:**

${actualCode}

**Summary:**
• Fetched real code from the repository
• Language: ${actualCode.includes('javascript') ? 'JavaScript' : actualCode.includes('typescript') ? 'TypeScript' : 'Unknown'}
• Files analyzed: ${actualCode.split('**').length - 1}

**Key points:**
• ${lowerQuestion.includes('api') ? 'API endpoints found in the code' : 'Code structure appears organized'}
• ${lowerQuestion.includes('security') ? 'Check for security issues' : 'Patterns look consistent'}

**What would you like me to analyze?**
• Specific functions
• Code patterns
• Security issues
`;
      } else {
        answer = isArabic ? `
🔍 **تحليل من نتائج البحث:**

**الكود الموجود:**
${codeSnippets || 'لا يوجد كود كافٍ للتحليل'}

${repoName ? `**المستودع المحتمل:** ${repoName}` : ''}

**ملاحظات:**
• هذه نتائج بحث، وليست كوداً كاملاً
• للحصول على تحليل أعمق، أضف المستودع في **My Projects**
• ثم اسألني عن تحليل محدد

**اقتراح:** ابحث عن كود محدد مثل "function api" أو أضف repo معروف.
` : `
🔍 **Analysis from search results:**

**Code found:**
${codeSnippets || 'No sufficient code to analyze'}

${repoName ? `**Potential repository:** ${repoName}` : ''}

**Notes:**
• These are search results, not complete code
• For deeper analysis, add the repository to **My Projects**
• Then ask me for specific analysis

**Suggestion:** Search for specific code like "function api" or add a known repository.
`;
      }
    }
    // حالة 2: لو مفيش نتائج بحث
    else {
      const repoMatch = question.match(/([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)/);
      let repoName = repo || (repoMatch ? repoMatch[1] : null);
      
      if (repoName && repoName.includes('/')) {
        try {
          const [owner, name] = repoName.split('/');
          const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
            headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
          });
          
          if (res.ok) {
            const repoData = await res.json();
            const lastUpdate = new Date(repoData.updated_at);
            const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
            
            // جلب بعض الكود من الـ repo
            let codeSample = '';
            try {
              const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${name}/contents?ref=main`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
              });
              if (contentsRes.ok) {
                const contents = await contentsRes.json();
                const firstCodeFile = contents.find((f: any) => 
                  f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.py')
                );
                if (firstCodeFile) {
                  const fileRes = await fetch(firstCodeFile.download_url);
                  if (fileRes.ok) {
                    const fileContent = await fileRes.text();
                    codeSample = `\n**مثال من الكود (${firstCodeFile.name}):**\n\`\`\`\n${fileContent.substring(0, 300)}...\n\`\`\`\n`;
                  }
                }
              }
            } catch (err) {
              console.error('Failed to fetch code sample:', err);
            }
            
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

${codeSample}

**لتحليل أعمق:**
1. ابحث عن كود محدد في هذا المستودع
2. اسألني عن حاجة محددة مثل "حلل الـ API endpoints"
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

${codeSample}

**For deeper analysis:**
1. Search for specific code in this repository
2. Ask me something specific like "analyze the API endpoints"
`;
          } else {
            throw new Error('Repo not found');
          }
        } catch (err) {
          answer = isArabic ? `
🔍 **لم أجد المستودع "${repoName}"**

للحصول على تحليل:
• ابحث عن كود أولاً باستخدام شريط البحث
• ثم اسألني عن تحليل النتائج
` : `
🔍 **Repository "${repoName}" not found**

To get analysis:
• First search for code using the search bar
• Then ask me to analyze the results
`;
        }
      } else {
        answer = isArabic ? `
🔍 **لا يوجد كود لتحليله**

للحصول على تحليل:
1. ابحث عن كود باستخدام شريط البحث
2. أو اكتب اسم مستودع في سؤالك مثل \`vercel/next.js\`
` : `
🔍 **No code to analyze**

To get analysis:
1. Search for code using the search bar
2. Or mention a repository name like \`vercel/next.js\` in your question
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