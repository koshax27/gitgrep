import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// استخدم Google Sheets لتخزين عدد المستخدمين
export async function GET() {
  try {
    // جلب العدد من Google Sheets
    // مؤقتاً هنرجع عدد وهمي
    const count = 42; // هنا هتعدل عشان تجيب من Google Sheets
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

export async function POST() {
  try {
    // زيادة العدد بمقدار 1
    // هنا هتعدل عشان ت save في Google Sheets
    const newCount = 43; // مؤقتاً
    
    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error('Error updating user count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}