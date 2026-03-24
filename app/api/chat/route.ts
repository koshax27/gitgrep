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
      contextAnalysis = `
**Code Context:**
${lines.slice(0, 15).map((line: string) => `• ${line.substring(0, 200)}`).join('\n')}
`;
    }

    // الكشف عن اللغة (هل السؤال بالعربي؟)
    const isArabicQuestion = /[\u0600-\u06FF]/.test(question);
    const responseLanguage = isArabicQuestion ? 'arabic' : 'english';

    // بناء الـ prompt
    let prompt = '';
    
    if (repoData) {
      prompt = `You are an expert code analyst. Analyze this GitHub repository and answer the user's question.

**Repository:** ${repoData.full_name}
**Description:** ${repoData.description || 'No description'}
**Stars:** ${repoData.stargazers_count} | **Forks:** ${repoData.forks_count}
**Language:** ${repoData.language || 'Unknown'}
**Open Issues:** ${repoData.open_issues_count}

**User Question:** ${question}

${contextAnalysis}

**Response Language:** ${responseLanguage === 'arabic' ? 'Respond in Arabic' : 'Respond in English'}

Provide a specific, detailed analysis based on the actual repository data. Be precise and mention actual code patterns if visible.`;
    } else {
      prompt = `You are an expert code analyst. Answer the user's question about code.

**Question:** ${question}

${contextAnalysis}

**Response Language:** ${responseLanguage === 'arabic' ? 'Respond in Arabic' : 'Respond in English'}

Provide a helpful, specific answer based on the code context provided.`;
    }

    // استخدم DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
  role: 'system',
  content: `You are a senior software engineer and code analyst.
  
**Language Rule:**
- Respond in ENGLISH by default
- ONLY respond in ARABIC if the user's question is in Arabic
  
Provide specific, detailed analysis based on actual code. Be precise and helpful.`
}
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t analyze the code. Please try again.';

    return NextResponse.json({ answer });
    
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { answer: 'Sorry, an error occurred. Please try again.' },
      { status: 500 }
    );
  }
}