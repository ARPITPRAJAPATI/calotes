import type { Metadata } from "next";
import { Inter, Barlow, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import CartDrawer from "@/components/CartDrawer";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Toaster } from "react-hot-toast";
import CookieBanner from "@/components/CookieBanner";
import PageTransition from "@/components/PageTransition";
import connectDB from "@/lib/db";
import Settings from "@/models/Settings";
import WishlistDrawer from "@/components/WishlistDrawer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
  }
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
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          })();
        `}} />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-accent: ${activeAccent} !important;
            --color-terracotta: ${activeAccent} !important;
          }
        `}} />
      </head>
      <body className="relative bg-bg text-text min-h-screen flex flex-col">
        {/* Vintage Noise Texture Overlay */}
        <div className="fixed inset-0 z-[-1] bg-noise" />
        
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <PageTransition>
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </PageTransition>
          <Footer />
          <CartDrawer />
          <WishlistDrawer />
          <WhatsAppButton />
          <CookieBanner />
          <Toaster 
            position="bottom-center" 
            toastOptions={{
              style: {
                background: '#111010',
                color: '#F2EDE6',
                borderRadius: '0',
                border: '1px solid #D5CFC8',
              }
            }} 
          />
        </Providers>
      </body>
    </html>
  );
}
