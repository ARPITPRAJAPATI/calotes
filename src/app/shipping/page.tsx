import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Shipping & Delivery Policy | Calotes Vintage",
  description: "Shipping and delivery policies for Calotes Vintage.",
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-bg pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto text-text">
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter mb-8">
        Shipping Policy
      </h1>
      <p className="text-xs uppercase tracking-widest text-muted mb-8">
        Last updated: August 2026
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-muted font-medium">
        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            1. Order Dispatch & Delivery Time
          </h2>
          <p>
            All orders placed on Calotes Vintage are packed and dispatched within 24 to 48 hours. Estimated shipping times across India are between 3 to 7 business days depending on destination PIN code.
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            2. Shipping Charges
          </h2>
          <p>
            Standard express shipping is available across all serviceable Indian PIN codes. Shipping charges (if applicable) are displayed at checkout prior to payment.
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            3. Order Tracking
          </h2>
          <p>
            Upon order dispatch, a tracking link and courier details will be sent to your registered email address (`orders@calotes.in`).
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            4. Support Email
          </h2>
          <p>
            For delivery inquiries or order status updates, email us at{" "}
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
