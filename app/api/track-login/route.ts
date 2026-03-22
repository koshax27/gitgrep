import { NextResponse } from "next/server";

const FORM_ID = "1FAIpQLSdepfpfVjLy24qL6tXTwFXu80H0j4LH5Cd8WDgg1Wtp5wnLAw";
const FORM_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || "Unknown";
    const location = `${body.city || "Unknown"}, ${body.country || "Unknown"}`;
    
    const formData = new URLSearchParams({
      "emailAddress": body.email || "Unknown",
      "entry.1720108508": body.name || "Unknown",
      "entry.1737748595": new Date().toISOString(),
      "entry.1774139952959": `${body.provider || "Unknown"} | IP: ${ip} | ${location}`,
    });
    
    await fetch(FORM_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
    
    console.log("📊 Login tracked to Google Forms:", body.email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking login:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}