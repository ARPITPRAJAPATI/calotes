'use client'; // Flags this file as a client component to handle form controls, live presets color binding, files uploads, and client toasts

// Import React hooks
import { useState, useEffect } from 'react';
// Import hot toast notification alerts
import toast from 'react-hot-toast';
// Import UI vector graphics icons
import { Loader2, Save, Upload } from 'lucide-react';
import ImageCropperModal from '@/components/ImageCropperModal';

export default function AdminSettingsPage() {
  // Bind form configurations to individual state hooks
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [shippingRate, setShippingRate] = useState('0');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#C85a32');

  // Loading state trackers
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Image Cropper State
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);

  // Preset accent configurations matching brand palettes
  const presets = [
    { name: 'Terracotta', color: '#C85a32' },
    { name: 'Emerald', color: '#0F5132' },
    { name: 'Cobalt', color: '#0D6EFD' },
    { name: 'Cyberpunk', color: '#FFC107' },
    { name: 'Monochrome', color: '#000000' },
  ];

  // Fetch settings from database configurations on mounts
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
    } catch {
      toast.error('Error fetching website settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Intercept file selection and open Cropper Modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropperFile(file);
    setIsCropperOpen(true);
    e.target.value = '';
  };

  // Upload cropped or original hero banner image using multipart/form-data POST endpoints
  const handleCropComplete = async (fileToUpload: File) => {
    setIsUploading(true);
    setIsCropperOpen(false);
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setHeroImageUrl(data.url); // Bind returned Cloudinary URL
        toast.success('Hero image uploaded successfully!');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch {
      toast.error('An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit form values to updates setting API routes
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
    } catch {
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    // Spinner screen
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-xs font-black uppercase tracking-widest text-text gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        <span>Loading Store Configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-4xl">
      {/* Page Header info */}
      <div className="border-b border-border pb-4">
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter">
          Store Configuration
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-1">
          Customize global layouts, copy, theme colors, and shipping rules manually.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Hero branding parameters */}
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

          {/* Banner configuration settings */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
              Hero Background Image
            </label>

            {heroImageUrl && (
              // Live image preview
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
                  onChange={handleFileSelect}
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

        {/* Section 2: Accent palette configurations */}
        <div className="bg-card border border-border p-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2 text-text">
            Branding Palette & Aesthetics
          </h2>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
              Global Accent Color (Used for buttons, links, highlight details)
            </label>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Color Picker input */}
              <div className="flex items-center gap-3 border border-border p-3 bg-bg">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 cursor-pointer bg-transparent border-0 outline-none"
                />
                <span className="text-xs font-mono font-bold uppercase">{accentColor}</span>
              </div>

              {/* Preset Buttons loop list */}
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setAccentColor(preset.color)} // Override color selection
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

            {/* Custom HEX code input */}
            <div className="flex gap-4 items-center max-w-xs pt-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 border border-border bg-bg cursor-pointer rounded p-1"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1 bg-bg border border-border px-4 py-2.5 text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-text uppercase"
                placeholder="#C85A32"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Contact & Social links */}
        <div className="bg-card border border-border p-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2 text-text">
            Contact & Social Connections
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
                Support Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@calotes.com"
                className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/calotes.vintage"
                className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Shipping Fee logic */}
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

        {/* Submit Save changes buttons */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-text text-bg py-4 text-[10px] font-black uppercase tracking-widest hover:bg-bg-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving Configurations...' : 'Save Configuration'}
        </button>
      </form>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        file={cropperFile}
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setCropperFile(null);
        }}
        onCropComplete={handleCropComplete}
        onSkipCrop={handleCropComplete}
        defaultAspectRatio={16 / 9}
        title="Crop Hero Banner Image"
      />
    </div>
  );
}
