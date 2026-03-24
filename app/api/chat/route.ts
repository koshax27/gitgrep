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
Code Context:
${lines.slice(0, 15).map((line: string) => `• ${line.substring(0, 200)}`).join('\n')}
`;
    }

    // الكشف عن اللغة
    const isArabicQuestion = /[\u0600-\u06FF]/.test(question);
    
    let prompt = '';
    if (repoData) {
      prompt = `You are an expert code analyst. Analyze this GitHub repository and answer the user's question.

Repository: ${repoData.full_name}
Description: ${repoData.description || 'No description'}
Stars: ${repoData.stargazers_count} | Forks: ${repoData.forks_count}
Language: ${repoData.language || 'Unknown'}
Open Issues: ${repoData.open_issues_count}

User Question: ${question}

${contextAnalysis}

${isArabicQuestion ? 'Respond in Arabic.' : 'Respond in English.'}

Provide specific, detailed analysis based on the actual repository data.`;
    } else {
      prompt = `You are an expert code analyst. Answer the user's question about code.

Question: ${question}

${contextAnalysis}

${isArabicQuestion ? 'Respond in Arabic.' : 'Respond in English.'}

Provide a helpful, specific answer based on the code context.`;
    }

    // استخدم Hugging Face (مجاني)
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data[0]?.generated_text || 'Sorry, I couldn\'t analyze the code.';

    return NextResponse.json({ answer });
    
  } catch (error) {
    console.error('AI error:', error);
    return NextResponse.json(
      { answer: 'Sorry, I couldn\'t analyze the code. Please try again.' },
      { status: 500 }
    );
  }
}