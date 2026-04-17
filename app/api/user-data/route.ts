import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SHEET_URL = process.env.GOOGLE_SHEET_URL || "https://script.google.com/macros/s/AKfycbxJRBarBQhWLiMKFjIJ9ecbVrSh0AB8nKfga1HWbILVk9DN4rcPOo4-j3MsK8_gWaA-UQ/exec";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const response = await fetch(`${SHEET_URL}?email=${session.user.email}`);
    const data = await response.json();
    
    return NextResponse.json({
      favorites: JSON.parse(data.favorites || "[]"),
      projects: JSON.parse(data.projects || "[]")
    });
  } catch (error) {
    return NextResponse.json({ favorites: [], projects: [] });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    
    await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        favorites: JSON.stringify(body.favorites || []),
        projects: JSON.stringify(body.projects || [])
      })
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}