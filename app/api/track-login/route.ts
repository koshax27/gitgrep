import { NextResponse } from "next/server";

const SHEET_URL = "https://script.google.com/macros/s/AKfycbw7GtcEilktOhsMPIqxtD-cRRJWrCkc2SDVqOfqpFCHXEqfyJQ59Qslsil6HVXXkBKH4w/exec";

async function getLocationFromIP(ip: string) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return {
      city: data.city || "Unknown",
      region: data.region || "Unknown",
      country: data.country_name || "Unknown",
      latitude: data.latitude || "",
      longitude: data.longitude || "",
    };
  } catch (error) {
    return { city: "Unknown", region: "Unknown", country: "Unknown", latitude: "", longitude: "" };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || "Unknown";
    const location = await getLocationFromIP(ip);
    
    const dataToSend = {
      userId: body.userId || "",
      name: body.name || "",
      email: body.email || "",
      provider: body.provider || "",
      lastLogin: new Date().toISOString(),
      ip: ip,
      city: location.city,
      region: location.region,
      country: location.country,
      location: `${location.city}, ${location.region}, ${location.country}`,
      latitude: location.latitude,
      longitude: location.longitude
    };
    
    console.log("📤 Sending to Google Sheets:", dataToSend);
    
    const response = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });
    
    const result = await response.json();
    console.log("📥 Google Sheets response:", result);
    
    // تأكد من إرجاع userNumber
    return NextResponse.json({ 
      success: true, 
      userNumber: result.userNumber || 0,
      isFirst100: result.userNumber ? result.userNumber <= 100 : false
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}