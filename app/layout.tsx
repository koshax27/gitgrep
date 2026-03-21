import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import ClientLayout from "./ClientLayout";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'GitGrep - AI-Powered Code Search',
  description: 'Search across 100M+ GitHub repositories instantly. Find bugs, explore code patterns, and get AI-powered insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = "G-HTJX1EBMTW";

  return (
    <html lang="en" suppressHydrationWarning>
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
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020408] text-white`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}