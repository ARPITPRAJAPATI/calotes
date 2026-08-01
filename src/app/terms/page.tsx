import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | Calotes Vintage",
  description: "Terms and conditions for shopping at Calotes Vintage.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto text-text">
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter mb-8">
        Terms & Conditions
      </h1>
      <p className="text-xs uppercase tracking-widest text-muted mb-8">
        Last updated: August 2026
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-muted font-medium">
        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            1. Overview
          </h2>
          <p>
            Welcome to Calotes Vintage (calotes.in). By accessing or purchasing from our platform, you agree to be bound by these Terms and Conditions. Calotes Vintage provides authentic pre-owned, vintage, and streetwear apparel curated in India.
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            2. Product Nature & Vintage Condition
          </h2>
          <p>
            All garments sold on Calotes Vintage are pre-owned vintage items unless explicitly marked otherwise. Due to their unique nature, minor wear, natural distressing, or age-related marks may be present and are described in each product rating (Excellent, Great, Good, Fair).
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            3. Pricing & Payments
          </h2>
          <p>
            All prices are listed in Indian Rupees (INR) inclusive of applicable taxes. Payments are processed securely via Razorpay (Cards, UPI, Netbanking, Wallets). Orders will be fulfilled upon payment confirmation.
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            4. Shipping & Delivery
          </h2>
          <p>
            Orders are processed within 24-48 hours. Express delivery across India takes 3 to 7 business days depending on location. Tracking information will be emailed to your registered address upon dispatch.
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            5. Contact Information
          </h2>
          <p>
            For questions regarding these terms, please contact us at{" "}
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
