"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/919999999999?text=Hi%20Calotes,%20I'm%20looking%20for%20some%20vintage%20pieces!"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[90] bg-text text-bg p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-bg-dark border border-border transition-colors"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={28} />
    </motion.a>
  );
}
