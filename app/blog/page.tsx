import Link from "next/link";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020408] p-12">
      <h1 className="text-4xl font-bold text-white">Blog</h1>
      <Link href="/blog/test" className="text-blue-400 mt-4 block">Test Post</Link>
    </div>
  );
}