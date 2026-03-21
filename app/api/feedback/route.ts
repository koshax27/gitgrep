import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const feedback = await req.json();
    
    // طباعة الفيدباك في الـ Console (هتشوفه في terminal)
    console.log("=".repeat(50));
    console.log("📧 NEW FEEDBACK RECEIVED:");
    console.log("-".repeat(50));
    console.log(`Rating: ${"⭐".repeat(feedback.rating)}`);
    console.log(`Category: ${feedback.category}`);
    console.log(`Message: ${feedback.feedback}`);
    console.log(`Email: ${feedback.email || "Not provided"}`);
    console.log(`Timestamp: ${new Date(feedback.timestamp).toLocaleString()}`);
    console.log("=".repeat(50));
    
    // حفظ الفيدباك في ملف JSON (مؤقتًا)
    // هنضيف تخزين أفضل في الخطوات الجاية
    
    return NextResponse.json({ 
      success: true, 
      message: "Feedback received successfully" 
    });
    
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to save feedback" 
    }, { status: 500 });
  }
}