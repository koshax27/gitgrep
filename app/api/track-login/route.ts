import { NextResponse } from "next/server";

const SHEET_URL = "https://script.google.com/macros/s/AKfycbwyTL2PUKT8X3uqooBO1dApNGq5zxGcMmEeVc4LQEv9ACf0aBgYuv-udEttUueymT5TAw/exec"; // 👈 حط الـ URL بتاعك

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // إرسال البيانات إلى Google Sheets
    const response = await fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking login:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}