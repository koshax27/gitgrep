import { NextResponse } from 'next/server';

interface GitHubContent {
  name: string;
  path: string;
  download_url: string;
  type: string;
}

interface GitHubRepoData {
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  language: string;
  description: string;
  size: number;
  license: { name: string } | null;
}

interface SecurityIssue {
  type: 'critical' | 'warning' | 'optimization';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  codeExample?: string;
}

// دالة تحليل AST متقدمة
function analyzeCodeAST(code: string): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  // اكتشاف eval
  if (code.includes('eval(')) {
    issues.push({
      type: 'critical',
      message: '⚠️ استخدام eval() خطر أمني كبير',
      suggestion: 'استخدم Function() بدلاً من eval، أو أعد تصميم الكود',
      codeExample: '// بدلاً من:\neval(userInput);\n// استخدم:\nnew Function(userInput)();'
    });
  }
  
  // اكتشاف innerHTML
  if (code.includes('innerHTML')) {
    issues.push({
      type: 'critical',
      message: '⚠️ استخدام innerHTML قد يؤدي إلى XSS',
      suggestion: 'استخدم textContent أو innerText بدلاً من innerHTML',
      codeExample: '// بدلاً من:\nelement.innerHTML = userInput;\n// استخدم:\nelement.textContent = userInput;'
    });
  }
  
  // اكتشاف hardcoded secrets
  const secretPattern = /(password|secret|token|api_key|private_key)\s*=\s*['"][^'"]+['"]/gi;
  const secretMatches = code.match(secretPattern);
  if (secretMatches) {
    issues.push({
      type: 'critical',
      message: '⚠️可能存在 كلمة مرور أو مفتاح سري مكتوب في الكود',
      suggestion: 'استخدم environment variables لتخزين القيم الحساسة',
      codeExample: '// بدلاً من:\nconst API_KEY = "sk-123456";\n// استخدم:\nconst API_KEY = process.env.API_KEY;'
    });
  }
  
  // اكتشاف console.log
  if (code.includes('console.log')) {
    issues.push({
      type: 'optimization',
      message: 'console.log موجود في الكود',
      suggestion: 'احذف console.log في بيئة الإنتاج',
      codeExample: '// استخدم conditional logging:\nif (process.env.NODE_ENV !== "production") {\n  console.log(data);\n}'
    });
  }
  
  return issues;
}

// دالة حساب Security Score
function calculateSecurityScore(issues: SecurityIssue[]): number {
  const weights = { critical: 15, warning: 5, optimization: 1 };
  let totalWeight = 0;
  issues.forEach(issue => { totalWeight += weights[issue.type]; });
  return Math.max(0, 100 - totalWeight);
}

export async function POST(request: Request) {
  try {
    const { question, repo, context, userProjects, searchQuery } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const isArabic = /[\u0600-\u06FF]/.test(question);
    let answer = '';

    const analyzeCodePatterns = (code: string) => {
      const patterns = {
        hasAsync: /async\s+function|await\s+/.test(code),
        hasTryCatch: /try\s*{[\s\S]*?}\s*catch\s*\(/.test(code),
        hasPromise: /new\s+Promise\(|\.then\(|\.catch\(/.test(code),
        hasArrowFunction: /=>/.test(code),
        hasClass: /class\s+\w+/.test(code),
        hasExport: /export\s+(default|const|function)/.test(code),
        hasImport: /import\s+.*\s+from/.test(code),
        hasUseState: /useState\(/.test(code),
        hasUseEffect: /useEffect\(/.test(code),
        hasFetch: /fetch\(/.test(code),
        hasApiCall: /axios|fetch|http|api\.|\.get\(|\.post\(/.test(code),
        hasAuth: /auth|token|jwt|bearer|login|signin/i.test(code),
        hasSecurityIssue: /eval\(|innerHTML\s*=|\bpassword\b|\bsecret\b|hardcoded/i.test(code),
        hasComment: /\/\/|\/\*/.test(code),
        hasTodo: /TODO|FIXME|HACK|XXX/i.test(code),
      };
      return patterns;
    };

    const analyzeSecurity = (code: string): string[] => {
      const issues: string[] = [];
      if (code.includes('eval(')) issues.push('⚠️ استخدام eval() خطر أمني');
      if (code.includes('innerHTML')) issues.push('⚠️ استخدام innerHTML قد يؤدي إلى XSS');
      if (code.match(/password\s*=\s*['"][^'"]+['"]/i)) issues.push('⚠️可能存在 كلمة مرور مكتوبة في الكود');
      if (code.match(/secret\s*=\s*['"][^'"]+['"]/i)) issues.push('⚠️可能存在 مفتاح سري مكتوب');
      if (!code.includes('try') && code.includes('catch')) issues.push('ℹ️ لا يوجد معالجة للأخطاء');
      if (code.includes('fetch(') && !code.includes('catch')) issues.push('⚠️ fetch بدون catch قد يسبب أخطاء غير معالجة');
      return issues;
    };

    const analyzePerformance = (code: string): string[] => {
      const tips: string[] = [];
      if (code.includes('forEach') && code.match(/forEach.*await/)) tips.push('💡 استخدام forEach مع await لا يعمل كما هو متوقع، استخدم for...of');
      if (code.includes('.map(') && code.includes('await')) tips.push('💡 استخدام map مع await يتطلب Promise.all');
      if (code.match(/setInterval|setTimeout/)) tips.push('💡 تأكد من تنظيف الـ timers في useEffect');
      if (code.includes('useState') && code.match(/useState.*\[\],/)) tips.push('💡 يمكن دمج useState ذات الصلة في useReducer');
      return tips;
    };

    const analyzeApiEndpoints = (code: string): string[] => {
      const endpoints: string[] = [];
      const endpointRegex = /['"`](\/(?:api\/)?[a-zA-Z0-9\/\-_]+)['"`]/g;
      let match;
      while ((match = endpointRegex.exec(code)) !== null) {
        if (!endpoints.includes(match[1])) endpoints.push(match[1]);
      }
      return endpoints;
    };

    const analyzeDependencies = (code: string): string[] => {
      const deps: string[] = [];
      const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
      let match;
      while ((match = importRegex.exec(code)) !== null) deps.push(match[1]);
      while ((match = requireRegex.exec(code)) !== null) deps.push(match[1]);
      return deps.filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);
    };

    if (context && context.length > 0) {
      const lines: string[] = context.split('\n').filter((l: string) => l.trim().length > 0);
      const totalLines = lines.length;
      
      let repoName: string | null = null;
      for (const line of lines) {
        const match = line.match(/([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)/);
        if (match) { repoName = match[1]; break; }
      }

      const combinedCode = lines.join('\n');
      const patterns = analyzeCodePatterns(combinedCode);
      const securityIssues = analyzeSecurity(combinedCode);
      const performanceTips = analyzePerformance(combinedCode);
      const apiEndpoints = analyzeApiEndpoints(combinedCode);
      const dependencies = analyzeDependencies(combinedCode);
      
      // تحليل AST المتقدم
      const astIssues = analyzeCodeAST(combinedCode);
      const securityScore = calculateSecurityScore(astIssues);
      
      const riskLevels = {
        critical: astIssues.filter(i => i.type === 'critical'),
        warning: astIssues.filter(i => i.type === 'warning'),
        optimization: astIssues.filter(i => i.type === 'optimization')
      };
      
      // السياق الموسع
      const searchTerm = question.toLowerCase();
      const enhancedContextLines: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(searchTerm) || lines[i].toLowerCase().includes('api')) {
          const start = Math.max(0, i - 5);
          const end = Math.min(lines.length, i + 6);
          enhancedContextLines.push(lines.slice(start, end).join('\n'));
        }
      }
      const enhancedContext = enhancedContextLines.join('\n\n---\n\n');
      
      const analysisSections: string[] = [];

      // 1. نظرة عامة
      analysisSections.push(isArabic ? 
        `**📊 نظرة عامة:**\n• تم العثور على ${lines.length} سطر من الكود\n• ${lines.filter((l: string) => l.includes('function')).length} دالة\n• ${lines.filter((l: string) => l.includes('import') || l.includes('require')).length} استيراد\n• ${apiEndpoints.length} API endpoint مكتشف` :
        `**📊 Overview:**\n• Found ${lines.length} lines of code\n• ${lines.filter((l: string) => l.includes('function')).length} functions\n• ${lines.filter((l: string) => l.includes('import') || l.includes('require')).length} imports\n• ${apiEndpoints.length} API endpoints detected`
      );

      // 2. أنماط الكود
      const patternSummary: string[] = [];
      if (patterns.hasAsync) patternSummary.push(isArabic ? '✅ دوال غير متزامنة (async/await)' : '✅ Async/await functions');
      if (patterns.hasTryCatch) patternSummary.push(isArabic ? '✅ معالجة أخطاء' : '✅ Error handling');
      if (patterns.hasArrowFunction) patternSummary.push(isArabic ? '✅ دوال سهمية' : '✅ Arrow functions');
      if (patterns.hasClass) patternSummary.push(isArabic ? '✅ كلاسات' : '✅ Classes');
      if (patterns.hasUseState) patternSummary.push(isArabic ? '✅ React State (useState)' : '✅ React State (useState)');
      if (patterns.hasUseEffect) patternSummary.push(isArabic ? '✅ React Effects (useEffect)' : '✅ React Effects (useEffect)');
      
      if (patternSummary.length > 0) {
        analysisSections.push(isArabic ? 
          `**🔧 أنماط الكود المكتشفة:**\n${patternSummary.join('\n')}` :
          `**🔧 Detected Code Patterns:**\n${patternSummary.join('\n')}`
        );
      }

      // 3. مشاكل أمنية متقدمة (AST)
      if (riskLevels.critical.length > 0) {
        analysisSections.push(isArabic ?
          `**🔴 مشاكل خطيرة (Critical):**\n${riskLevels.critical.map(i => `⚠️ ${i.message}\n  💡 ${i.suggestion}\n  📝 مثال:\n  \`\`\`\n  ${i.codeExample}\n  \`\`\``).join('\n\n')}` :
          `**🔴 Critical Issues:**\n${riskLevels.critical.map(i => `⚠️ ${i.message}\n  💡 ${i.suggestion}\n  📝 Example:\n  \`\`\`\n  ${i.codeExample}\n  \`\`\``).join('\n\n')}`
        );
      }
      
      if (riskLevels.warning.length > 0) {
        analysisSections.push(isArabic ?
          `**🟡 تحذيرات (Warnings):**\n${riskLevels.warning.map(i => `⚠️ ${i.message}\n  💡 ${i.suggestion}`).join('\n\n')}` :
          `**🟡 Warnings:**\n${riskLevels.warning.map(i => `⚠️ ${i.message}\n  💡 ${i.suggestion}`).join('\n\n')}`
        );
      }

      // 4. الـ API Endpoints
      if (apiEndpoints.length > 0) {
        analysisSections.push(isArabic ?
          `**🌐 API Endpoints المكتشفة:**\n${apiEndpoints.map((e: string) => `• ${e}`).join('\n')}` :
          `**🌐 Detected API Endpoints:**\n${apiEndpoints.map((e: string) => `• ${e}`).join('\n')}`
        );
      }

      // 5. مشاكل أمنية تقليدية
      if (securityIssues.length > 0) {
        analysisSections.push(isArabic ?
          `**🔒 مشاكل أمنية محتملة:**\n${securityIssues.join('\n')}` :
          `**🔒 Potential Security Issues:**\n${securityIssues.join('\n')}`
        );
      }

      // 6. السياق الموسع
      if (enhancedContext && enhancedContext.length > 0) {
        analysisSections.push(isArabic ?
          `**📖 السياق الموسع (أول 800 حرف):**\n\`\`\`\n${enhancedContext.slice(0, 800)}${enhancedContext.length > 800 ? '...' : ''}\n\`\`\`` :
          `**📖 Extended Context (first 800 chars):**\n\`\`\`\n${enhancedContext.slice(0, 800)}${enhancedContext.length > 800 ? '...' : ''}\n\`\`\``
        );
      }

      // 7. نصائح أداء
      if (performanceTips.length > 0) {
        analysisSections.push(isArabic ?
          `**⚡ نصائح أداء:**\n${performanceTips.join('\n')}` :
          `**⚡ Performance Tips:**\n${performanceTips.join('\n')}`
        );
      }

      // 8. الـ Dependencies
      if (dependencies.length > 0) {
        const riskyDeps = dependencies.filter(d => 
          ['lodash', 'axios', 'express', 'next', 'react', 'vue'].some(r => d.includes(r))
        );
        analysisSections.push(isArabic ?
          `**📦 المكتبات المستخدمة:**\n${dependencies.slice(0, 10).map((d: string) => `• ${d}`).join('\n')}${dependencies.length > 10 ? `\n• ... و ${dependencies.length - 10} مكتبات أخرى` : ''}${riskyDeps.length > 0 ? `\n\n⚠️ **مكتبات قديمة أو بها ثغرات معروفة:**\n${riskyDeps.map(d => `  • ${d}`).join('\n')}` : ''}` :
          `**📦 Dependencies Used:**\n${dependencies.slice(0, 10).map((d: string) => `• ${d}`).join('\n')}${dependencies.length > 10 ? `\n• ... and ${dependencies.length - 10} more` : ''}${riskyDeps.length > 0 ? `\n\n⚠️ **Known Vulnerable Packages:**\n${riskyDeps.map(d => `  • ${d}`).join('\n')}` : ''}`
        );
      }

      // 9. الكود الموجود
      const previewLines = lines.slice(0, 50);
      const codePreview = previewLines.map((line: string) => `• ${line}`).join('\n');
      analysisSections.push(isArabic ?
        `**📄 الكود الموجود (${totalLines <= 50 ? `جميع الـ ${totalLines} سطر` : `أول 50 سطر من إجمالي ${totalLines} سطر`}):**\n\n${codePreview}${totalLines > 50 ? `\n\n• ... و ${totalLines - 50} سطر إضافي` : ''}` :
        `**📄 Code Found (${totalLines <= 50 ? `all ${totalLines} lines` : `first 50 lines of ${totalLines} total`}):**\n\n${codePreview}${totalLines > 50 ? `\n\n• ... and ${totalLines - 50} more lines` : ''}`
      );
const allIssues = [
  ...securityIssues.map(i => ({ type: 'warning', message: i } as SecurityIssue)),
  ...astIssues
];
      // 10. Security Score
      analysisSections.push(isArabic ?
        `**🔒 Security Score: ${securityScore}/100**\n${securityScore >= 80 ? '✅ Good security practices' : securityScore >= 60 ? '⚠️ Needs improvement' : '🔴 Critical issues found - fix immediately'}` :
        `**🔒 Security Score: ${securityScore}/100**\n${securityScore >= 80 ? '✅ Good security practices' : securityScore >= 60 ? '⚠️ Needs improvement' : '🔴 Critical issues found - fix immediately'}`
      );

      // 11. اقتراحات للتحسين
      const suggestions: string[] = [];
      if (!patterns.hasTryCatch && patterns.hasAsync) suggestions.push(isArabic ? 'أضف معالجة للأخطاء باستخدام try/catch' : 'Add error handling with try/catch');
      if (patterns.hasFetch && !patterns.hasTryCatch) suggestions.push(isArabic ? 'أضف .catch() لمعالجة أخطاء الـ fetch' : 'Add .catch() to handle fetch errors');
      if (apiEndpoints.length > 0 && !patterns.hasAuth) suggestions.push(isArabic ? 'أضف مصادقة لحماية الـ API endpoints' : 'Add authentication to protect API endpoints');
      if (patterns.hasUseEffect && !combinedCode.includes('cleanup')) suggestions.push(isArabic ? 'أضف cleanup function في useEffect لمنع تسرب الذاكرة' : 'Add cleanup function in useEffect to prevent memory leaks');
      if (riskLevels.critical.length > 0) suggestions.push(isArabic ? '🔴 **مشاكل خطيرة تم اكتشافها** - قم بإصلاحها فوراً' : '🔴 **Critical issues detected** - fix immediately');
      
      if (suggestions.length > 0) {
        analysisSections.push(isArabic ?
          `**💡 اقتراحات للتحسين:**\n${suggestions.map((s: string) => `• ${s}`).join('\n')}` :
          `**💡 Improvement Suggestions:**\n${suggestions.map((s: string) => `• ${s}`).join('\n')}`
        );
      }

      answer = analysisSections.join('\n\n');
      
      if (repoName) {
        try {
          const [owner, name] = repoName.split('/');
          const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
            headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
          });
          
          if (res.ok) {
            const repoData: GitHubRepoData = await res.json();
            const lastUpdate = new Date(repoData.updated_at);
            const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
            
            const repoInfo = isArabic ? `
**📦 معلومات المستودع (${repoData.full_name}):**
• ⭐ ${repoData.stargazers_count.toLocaleString()} نجوم
• 🍴 ${repoData.forks_count.toLocaleString()} forks
• 🐛 ${repoData.open_issues_count.toLocaleString()} مشاكل مفتوحة
• 📅 آخر تحديث: ${lastUpdate.toLocaleDateString()} (منذ ${daysSinceUpdate} يوم)
• 🔧 اللغة: ${repoData.language || 'غير محدد'}
• 📝 الوصف: ${repoData.description || 'لا يوجد وصف'}
` : `
**📦 Repository Info (${repoData.full_name}):**
• ⭐ ${repoData.stargazers_count.toLocaleString()} stars
• 🍴 ${repoData.forks_count.toLocaleString()} forks
• 🐛 ${repoData.open_issues_count.toLocaleString()} open issues
• 📅 Last updated: ${lastUpdate.toLocaleDateString()} (${daysSinceUpdate} days ago)
• 🔧 Language: ${repoData.language || 'Unknown'}
• 📝 Description: ${repoData.description || 'No description'}
`;
            answer = repoInfo + '\n\n' + answer;
          }
        } catch (err) {
          console.error('Failed to fetch repo info:', err);
        }
      }
    }
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
            const repoData: GitHubRepoData = await res.json();
            const lastUpdate = new Date(repoData.updated_at);
            const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
            
            let codeSample = '';
            const fileList: string[] = [];
            try {
              const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${name}/contents?ref=main`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
              });
              if (contentsRes.ok) {
                const contents: GitHubContent[] = await contentsRes.json();
                const codeFiles = contents.filter((f: GitHubContent) => 
                  f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.py') || f.name.endsWith('.go') || f.name.endsWith('.jsx') || f.name.endsWith('.tsx')
                ).slice(0, 5);
                
                codeFiles.forEach((f: GitHubContent) => fileList.push(f.name));
                
                for (const file of codeFiles.slice(0, 2)) {
                  const fileRes = await fetch(file.download_url);
                  if (fileRes.ok) {
                    const fileContent = await fileRes.text();
                    codeSample += `\n**${file.name}:**\n\`\`\`\n${fileContent.substring(0, 400)}...\n\`\`\`\n`;
                  }
                }
              }
            } catch (err) {
              console.error('Failed to fetch code sample:', err);
            }
            
            const repoInfo = isArabic ? `
📦 **تحليل المستودع: ${repoData.full_name}**

**📊 الإحصائيات:**
• ⭐ ${repoData.stargazers_count.toLocaleString()} نجوم
• 🍴 ${repoData.forks_count.toLocaleString()} forks
• 🐛 ${repoData.open_issues_count.toLocaleString()} مشاكل مفتوحة
• 📅 آخر تحديث: ${lastUpdate.toLocaleDateString()} (منذ ${daysSinceUpdate} يوم)
• 🔧 اللغة الأساسية: ${repoData.language || 'غير محدد'}
• 📁 حجم المستودع: ${(repoData.size / 1024).toFixed(1)} MB
• 📝 الترخيص: ${repoData.license?.name || 'غير محدد'}

**📝 الوصف:**
${repoData.description || 'لا يوجد وصف'}

**📁 الملفات الرئيسية:**
${fileList.map((f: string) => `• ${f}`).join('\n')}

${codeSample ? `**💻 عينة من الكود:**\n${codeSample}` : ''}

**🔍 توصيات:**
1. ابحث عن كود محدد في هذا المستودع باستخدام شريط البحث
2. اسألني عن حاجة محددة مثل "حلل الـ API endpoints"
3. أضف المستودع إلى My Projects لمتابعة التحديثات
` : `
📦 **Repository Analysis: ${repoData.full_name}**

**📊 Stats:**
• ⭐ ${repoData.stargazers_count.toLocaleString()} stars
• 🍴 ${repoData.forks_count.toLocaleString()} forks
• 🐛 ${repoData.open_issues_count.toLocaleString()} open issues
• 📅 Last updated: ${lastUpdate.toLocaleDateString()} (${daysSinceUpdate} days ago)
• 🔧 Primary language: ${repoData.language || 'Unknown'}
• 📁 Repository size: ${(repoData.size / 1024).toFixed(1)} MB
• 📝 License: ${repoData.license?.name || 'Unknown'}

**📝 Description:**
${repoData.description || 'No description'}

**📁 Main files:**
${fileList.map((f: string) => `• ${f}`).join('\n')}

${codeSample ? `**💻 Code Sample:**\n${codeSample}` : ''}

**🔍 Recommendations:**
1. Search for specific code in this repository using the search bar
2. Ask me something specific like "analyze the API endpoints"
3. Add this repository to My Projects to track updates
`;
            answer = repoInfo;
          } else {
            throw new Error('Repo not found');
          }
        } catch (err) {
          answer = isArabic ? `
🔍 **لم أجد المستودع "${repoName}"**

**للحصول على تحليل:**
• تأكد من صحة الاسم (مثال: \`vercel/next.js\`)
• ابحث عن الكود أولاً باستخدام شريط البحث
• أو أضف المستودع في **My Projects** ثم اسألني
` : `
🔍 **Repository "${repoName}" not found**

**To get analysis:**
• Verify the repository name (example: \`vercel/next.js\`)
• First search for code using the search bar
• Or add the repository to **My Projects** then ask me
`;
        }
      } else {
        answer = isArabic ? `
🔍 **لا يوجد كود لتحليله**

**للحصول على تحليل دقيق:**

1. **ابحث عن كود:**
   • استخدم شريط البحث للعثور على كود محدد
   • مثال: "function api" أو "useState hook"

2. **اسأل عن مستودع معين:**
   • اكتب اسم المستودع في سؤالك مثل \`vercel/next.js\`
   • مثال: "حلل لي المستودع facebook/react"

3. **أضف مستودع في My Projects:**
   • أضف المستودعات التي تتابعها
   • ثم اسألني عن تحليلها

**💡 نصائح للبحث الفعال:**
• استخدم كلمات مفتاحية محددة: "api endpoint", "authentication", "database"
• ابحث عن دوال معينة: "function getUser", "app.get"
• استخدم صيغة owner/repo للمستودعات المعروفة
` : `
🔍 **No code to analyze**

**For accurate analysis:**

1. **Search for code:**
   • Use the search bar to find specific code
   • Example: "function api" or "useState hook"

2. **Ask about a specific repository:**
   • Mention the repository name like \`vercel/next.js\`
   • Example: "Analyze facebook/react"

3. **Add a repository to My Projects:**
   • Add repositories you're interested in
   • Then ask me to analyze them

**💡 Tips for effective search:**
• Use specific keywords: "api endpoint", "authentication", "database"
• Search for specific functions: "function getUser", "app.get"
• Use owner/repo format for known repositories
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
const suggestions = {
  'innerHTML': {
    fix: 'element.textContent = userInput;',
    explanation: 'textContent آمن ضد XSS'
  },
  'eval': {
    fix: 'new Function(userInput)();',
    explanation: 'Function() أكثر أماناً من eval'
  },
  'console.log': {
    fix: 'if (process.env.NODE_ENV !== "production") console.log(data);',
    explanation: 'يمنع ظهور logs في الإنتاج'
  }
};