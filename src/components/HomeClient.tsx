"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import ProductImageSlider from "@/components/ProductImageSlider";
import SafeImage from "@/components/SafeImage";

const InstagramIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Insta lookbook teaser assets
const INSTA_IMGS = [
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=70&w=350&auto=format",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=70&w=350&auto=format",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=70&w=350&auto=format",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=70&w=350&auto=format",
  "https://images.unsplash.com/photo-1529139572765-798728d32ec4?q=70&w=350&auto=format",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=70&w=350&auto=format",
];

const INSTAGRAM_POSTS = [
  {
    url: "/images/insta-1.jpg",
    link: "https://www.instagram.com/p/Dbdy-PPyxNl/",
  },
  {
    url: "/images/insta-2.jpg",
    link: "https://www.instagram.com/p/DbdyrpTycjz/",
  },
  {
    url: "/images/insta-3.jpg",
    link: "https://www.instagram.com/p/Dbdx0eXSV4v/",
  },
  {
    url: "/images/insta-4.jpg",
    link: "https://www.instagram.com/p/DbdwGs7SMzR/",
  },
  {
    url: "/images/insta-5.jpg",
    link: "https://www.instagram.com/p/Dbdv_Q1yAmi/",
  },
  {
    url: "/images/insta-6.jpg",
    link: "https://www.instagram.com/p/DbdfgEhkgaa/",
  },
];

// Props received from server component
interface HomeClientProps {
  arrivalsList: any[];
  categoriesList: any[];
  heroHeadline: string;
  heroSubtext: string;
  heroImageUrl: string;
  heroImageMobileUrl?: string;
  lookbookList?: any[];
  storyImageUrl?: string;
  communityPostsList?: any[];
}

export default function HomeClient({
  arrivalsList,
  categoriesList,
  heroHeadline,
  heroSubtext,
  heroImageUrl,
  heroImageMobileUrl,
  lookbookList,
  storyImageUrl,
  communityPostsList,
}: HomeClientProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const headlineParts = heroHeadline.split('.').map(x => x.trim()).filter(Boolean);

  // Story image: storyImageUrl prop or custom Cloudinary story image
  const storyImg = storyImageUrl || "https://res.cloudinary.com/dyyrgid3b/image/upload/v1785506516/calotes-vintage/uwqzmhlwua6vlvnnmber.png";

  // Lookbook images: lookbookList from admin settings / DB or fallback to INSTA_IMGS
  const activeLookbook = (lookbookList && lookbookList.length > 0)
    ? lookbookList
    : INSTA_IMGS.map((url, i) => ({ url, title: `Look ${String(i + 1).padStart(2, '0')}`, desc: '' }));

  // Community posts: always use static INSTAGRAM_POSTS (local assets) to avoid SSR/client mismatch
  const activeCommunity = INSTAGRAM_POSTS;

  return (
    <div suppressHydrationWarning className="w-full flex flex-col">
      {/* ══════════════════════════════════════════════════
          1 · HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative w-full h-[100svh] min-h-[600px] overflow-hidden flex flex-col">
        <div className="absolute inset-0">
          <picture className="absolute inset-0 block w-full h-full">
            <source media="(max-width: 767px)" srcSet={heroImageMobileUrl || heroImageUrl} />
            <source media="(min-width: 768px)" srcSet={heroImageUrl} />
            <img
              src={heroImageUrl}
              alt="Calotes Vintage Hero"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-top md:object-center"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/40 to-bg/80" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center text-center h-full px-6 md:px-12 max-w-[1800px] w-full mx-auto">
          <div className="flex flex-col items-center">
            <p className="section-label mb-6">Premium Pre-Owned · Est. India</p>
            <h1 className="font-display font-bold text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] uppercase tracking-tight leading-[0.85] text-text mb-8 md:mb-12">
              {headlineParts.map((part, index) => {
                if (index === 1) {
                  return (
                    <span key={index} className="block overflow-hidden font-serif italic font-light lowercase tracking-normal text-[0.88em] -mt-1 text-terracotta">
                      {part}.
                    </span>
                  );
                }
                return (
                  <span key={index} className="block overflow-hidden text-text">
                    {part}.
                  </span>
                );
              })}
            </h1>
            <div className="flex flex-col items-center gap-8">
              <p className="text-muted text-[11px] font-medium uppercase tracking-[0.2em] leading-relaxed max-w-sm whitespace-pre-line">
                {heroSubtext}
              </p>
              <Link href="/shop" className="btn-outline px-12 py-5 text-sm tracking-[0.3em]">
                Shop
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-text/40 animate-pulse" />
          <span className="section-label writing-mode-vertical rotate-90 text-text/40">Scroll</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          2 · LATEST ARRIVALS
      ══════════════════════════════════════════════════ */}
      <section className="py-8 md:py-12 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-end justify-between mb-10 md:mb-14">
          <div>
            <p className="section-label mb-3">Fresh In</p>
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none">
              Latest<br />Arrivals
            </h2>
          </div>
          <Link href="/shop" className="hidden sm:flex items-center gap-3 section-label text-muted hover:text-terracotta transition-colors group">
            View All
            <span className="block w-8 h-px bg-muted group-hover:bg-terracotta group-hover:w-12 transition-all duration-500" />
          </Link>
        </div>

        <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pl-6 md:pl-12 pr-6">
          {arrivalsList.map((item, i) => (
            <div
              key={item.productId || i}
              className="product-card group relative snap-start shrink-0 w-[48vw] sm:w-[36vw] md:w-[26vw] lg:w-[20vw] xl:w-[17vw]"
            >
              <Link href={item.href} className="block w-full">
                <div className="relative aspect-[3/4] overflow-hidden bg-bg-warm">
                  <ProductImageSlider images={item.imgs} productName={item.name} />
                  <span className="absolute top-3 left-3 text-[7px] font-bold uppercase tracking-[0.25em] bg-terracotta/90 text-bg px-2 py-1 z-10">
                    Pre-Loved
                  </span>
                </div>
                <div className="p-3 md:p-4 flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-wide leading-tight truncate">{item.name}</h3>
                    <p className="text-[8px] text-muted font-medium uppercase tracking-widest mt-0.5">{item.tag}</p>
                  </div>
                  <p className="text-[9px] md:text-[10px] font-black text-terracotta shrink-0">{item.priceFormatted}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    image: item.img,
                    slug: item.slug,
                    category: item.tag,
                  });
                }}
                className="absolute top-1 right-1 z-30 w-11 h-11 flex items-center justify-center text-text hover:text-terracotta hover:scale-110 transition-all duration-300 cursor-pointer min-w-[44px] min-h-[44px]"
                style={{ border: 'none', background: 'transparent', outline: 'none', boxShadow: 'none' }}
                title={mounted && isInWishlist(item.productId) ? "Remove from Wishlist" : "Add to Wishlist"}
                aria-label={mounted && isInWishlist(item.productId) ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart 
                  size={15} 
                  className={mounted && isInWishlist(item.productId) ? "fill-terracotta text-terracotta" : "text-text"} 
                  strokeWidth={2}
                />
              </button>
            </div>
          ))}
          <div className="snap-start shrink-0 w-[48vw] sm:w-[36vw] md:w-[26vw] lg:w-[20vw] xl:w-[17vw] aspect-[3/4] bg-bg-warm border border-border flex flex-col items-center justify-center gap-4 group hover:border-terracotta transition-colors cursor-pointer">
            <Link href="/shop" className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border border-muted group-hover:border-terracotta rounded-full flex items-center justify-center transition-colors">
                <ArrowRight size={16} className="text-muted group-hover:text-terracotta transition-colors" />
              </div>
              <span className="section-label text-muted group-hover:text-terracotta transition-colors">View All</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          3 · SHOP BY CATEGORIES
      ══════════════════════════════════════════════════ */}
      <section className="py-10 md:py-16 bg-bg-warm border-y border-border">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="mb-10 md:mb-14">
            <p className="section-label mb-3">Browse By</p>
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none">
              Categories
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {categoriesList.map((cat, i) => (
              <div key={cat.title}>
                <Link href={cat.href} className="relative block aspect-[3/4] group overflow-hidden bg-bg border border-border">
                  <Image
                    src={cat.img}
                    alt={cat.title}
                    fill
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDQiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjQiIGZpbGw9IiNGQUY3RjIiLz48L3N2Zz4="
                    sizes="(max-width: 640px) 48vw, (max-width: 768px) 36vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover transition-transform duration-[1.6s] group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="font-display font-black text-lg md:text-2xl uppercase tracking-tight text-text leading-none">{cat.title}</h3>
                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-terracotta">Browse</span>
                      <ArrowRight size={10} className="text-terracotta" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/shop" className="btn-outline">See All Categories</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4 · WHY CALOTES (Brand Philosophy / Story)
      ══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-20 px-6 md:px-12 max-w-[1800px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative aspect-[4/5] overflow-hidden bg-bg-warm group border border-border">
            <SafeImage
              src="/images/story-image.png"
              fallbackSrc="https://images.unsplash.com/photo-1550614000-4b95d4ebfa24?q=80&w=800&auto=format&fit=crop"
              alt="Calotes Story - Brand Philosophy"
              loading="lazy"
              className="w-full h-full object-cover md:object-contain object-center transition-transform duration-[2s] group-hover:scale-105"
            />
            <div className="absolute bottom-6 right-6 w-28 h-28 bg-bg/95 border border-border-warm rounded-full flex flex-col items-center justify-center text-center shadow-2xl">
              <p className="font-display font-black text-2xl uppercase tracking-tight leading-none">100%</p>
              <p className="text-[8px] text-muted font-bold tracking-[0.3em] uppercase mt-1">Authentic</p>
            </div>
          </div>
          <div className="flex flex-col gap-8 md:gap-12">
            <div>
              <p className="section-label mb-5">The Philosophy</p>
              <h2 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter leading-[0.85]">
                Authentic.<br />
                <span className="text-terracotta">Curated.</span><br />
                Timeless.
              </h2>
            </div>
            <div className="space-y-5 text-muted text-[11px] uppercase tracking-widest leading-[1.9] font-medium max-w-sm">
              <p>{"We believe true style isn't manufactured — it's discovered. Our selection is curated for those who appreciate the patina of time."}</p>
              <p className="font-serif italic lowercase text-xl text-text tracking-normal normal-case font-light leading-relaxed">
                {"\"Every garment has a story. We help you continue it.\""}
              </p>
            </div>
            <div className="flex gap-4 flex-wrap" suppressHydrationWarning>
              <Link href="/about" className="btn-outline" suppressHydrationWarning>Our Story</Link>
              <Link href="/lookbook" className="btn-outline" suppressHydrationWarning>Lookbook</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          5 · LOOKBOOK TEASER
      ══════════════════════════════════════════════════ */}
      <section className="py-10 md:py-16 bg-bg-warm border-y border-border overflow-hidden cv-auto">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-10 flex justify-between items-end">
          <div>
            <p className="section-label mb-3">Volume I</p>
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none">The Lookbook</h2>
          </div>
          <Link href="/lookbook" className="hidden sm:flex items-center gap-3 section-label text-muted hover:text-terracotta transition-colors group">
            View All
            <span className="block w-8 h-px bg-muted group-hover:bg-terracotta group-hover:w-12 transition-all duration-500" />
          </Link>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pl-6 md:pl-12 pr-6">
          {activeLookbook.map((item, i) => (
            <Link key={i} href="/lookbook" className="shrink-0 w-40 md:w-52 aspect-[3/4] relative group overflow-hidden bg-bg border border-border">
              <SafeImage
                src={item.url}
                fallbackSrc={INSTA_IMGS[i % INSTA_IMGS.length]}
                alt={item.title || `Look ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-bg/50 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
                <span className="text-[8px] font-bold uppercase tracking-widest text-text border border-text/50 px-3 py-1.5">{item.title || `Look ${i + 1}`}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          6 · COMMUNITY / INSTAGRAM FOOTER (EXACT SAME STRUCTURE AS LOOKBOOK)
      ══════════════════════════════════════════════════ */}
      <section suppressHydrationWarning className="py-10 md:py-16 bg-bg border-t border-border overflow-hidden cv-auto">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-10 flex justify-between items-end">
          <div>
            <p className="section-label mb-3">Community</p>
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none">Wear It. Tag It.</h2>
          </div>
          <a
            href="https://instagram.com/calotes.vintage"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-3 section-label text-muted hover:text-terracotta transition-colors group"
          >
            Follow @calotes.vintage
            <span className="block w-8 h-px bg-muted group-hover:bg-terracotta group-hover:w-12 transition-all duration-500" />
          </a>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pl-6 md:pl-12 pr-6">
          {INSTAGRAM_POSTS.map((item, i) => (
            <a
              key={i}
              href={item.link || 'https://instagram.com/calotes.vintage'}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 w-40 md:w-52 aspect-[3/4] relative group overflow-hidden bg-bg-warm border border-border flex items-center justify-center"
            >
              <SafeImage
                src={item.url}
                fallbackSrc={INSTA_IMGS[i % INSTA_IMGS.length]}
                alt={`Community look ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-bg/60 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center z-10">
                <span className="text-[8px] font-bold uppercase tracking-widest text-text border border-text/50 px-3 py-1.5 bg-bg/90">
                  View Post ↗
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
