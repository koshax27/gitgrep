import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    githubId: !!process.env.GITHUB_CLIENT_ID,
    githubSecret: !!process.env.GITHUB_CLIENT_SECRET,
    googleId: !!process.env.GOOGLE_CLIENT_ID,
    googleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  });
}