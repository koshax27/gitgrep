import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import ClientLayout from "./ClientLayout";
import Script from "next/script";

export const metadata = {
  title: 'GitGrep - AI-Powered Code Search',
  description: 'Search across 100M+ GitHub repositories instantly. Find bugs, explore code patterns, and get AI-powered insights.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'GitGrep - AI-Powered Code Search',
    description: 'Search across 100M+ GitHub repositories instantly',
    url: 'https://gitgrep.com',
    siteName: 'GitGrep',
    images: [
      {
        url: 'https://gitgrep.com/favicon.png',
        width: 512,
        height: 512,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitGrep - AI-Powered Code Search',
    description: 'Search across 100M+ GitHub repositories instantly',
    images: ['https://gitgrep.com/favicon.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = "G-HTJX1EBMTW";

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
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
              gtag('config', '${GA_ID}');
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-neutral-50 text-neutral-900 dark:bg-[#020408] dark:text-slate-200" suppressHydrationWarning>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}