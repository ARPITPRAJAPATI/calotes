import type { Metadata } from "next";
import { Inter, Barlow, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import CartDrawer from "@/components/CartDrawer";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Calotes Vintage | Authentic Pre-Owned Fashion",
  description: "Curated vintage pieces. Adapt. Stand Out. Be Calotes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} ${playfair.variable} antialiased selection:bg-terracotta selection:text-bg`}>
      <body className="relative bg-bg text-text min-h-screen flex flex-col">
        {/* Vintage Noise Texture Overlay */}
        <div className="fixed inset-0 z-[-1] bg-noise" />
        
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
