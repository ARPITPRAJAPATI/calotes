import React from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Contact Us | Calotes Vintage",
  description: "Contact Calotes Vintage customer support team.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-bg pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto text-text">
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter mb-8">
        Contact Us
      </h1>
      <p className="text-xs uppercase tracking-widest text-muted mb-12">
        We are here to assist with orders, sizing, or store inquiries.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border/40 pb-12 mb-12">
        <div className="p-6 bg-bg-warm border border-border space-y-3">
          <div className="flex items-center gap-3 text-terracotta">
            <Mail size={20} />
            <h3 className="font-display font-bold uppercase tracking-tight text-text text-sm">Customer Support Email</h3>
          </div>
          <p className="text-xs text-muted font-mono">
            <a href="mailto:orders@calotes.in" className="hover:text-terracotta transition-colors">
              orders@calotes.in
            </a>
          </p>
          <p className="text-[10px] uppercase text-muted tracking-widest">Responds within 24 hours</p>
        </div>

        <div className="p-6 bg-bg-warm border border-border space-y-3">
          <div className="flex items-center gap-3 text-terracotta">
            <MapPin size={20} />
            <h3 className="font-display font-bold uppercase tracking-tight text-text text-sm">Location</h3>
          </div>
          <p className="text-xs text-muted uppercase tracking-wider font-medium">
            Calotes Vintage Studio, India
          </p>
          <p className="text-[10px] uppercase text-muted tracking-widest">Official Archive & Curation Hub</p>
        </div>
      </div>

      <div>
        <Link href="/" className="btn-outline">
          Return to Home
        </Link>
      </div>
    </main>
  );
}
