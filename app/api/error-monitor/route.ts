import { NextResponse } from "next/server";

// تخزين الأخطاء في الذاكرة (مؤقت، هنطوره بعد كده)
let errorLogs: any[] = [];

export async function POST(req: Request) {
  try {
    const errorData = await req.json();
    
    const errorEntry = {
      id: Date.now(),
      ...errorData,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      url: req.headers.get('referer') || req.headers.get('origin'),
    };
    
    // إضافة الخطأ للقائمة
    errorLogs.unshift(errorEntry);
    
    // حفظ آخر 100 خطأ فقط
    if (errorLogs.length > 100) errorLogs.pop();
    
    // طباعة في console (للـ development)
    console.log("=".repeat(50));
    console.log("❌ ERROR MONITORED:");
    console.log("-".repeat(50));
    console.log(`Type: ${errorData.type}`);
    console.log(`Message: ${errorData.message}`);
    console.log(`URL: ${errorEntry.url}`);
    console.log(`Time: ${errorEntry.timestamp}`);
    console.log("=".repeat(50));
    
    return NextResponse.json({ success: true, id: errorEntry.id });
    
  } catch (error) {
    console.error("Error in error monitor:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ errors: errorLogs });
}