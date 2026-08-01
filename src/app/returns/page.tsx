import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Refund & Return Policy | Calotes Vintage",
  description: "Refund and return policies for Calotes Vintage.",
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-bg pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto text-text">
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter mb-8">
        Refund & Return Policy
      </h1>
      <p className="text-xs uppercase tracking-widest text-muted mb-8">
        Last updated: August 2026
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-muted font-medium">
        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            1. Return Eligibility
          </h2>
          <p>
            As Calotes Vintage curates 1-of-1 authentic vintage pieces, returns are accepted within 7 days of receipt if the product received is damaged or differs significantly from the catalog description.
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            2. Refund Process
          </h2>
          <p>
            Once returned items are inspected, approved refunds will be credited back to your original payment source (UPI/Bank/Card) via Razorpay within 5 to 7 business days.
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            3. Initiate Return
          </h2>
          <p>
            To request a return or exchange, please email your order ID and unboxing photo/video to{" "}
            <a href="mailto:orders@calotes.in" className="text-terracotta underline">
              orders@calotes.in
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="btn-outline">
          Return to Home
        </Link>
      </div>
    </main>
  );
}
