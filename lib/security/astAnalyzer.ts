// lib/security/astAnalyzer.ts
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

interface SecurityIssue {
  type: 'critical' | 'warning' | 'optimization';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  codeExample?: string;
}

export function analyzeCodeAST(code: string, filePath?: string): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 2022,
      sourceType: 'module',
      locations: true
    });
    
    walk.simple(ast, {
      // اكتشاف eval
      CallExpression(node: any) {
        if (node.callee?.name === 'eval') {
          issues.push({
            type: 'critical',
            message: 'استخدام eval() خطر أمني كبير',
            line: node.loc?.start?.line,
            suggestion: 'استخدم Function() بدلاً من eval، أو أعد تصميم الكود',
            codeExample: '// بدلاً من:\neval(userInput);\n// استخدم:\nnew Function(userInput)();'
          });
        }
      },
      
      // اكتشاف innerHTML و console.log
      MemberExpression(node: any) {
        if (node.property?.name === 'innerHTML') {
          issues.push({
            type: 'critical',
            message: 'استخدام innerHTML قد يؤدي إلى XSS',
            line: node.loc?.start?.line,
            suggestion: 'استخدم textContent أو innerText بدلاً من innerHTML',
            codeExample: '// بدلاً من:\nelement.innerHTML = userInput;\n// استخدم:\nelement.textContent = userInput;'
          });
        }
        if (node.object?.name === 'console' && node.property?.name === 'log') {
          issues.push({
            type: 'optimization',
            message: 'console.log موجود في الكود',
            line: node.loc?.start?.line,
            suggestion: 'احذف console.log في بيئة الإنتاج',
            codeExample: '// استخدم conditional logging:\nif (process.env.NODE_ENV !== "production") {\n  console.log(data);\n}'
          });
        }
      },
      
      // اكتشاف متغيرات تشبه الـ secrets
      VariableDeclarator(node: any) {
        const varName = node.id?.name?.toLowerCase() || '';
        const isSecretLike = ['password', 'secret', 'token', 'key', 'api_key', 'private_key'].some(
          k => varName.includes(k)
        );
        
        if (isSecretLike && node.init?.value) {
          issues.push({
            type: 'critical',
            message: `متغير ${node.id.name} قد يحتوي على قيمة حساسة`,
            line: node.loc?.start?.line,
            suggestion: 'استخدم environment variables لتخزين القيم الحساسة',
            codeExample: '// بدلاً من:\nconst API_KEY = "sk-123456";\n// استخدم:\nconst API_KEY = process.env.API_KEY;'
          });
        }
      }
    });
  } catch (error) {
    console.error('AST parsing error:', error);
  }
  
  return issues;
}
function classifyIssue(issue: string, code: string): 'critical' | 'warning' | 'optimization' {
  const criticalKeywords = ['eval', 'innerHTML', 'password', 'secret', 'token', 'api_key'];
  const warningKeywords = ['console.log', 'debugger', 'TODO', 'FIXME'];
  
  if (criticalKeywords.some(k => issue.toLowerCase().includes(k) || code.toLowerCase().includes(k))) {
    return 'critical';
  }
  if (warningKeywords.some(k => issue.toLowerCase().includes(k) || code.toLowerCase().includes(k))) {
    return 'warning';
  }
  return 'optimization';
}