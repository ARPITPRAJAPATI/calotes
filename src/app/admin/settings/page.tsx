'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Save, Upload } from 'lucide-react';

export default function AdminSettingsPage() {
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [shippingRate, setShippingRate] = useState('0');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#C85a32');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const presets = [
    { name: 'Terracotta', color: '#C85a32' },
    { name: 'Emerald', color: '#0F5132' },
    { name: 'Cobalt', color: '#0D6EFD' },
    { name: 'Cyberpunk', color: '#FFC107' },
    { name: 'Monochrome', color: '#000000' },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok && data) {
        setHeroHeadline(data.heroHeadline || '');
        setHeroSubtext(data.heroSubtext || '');
        setAnnouncementText(data.announcementText || '');
        setContactEmail(data.contactEmail || '');
        setInstagramUrl(data.instagramUrl || '');
        setShippingRate(data.shippingRate !== undefined ? data.shippingRate.toString() : '0');
        setHeroImageUrl(data.heroImageUrl || '');
        setAccentColor(data.accentColor || '#C85a32');
      } else {
        toast.error('Failed to load settings');
      }
    } catch (err) {
      toast.error('Error fetching website settings');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setHeroImageUrl(data.url);
        toast.success('Hero image uploaded successfully!');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (err) {
      toast.error('An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const settingsData = {
      heroHeadline,
      heroSubtext,
      announcementText,
      contactEmail,
      instagramUrl,
      shippingRate: parseFloat(shippingRate) || 0,
      heroImageUrl,
      accentColor,
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });

      if (res.ok) {
        toast.success('Website configuration saved successfully!');
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to save settings');
      }
    } catch (err) {
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-xs font-black uppercase tracking-widest text-muted gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-text" />
        Loading Store Configurations...
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-4xl">
      <div className="border-b border-border pb-4">
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter">
          Store Configuration
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-1">
          Customize global layouts, copy, theme colors, and shipping rules manually.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Hero Settings */}
        <div className="bg-card border border-border p-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2 text-text">
            Landing Hero & Branding
          </h2>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
              Hero Headline (Main Copy)
            </label>
            <input
              type="text"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              placeholder="e.g., Adapt. Stand Out. Be Calotes."
              className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
              Hero Subtext
            </label>
            <textarea
              value={heroSubtext}
              onChange={(e) => setHeroSubtext(e.target.value)}
              placeholder="e.g., Hand-picked vintage & streetwear. For the Indian modern icon."
              rows={3}
              className="w-full bg-bg border border-border p-4 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors resize-none"
              required
            />
          </div>

          {/* Cloudinary Hero Banner Image */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
              Hero Background Image
            </label>

            {heroImageUrl && (
              <div className="relative aspect-video max-w-md overflow-hidden bg-bg border border-border">
                <img
                  src={heroImageUrl}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 border border-border px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-bg transition-colors">
                <Upload size={14} />
                {isUploading ? 'Uploading Banner...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              <input
                type="text"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="Or paste hero image URL here..."
                className="flex-1 bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Website Theme & Color Branding */}
        <div className="bg-card border border-border p-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2 text-text">
            Branding Palette & Aesthetics
          </h2>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
              Global Accent Color (Used for buttons, links, highlight details)
            </label>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Color Picker */}
              <div className="flex items-center gap-3 border border-border p-3 bg-bg">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 cursor-pointer bg-transparent border-0 outline-none"
                />
                <span className="text-xs font-mono font-bold uppercase">{accentColor}</span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setAccentColor(preset.color)}
                    className="flex items-center gap-2 border border-border px-3 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-bg transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-border/40"
                      style={{ backgroundColor: preset.color }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Storewide Tickers & Announcements */}
        <div className="bg-card border border-border p-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2 text-text">
            Announcements & Promotion
          </h2>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
              Running Announcement Bar Text
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g., Free Shipping Pan India · Authentic Pre-Loved Streetwear"
              className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
              required
            />
          </div>
        </div>

        {/* Section 4: Contact & Links */}
        <div className="bg-card border border-border p-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2 text-text">
            Support & Community Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@calotesvintage.com"
                className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
                Instagram URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/calotes.vintage"
                className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 5: Shipping Rules */}
        <div className="bg-card border border-border p-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2 text-text">
            Fulfillment & Shipping Rules
          </h2>

          <div className="space-y-1 max-w-xs">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
              Flat Shipping Fee (INR)
            </label>
            <input
              type="number"
              value={shippingRate}
              onChange={(e) => setShippingRate(e.target.value)}
              placeholder="0"
              className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-text text-bg py-4 text-[10px] font-black uppercase tracking-widest hover:bg-bg-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving Configurations...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
