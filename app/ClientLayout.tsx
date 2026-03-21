"use client";

import { useState, useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-[#020408] text-white">{children}</div>;
  }

  return (
    <div className="bg-[#020408] text-white">
      {children}
    </div>
  );
}