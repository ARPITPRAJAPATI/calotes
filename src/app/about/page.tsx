import connectDB from "@/lib/db";
import Settings from "@/models/Settings";
import AboutClient from "./AboutClient";

export const dynamic = "force-dynamic";

// Default brand story images used as fallback
const DEFAULT_BRAND_IMAGES = [
  { url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200", alt: "Vintage Sourcing" },
  { url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800", alt: "Vintage Style" },
];

// Default philosophy image fallback
const DEFAULT_PHILOSOPHY_IMAGE = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=70&w=600&auto=format";

export default async function AboutPage() {
  await connectDB();
  const settings = await Settings.findOne().lean() as any;
  const rawBrand = settings?.brandStoryImages ?? [];

  const hasDbImages = rawBrand.some((img: any) => img.url?.trim());
  const brandImages = hasDbImages
    ? rawBrand.filter((img: any) => img.url?.trim()).map((img: any) => ({
        url: img.url,
        alt: img.alt || "",
      }))
    : DEFAULT_BRAND_IMAGES;

  // Philosophy image = first brand story image if available, otherwise fallback
  const philosophyImage = brandImages[0]?.url || DEFAULT_PHILOSOPHY_IMAGE;

  return <AboutClient brandImages={brandImages} philosophyImage={philosophyImage} />;
}
