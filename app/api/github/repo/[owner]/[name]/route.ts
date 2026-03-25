// app/api/github/repo/[owner]/[name]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    // انتظر الـ params
    const { owner, name } = await params;
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      next: {
        revalidate: 3600,
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      stars: data.stargazers_count,
      forks: data.forks_count,
      issues: data.open_issues_count,
      updatedAt: data.updated_at,
      fullName: data.full_name,
    });
    
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json({ error: 'Failed to fetch repo data' }, { status: 500 });
  }
}