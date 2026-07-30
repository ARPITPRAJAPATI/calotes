"use client"; // Marks this component as client component code (uses page pathname location hooks)

// Import path locator hook
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
// Import MessageCircle icon
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const pathname = usePathname(); // Track active route path location

  // Hide the floating WhatsApp helper button on administrative panel paths
  if (pathname?.startsWith("/admin")) {
    return null; // Return empty rendering (no layout mount)
  }

  // Pre-filled WhatsApp message details
  const message = "Hi Calotes, I am looking for pre-loved vintage pieces!";
  const whatsappUrl = `https://wa.me/919999999999?text=${encodeURIComponent(message)}`;

  return (
    // Floating CTA button link positioned fixed in the bottom-right corner
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[90] bg-terracotta text-bg p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-terracotta/80 transition-colors"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={28} />
    </motion.a>
  );
}
