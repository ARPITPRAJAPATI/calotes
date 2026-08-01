import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Calotes Vintage",
  description: "Privacy policy for Calotes Vintage customer data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto text-text">
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter mb-8">
        Privacy Policy
      </h1>
      <p className="text-xs uppercase tracking-widest text-muted mb-8">
        Last updated: August 2026
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-muted font-medium">
        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            1. Data Collection
          </h2>
          <p>
            Calotes Vintage collects personal details provided during account creation and checkout, such as your name, email address, phone number, and delivery address. This information is used strictly to process orders and provide customer support.
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            2. Payment Security
          </h2>
          <p>
            Payment transactions are handled securely by Razorpay. Calotes Vintage does not store credit card details, UPI PINs, or banking credentials on our servers.
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            3. Communications
          </h2>
          <p>
            We use Resend to transmit transactional emails such as order confirmations, invoices, and registration OTPs. You may opt out of non-essential emails at any time.
          </p>
        </section>

        <section className="space-y-3 border-b border-border/40 pb-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-text">
            4. Contact Us
          </h2>
          <p>
            If you have questions regarding your data privacy, reach out to us at{" "}
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
