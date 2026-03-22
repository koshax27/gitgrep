import { NextResponse } from "next/server";

const SHEET_URL = "hhttps://script.google.com/macros/s/AKfycbzR3MYRDZ0rI9rqWlFoRQJJ0o4oIbKbWjCBvfYWVdbBsepc7GqR-XwH20U5LO4WQcc4vg/execttps://script.google.com/macros/s/AKfycbxxskTfT_uVH_Mh2O76lBftIY6TNtiPx3cA7MTaS0_FiUK_DiDccfT8u7-Nf5Zczj6MnQ/exec";

async function getLocation(ip: string) {
  try {
    // استخدام ipapi.co (مجاني)
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return {
      city: data.city || "Unknown",
      region: data.region || "Unknown",
      country: data.country_name || "Unknown",
      lat: data.latitude || "",
      lon: data.longitude || "",
    };
  } catch (error) {
    console.error("Failed to get location:", error);
    return { city: "Unknown", region: "Unknown", country: "Unknown", lat: "", lon: "" };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // جلب IP من الـ request
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('cf-connecting-ip') || 
               req.headers.get('true-client-ip') ||
               "Unknown";
    
    // جلب الموقع بناءً على IP
    const location = await getLocation(ip);
    
    const dataToSend = {
      ...body,
      ip,
      city: location.city,
      region: location.region,
      country: location.country,
      location: `${location.city}, ${location.region}, ${location.country}`,
      latitude: location.lat,
      longitude: location.lon,
    };
    
    console.log("📊 Tracking login with location:", dataToSend);
    
    // إرسال إلى Google Sheets
    await fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking login:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}