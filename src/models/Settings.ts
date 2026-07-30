// Import mongoose utilities, Schema builder, model, and models caching registry from mongoose package
import mongoose, { Schema, model, models } from 'mongoose';

// Define the SettingsSchema details for configuring dynamic store properties (headline changes, colors, contact details)
const SettingsSchema = new Schema(
  {
    // Headline text rendering in the homepage hero slide
    heroHeadline: { type: String, default: "Adapt. Stand Out. Be Calotes." },
    // Subtext description under the hero headline
    heroSubtext: { type: String, default: "Hand-picked vintage & streetwear. For the Indian modern icon." },
    // Banner scroll notification text displaying at the very top of pages
    announcementText: { type: String, default: "Free Shipping Pan India · Authentic Pre-Loved Streetwear" },
    // Primary support mailbox contact email address
    contactEmail: { type: String, default: "contact@calotesvintage.com" },
    // Redirection URL linked to Instagram profile page
    instagramUrl: { type: String, default: "https://instagram.com/calotes.vintage" },
    // Shipping cost applied to checkout order totals (0 represents free shipping)
    shippingRate: { type: Number, default: 0 },
    // Main image file URL displayed as the homepage background on desktop/PC
    heroImageUrl: { type: String, default: "/images/hero-pc.jpg" },
    // Image file URL displayed as the homepage background on mobile devices
    heroImageMobileUrl: { type: String, default: "/images/hero-mobile.jpg" },
    // Hex code string variable used to style UI components dynamically (defaults to terracotta orange)
    accentColor: { type: String, default: "#C85a32" },
  },
  // Automatically track createdAt and updatedAt stamps for audit changes
  { timestamps: true }
);

// Cache compiled model instance or compile a new model matching 'Settings' key
const Settings = models.Settings || model('Settings', SettingsSchema);

// Export compiled Settings model
export default Settings;

