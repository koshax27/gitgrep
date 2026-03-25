// app/api/user-count/route.ts
import { NextResponse } from 'next/server';

// مؤقتاً هنستخدم متغير بسيط
// بعدين هنربطها بـ Google Sheets أو database

let userCount = 42;

export async function GET() {
  try {
    return NextResponse.json({ count: userCount });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

export async function POST() {
  try {
    userCount = userCount + 1;
    return NextResponse.json({ count: userCount });
  } catch (error) {
    console.error('Error updating user count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}