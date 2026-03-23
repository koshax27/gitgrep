import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { owner: string; name: string } }
) {
  const { owner, name } = params;
  
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${name}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        next: {
          revalidate: 3600, // تتغير كل ساعة بس
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('GitHub API error');
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
    return NextResponse.json(
      { error: 'Failed to fetch repo data' },
      { status: 500 }
    );
  }
}