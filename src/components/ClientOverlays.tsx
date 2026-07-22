"use client";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });
const WishlistDrawer = dynamic(() => import("@/components/WishlistDrawer"), { ssr: false });
const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"), { ssr: false });
const CookieBanner = dynamic(() => import("@/components/CookieBanner"), { ssr: false });
const DeferredPWA = dynamic(() => import("@/components/DeferredPWA"), { ssr: false });
const Toaster = dynamic(() => import("react-hot-toast").then((m) => m.Toaster), { ssr: false });

export default function ClientOverlays() {
  return (
    <>
      <CartDrawer />
      <WishlistDrawer />
      <WhatsAppButton />
      <CookieBanner />
      <DeferredPWA />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#111010",
            color: "#F2EDE6",
            borderRadius: "0",
            border: "1px solid #D5CFC8",
          },
        }}
      />
    </>
  );
}
