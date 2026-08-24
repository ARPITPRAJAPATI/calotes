import type { Metadata } from "next";
import { Inter, Barlow, Playfair_Display } from "next/font/google";
import { unstable_cache } from "next/cache";
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
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const getCachedThemeAccent = unstable_cache(
  async () => {
    try {
      await connectDB();
      const settings: any = await Settings.findOne().select('accentColor').lean();
      return settings?.accentColor || "#C85a32";
    } catch (err) {
      console.error("Layout failed to load theme settings", err);
      return "#C85a32";
    }
  },
  ["root-layout-accent-color"],
  { revalidate: 300, tags: ["settings"] }
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeAccent = await getCachedThemeAccent();

  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${barlow.variable} ${playfair.variable} antialiased selection:bg-terracotta selection:text-bg`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preload" as="image" href="/images/hero-mobile.jpg" media="(max-width: 767px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/images/hero-pc.jpg" media="(min-width: 768px)" fetchPriority="high" />
        <meta name="theme-color" content="#C85a32" />
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
