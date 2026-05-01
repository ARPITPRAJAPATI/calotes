import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop The Archive | Calotes Vintage",
  description: "Browse our curated collection of authentic vintage streetwear, designer archive, and rare pieces.",
  openGraph: {
    title: "Shop The Archive | Calotes Vintage",
    description: "Browse our curated collection of authentic vintage streetwear.",
    type: "website",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
