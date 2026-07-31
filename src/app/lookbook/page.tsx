import connectDB from "@/lib/db";
import Settings from "@/models/Settings";
import LookbookClient from "./LookbookClient";

// Default fallback images used when no lookbook images are configured in admin
const DEFAULT_LOOKS = [
  { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900", title: "Look 01", desc: "Oversized Tailoring" },
  { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=900", title: "Look 02", desc: "90s Grunge" },
  { url: "https://images.unsplash.com/photo-1556905503-432851888e7b?q=80&w=900", title: "Look 03", desc: "Utilitarian Archive" },
  { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=900", title: "Look 04", desc: "Denim on Denim" },
  { url: "https://images.unsplash.com/photo-1529139572765-798728d32ec4?q=80&w=900", title: "Look 05", desc: "Y2K Sportswear" },
  { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900", title: "Look 06", desc: "Classic Americana" },
  { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=900", title: "Look 07", desc: "Warm Winter Layers" },
  { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=900", title: "Look 08", desc: "Military Aesthetic" },
];

export const dynamic = "force-dynamic";

export default async function LookbookPage() {
  await connectDB();
  const settings = await Settings.findOne().lean() as any;
  const rawLooks = settings?.lookbookImages ?? [];

  // Use DB images if at least one has a URL, otherwise fall back to defaults
  const hasDbImages = rawLooks.some((l: any) => l.url?.trim());
  const looks = hasDbImages
    ? rawLooks.filter((l: any) => l.url?.trim()).map((l: any) => ({
        url: l.url,
        title: l.title || "",
        desc: l.desc || "",
      }))
    : DEFAULT_LOOKS;

  return <LookbookClient looks={looks} />;
}
