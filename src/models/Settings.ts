import mongoose, { Schema, model, models } from 'mongoose';

const SettingsSchema = new Schema(
  {
    heroHeadline: { type: String, default: "Adapt. Stand Out. Be Calotes." },
    heroSubtext: { type: String, default: "Hand-picked vintage & streetwear. For the Indian modern icon." },
    announcementText: { type: String, default: "Free Shipping Pan India · Authentic Pre-Loved Streetwear" },
    contactEmail: { type: String, default: "contact@calotesvintage.com" },
    instagramUrl: { type: String, default: "https://instagram.com/calotes.vintage" },
    shippingRate: { type: Number, default: 0 },
    heroImageUrl: { type: String, default: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1600" },
    accentColor: { type: String, default: "#C85a32" },
  },
  { timestamps: true }
);

const Settings = models.Settings || model('Settings', SettingsSchema);

export default Settings;
