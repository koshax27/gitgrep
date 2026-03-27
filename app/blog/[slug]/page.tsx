import Link from "next/link";

export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-[#020408] p-12">
      <Link href="/blog" className="text-blue-400">← Back</Link>
      <h1 className="text-3xl font-bold text-white mt-4">Post: {params.slug}</h1>
      <p className="text-slate-400 mt-4">This works if you see this page.</p>
    </div>
  );
}