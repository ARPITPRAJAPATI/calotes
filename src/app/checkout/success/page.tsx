"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-6 text-center py-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-12 max-w-lg"
      >
        <div className="w-20 h-20 border border-accent flex items-center justify-center mx-auto bg-card">
          <CheckCircle2 size={40} strokeWidth={0.8} className="text-accent" />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4">Order Confirmed</p>
          <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter leading-[0.9]">
            Thank You<br />for Shopping <br />
            <span className="text-outline italic" style={{ WebkitTextStroke: '1px var(--color-text)' }}>the Archive.</span>
          </h1>
        </div>

        {orderId && (
          <div className="border-y border-border py-6 bg-card">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">
              Order Reference: <span className="text-text ml-2">{orderId.slice(-8).toUpperCase()}</span>
            </p>
          </div>
        )}

        <p className="text-xs font-bold uppercase tracking-widest text-muted max-w-sm mx-auto">
          We are preparing your garments. A confirmation email has been sent.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <button 
            onClick={() => router.back()}
            className="awwwards-btn inline-flex items-center gap-2"
          >
            Back
          </button>
          <Link href="/shop" className="awwwards-btn-accent inline-flex items-center gap-2">
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="h-[70vh] flex items-center justify-center" />}>
      <SuccessContent />
    </Suspense>
  );
}
