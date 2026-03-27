// app/layout.tsx
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import ClientLayout from "./ClientLayout";
import Script from "next/script";
import { Inter } from "next/font/google";

// تحسين الـ fonts
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

// app/layout.tsx

export const metadata = {
  title: "GitGrep - AI-Powered Code Search",
  description: "Search across 100M+ GitHub repositories instantly. Find bugs, explore code patterns, and get AI-powered insights.",
  keywords: "github, code search, AI, developer tools, programming",
  authors: [{ name: "GitGrep" }],
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "GitGrep - AI-Powered Code Search",
    description: "Search across 100M+ GitHub repositories instantly",
    url: "https://gitgrep.com",
    siteName: "GitGrep",
    images: [
      { url: "https://gitgrep.com/android-chrome-512x512.png", width: 512, height: 512, alt: "GitGrep Logo" },
      { url: "https://gitgrep.com/android-chrome-192x192.png", width: 192, height: 192, alt: "GitGrep Logo" },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitGrep - AI-Powered Code Search",
    description: "Search across 100M+ GitHub repositories instantly",
    images: ["https://gitgrep.com/android-chrome-512x512.png"],
    creator: "@gitgrep",
    site: "@gitgrep",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

// ✅ viewport منفصل
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-HTJX1EBMTW";

  return (
    <html
      lang="en"
      className={`dark ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://api.github.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link
  rel="preload"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  as="style"
/>
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://api.github.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
        
        {/* Viewport with better accessibility */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#020408" />
        <meta name="color-scheme" content="dark" />
        
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_path: window.location.pathname,
                send_page_view: true
              });
            `,
          }}
        />
      </head>
      <body
        className="antialiased min-h-screen bg-neutral-50 text-neutral-900 dark:bg-[#020408] dark:text-slate-200"
        suppressHydrationWarning
      >
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}