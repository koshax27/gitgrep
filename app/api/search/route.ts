import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  // التأكد من وجود استعلام بحث
  if (!q) return NextResponse.json({ items: [] })

  // سحب التوكن من البيئة (Vercel/Local)
  const token = process.env.GITHUB_TOKEN

  try {
    const res = await fetch(
      `https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=12`,
      {
        headers: {
          // استخدام التوكن لرفع الـ Rate Limit لـ 5000 طلب في الساعة
          ...(token && { Authorization: `token ${token}` }),
          // الترويسة دي مهمة جداً عشان ترجع الـ fragment (قطعة الكود) اللي فيها الكلمة
          Accept: "application/vnd.github.v3.text-match+json",
          "User-Agent": "GitGrep-App" // جيت هب بيطلب أحياناً User-Agent للتعريف
        },
        // تقليل الـ Cache لـ 10 دقائق عشان النتائج تبقى أفرش (Fresh)
        next: { revalidate: 600 } 
      }
    )

    if (!res.ok) {
      const errorData = await res.json()
      console.error("GitHub API Error:", errorData)
      return NextResponse.json(
        { error: "GitHub API Error", details: errorData.message }, 
        { status: res.status }
      )
    }

    const data = await res.json()
    
    // إرجاع البيانات للـ Frontend
    return NextResponse.json(data)
  } catch (error) {
    console.error("Search API Crash:", error)
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}