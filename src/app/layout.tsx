import type { Metadata } from "next";
import { Inter, Barlow, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import connectDB from "@/lib/db";
import Settings from "@/models/Settings";

import ClientOverlays from "@/components/ClientOverlays";

import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://calotesvintage.com"),
  title: "Calotes Vintage | Authentic Pre-Owned Fashion",
  description: "Curated vintage pieces. Adapt. Stand Out. Be Calotes.",
  keywords: ["vintage", "streetwear", "pre-owned fashion", "calotes vintage", "authentic clothing"],
  openGraph: {
    title: "Calotes Vintage | Authentic Pre-Owned Fashion",
    description: "Curated vintage pieces. Adapt. Stand Out. Be Calotes.",
    url: "https://calotesvintage.com",
    siteName: "Calotes Vintage",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calotes Vintage | Authentic Pre-Owned Fashion",
    description: "Curated vintage pieces. Adapt. Stand Out. Be Calotes.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3" },
      { url: "/favicon.png?v=3", type: "image/png" },
      { url: "/icon-192.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let activeAccent = "#C85a32";
  try {
    await connectDB();
    const settings = await Settings.findOne();
    if (settings && settings.accentColor) {
      activeAccent = settings.accentColor;
    }
  } catch (err) {
    console.error("Layout failed to load theme settings", err);
  }

  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} ${playfair.variable} antialiased selection:bg-terracotta selection:text-bg`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=3" />
        <link rel="preload" as="image" href="/images/hero-mobile.jpg" media="(max-width: 767px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/images/hero-pc.jpg" media="(min-width: 768px)" fetchPriority="high" />
        <meta name="theme-color" content="#C85a32" />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const theme = stored || 'dark';
                  if (!stored) {
                    localStorage.setItem('theme', 'dark');
                  }
                  const isHome = window.location.pathname === '/';
                  document.documentElement.classList.remove('dark', 'theme-calotes');
                  if (theme === 'calotes') {
                    if (isHome) {
                      document.documentElement.classList.add('theme-calotes');
                    } else {
                      document.documentElement.classList.add('dark');
                    }
                  } else if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root:not(.theme-calotes) {
            --color-accent: ${activeAccent};
            --color-terracotta: ${activeAccent};
          }
        `}} />
      </head>
      <body className="relative bg-bg text-text min-h-screen flex flex-col">
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <PageTransition>
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </PageTransition>
          <Footer />
          <ClientOverlays />
        </Providers>
      </body>
    </html>
  );
}
