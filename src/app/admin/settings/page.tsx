'use client'; // Flags this file as a client component to handle form controls, live presets color binding, files uploads, and client toasts

// Import React hooks
import { useState, useEffect, useRef } from 'react';
// Import hot toast notification alerts
import toast from 'react-hot-toast';
// Import UI vector graphics icons
import { Loader2, Save, Upload, Plus, Trash2, GripVertical, ImageIcon } from 'lucide-react';
import ImageCropperModal from '@/components/ImageCropperModal';

export default function AdminSettingsPage() {
  // Bind form configurations to individual state hooks
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [shippingRate, setShippingRate] = useState('0');
  const [heroImageUrl, setHeroImageUrl] = useState('/images/hero-pc.png');
  const [heroImageMobileUrl, setHeroImageMobileUrl] = useState('/images/hero-mobile.jpg');
  const [accentColor, setAccentColor] = useState('#C85a32');

  // Loading state trackers
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Image Cropper State
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<'desktop' | 'mobile'>('desktop');
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);

  // Lookbook images state
  type LookbookImage = { url: string; title: string; desc: string };
  const [lookbookImages, setLookbookImages] = useState<LookbookImage[]>([]);
  const [uploadingLookbookIdx, setUploadingLookbookIdx] = useState<number | null>(null);
  const lookbookFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingLookbookIdx, setPendingLookbookIdx] = useState<number | null>(null);

  // Brand story images state
  type BrandStoryImage = { url: string; alt: string };
  const [brandStoryImages, setBrandStoryImages] = useState<BrandStoryImage[]>([]);
  const [uploadingBrandIdx, setUploadingBrandIdx] = useState<number | null>(null);
  const brandFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingBrandIdx, setPendingBrandIdx] = useState<number | null>(null);

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
        setHeroImageUrl(data.heroImageUrl || '/images/hero-pc.png');
        setHeroImageMobileUrl(data.heroImageMobileUrl || '/images/hero-mobile.jpg');
        setAccentColor(data.accentColor || '#C85a32');
        setLookbookImages(data.lookbookImages || []);
        setBrandStoryImages(data.brandStoryImages || []);
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

  // Intercept file selection for Desktop or Mobile
  const handleFileSelect = (target: 'desktop' | 'mobile', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropTarget(target);
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
      if (res.ok && data.url) {
        if (cropTarget === 'desktop') {
          setHeroImageUrl(data.url);
          toast.success('Desktop Hero image uploaded successfully!');
        } else {
          setHeroImageMobileUrl(data.url);
          toast.success('Mobile Hero image uploaded successfully!');
        }
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
      heroImageMobileUrl,
      accentColor,
      lookbookImages,
      brandStoryImages,
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

          {/* Banner configuration settings - Dual Desktop & Mobile Uploads */}
          <div className="space-y-6 pt-6 border-t border-border/50">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terracotta">
              Hero Banner Assets (PC vs Mobile Devices)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desktop / PC Banner Upload */}
              <div className="space-y-3 bg-bg border border-border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text block">
                    Desktop / PC Banner (16:9 Widescreen)
                  </label>
                  <span className="text-[9px] font-mono text-muted uppercase">Recommended: 1920x1080</span>
                </div>

                {heroImageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-black border border-border rounded">
                    <img
                      src={heroImageUrl}
                      alt="Desktop Hero preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full border border-dashed border-border flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted">
                    No Desktop Banner Uploaded
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  <label className="flex items-center gap-2 border border-border px-3 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-card transition-colors shrink-0">
                    <Upload size={13} />
                    {isUploading && cropTarget === 'desktop' ? 'Uploading...' : 'Upload PC Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('desktop', e)}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  <input
                    type="text"
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="Or paste PC image URL..."
                    className="flex-1 bg-card border border-border px-3 py-2.5 text-[11px] font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                  />
                </div>
              </div>

              {/* Mobile Device Banner Upload */}
              <div className="space-y-3 bg-bg border border-border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text block">
                    Mobile Device Banner (3:4 Vertical Portrait)
                  </label>
                  <span className="text-[9px] font-mono text-muted uppercase">Recommended: 900x1200</span>
                </div>

                {heroImageMobileUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-black border border-border rounded">
                    <img
                      src={heroImageMobileUrl}
                      alt="Mobile Hero preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full border border-dashed border-border flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted">
                    Fallback: Uses PC Banner
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  <label className="flex items-center gap-2 border border-border px-3 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-card transition-colors shrink-0">
                    <Upload size={13} />
                    {isUploading && cropTarget === 'mobile' ? 'Uploading...' : 'Upload Mobile Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('mobile', e)}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  <input
                    type="text"
                    value={heroImageMobileUrl}
                    onChange={(e) => setHeroImageMobileUrl(e.target.value)}
                    placeholder="Or paste Mobile image URL..."
                    className="flex-1 bg-card border border-border px-3 py-2.5 text-[11px] font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                  />
                </div>
              </div>
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

        {/* Section 6: Lookbook Images */}
        <div className="bg-card border border-border p-8 space-y-6">
          <div className="border-b border-border pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text">
                Lookbook Images
              </h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted mt-1">
                Manage the images shown in the Lookbook page & homepage teaser (up to 12 images)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLookbookImages(prev => [...prev, { url: '', title: `Look ${String(prev.length + 1).padStart(2, '0')}`, desc: '' }])}
              className="flex items-center gap-2 border border-dashed border-terracotta px-4 py-2 text-[9px] font-black uppercase tracking-widest text-terracotta hover:bg-terracotta/10 transition-colors"
            >
              <Plus size={12} /> Add Image
            </button>
          </div>

          {/* Hidden file input for lookbook uploads */}
          <input
            ref={lookbookFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file || pendingLookbookIdx === null) return;
              const idx = pendingLookbookIdx;
              setUploadingLookbookIdx(idx);
              const formData = new FormData();
              formData.append('file', file);
              try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (res.ok && data.url) {
                  setLookbookImages(prev => prev.map((img, i) => i === idx ? { ...img, url: data.url } : img));
                  toast.success('Lookbook image uploaded!');
                } else {
                  toast.error(data.error || 'Upload failed');
                }
              } catch { toast.error('Upload error'); }
              finally { setUploadingLookbookIdx(null); setPendingLookbookIdx(null); }
            }}
          />

          {lookbookImages.length === 0 ? (
            <div className="border border-dashed border-border flex flex-col items-center justify-center py-12 text-center text-muted">
              <ImageIcon size={32} className="mb-3 opacity-30" />
              <p className="text-[10px] font-black uppercase tracking-widest">No Lookbook Images Yet</p>
              <p className="text-[9px] font-medium uppercase tracking-widest mt-1">Click "Add Image" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lookbookImages.map((img, i) => (
                <div key={i} className="flex gap-3 items-start bg-bg border border-border p-3">
                  {/* Drag handle + index */}
                  <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                    <GripVertical size={14} className="text-muted/40" />
                    <span className="text-[9px] font-black text-muted/50 font-mono">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  {/* Thumbnail */}
                  <div className="w-14 h-20 shrink-0 bg-bg-warm border border-border overflow-hidden flex items-center justify-center">
                    {img.url ? (
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={16} className="text-muted/30" />
                    )}
                  </div>
                  {/* Fields */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      type="text"
                      value={img.url}
                      onChange={(e) => setLookbookImages(prev => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                      placeholder="Image URL or upload below"
                      className="w-full bg-card border border-border px-3 py-2 text-[10px] font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={img.title}
                        onChange={(e) => setLookbookImages(prev => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                        placeholder="Title (e.g. Look 01)"
                        className="bg-card border border-border px-3 py-2 text-[10px] font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                      />
                      <input
                        type="text"
                        value={img.desc}
                        onChange={(e) => setLookbookImages(prev => prev.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))}
                        placeholder="Desc (e.g. 90s Grunge)"
                        className="bg-card border border-border px-3 py-2 text-[10px] font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                      />
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={uploadingLookbookIdx === i}
                      onClick={() => { setPendingLookbookIdx(i); lookbookFileInputRef.current?.click(); }}
                      className="flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-card transition-colors disabled:opacity-40"
                    >
                      {uploadingLookbookIdx === i ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                      {uploadingLookbookIdx === i ? 'Uploading' : 'Upload'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLookbookImages(prev => prev.filter((_, j) => j !== i))}
                      className="flex items-center gap-1.5 border border-red-800/40 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-950/20 transition-colors"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 7: Brand Story Images */}
        <div className="bg-card border border-border p-8 space-y-6">
          <div className="border-b border-border pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text">
                Brand Story Images
              </h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted mt-1">
                Images displayed in the About / Brand Story page hero grid & philosophy section
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBrandStoryImages(prev => [...prev, { url: '', alt: '' }])}
              className="flex items-center gap-2 border border-dashed border-terracotta px-4 py-2 text-[9px] font-black uppercase tracking-widest text-terracotta hover:bg-terracotta/10 transition-colors"
            >
              <Plus size={12} /> Add Image
            </button>
          </div>

          {/* Hidden file input for brand story uploads */}
          <input
            ref={brandFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file || pendingBrandIdx === null) return;
              const idx = pendingBrandIdx;
              setUploadingBrandIdx(idx);
              const formData = new FormData();
              formData.append('file', file);
              try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (res.ok && data.url) {
                  setBrandStoryImages(prev => prev.map((img, i) => i === idx ? { ...img, url: data.url } : img));
                  toast.success('Brand story image uploaded!');
                } else {
                  toast.error(data.error || 'Upload failed');
                }
              } catch { toast.error('Upload error'); }
              finally { setUploadingBrandIdx(null); setPendingBrandIdx(null); }
            }}
          />

          {brandStoryImages.length === 0 ? (
            <div className="border border-dashed border-border flex flex-col items-center justify-center py-12 text-center text-muted">
              <ImageIcon size={32} className="mb-3 opacity-30" />
              <p className="text-[10px] font-black uppercase tracking-widest">No Brand Story Images Yet</p>
              <p className="text-[9px] font-medium uppercase tracking-widest mt-1">Click "Add Image" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {brandStoryImages.map((img, i) => (
                <div key={i} className="flex gap-3 items-start bg-bg border border-border p-3">
                  {/* Index badge */}
                  <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                    <GripVertical size={14} className="text-muted/40" />
                    <span className="text-[9px] font-black text-muted/50 font-mono">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  {/* Thumbnail */}
                  <div className="w-14 h-16 shrink-0 bg-bg-warm border border-border overflow-hidden flex items-center justify-center">
                    {img.url ? (
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={16} className="text-muted/30" />
                    )}
                  </div>
                  {/* Fields */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      type="text"
                      value={img.url}
                      onChange={(e) => setBrandStoryImages(prev => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                      placeholder="Image URL or upload below"
                      className="w-full bg-card border border-border px-3 py-2 text-[10px] font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                    />
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => setBrandStoryImages(prev => prev.map((x, j) => j === i ? { ...x, alt: e.target.value } : x))}
                      placeholder="Alt text (e.g. Vintage Sourcing)"
                      className="w-full bg-card border border-border px-3 py-2 text-[10px] font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                    />
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={uploadingBrandIdx === i}
                      onClick={() => { setPendingBrandIdx(i); brandFileInputRef.current?.click(); }}
                      className="flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-card transition-colors disabled:opacity-40"
                    >
                      {uploadingBrandIdx === i ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                      {uploadingBrandIdx === i ? 'Uploading' : 'Upload'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrandStoryImages(prev => prev.filter((_, j) => j !== i))}
                      className="flex items-center gap-1.5 border border-red-800/40 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-950/20 transition-colors"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
        defaultAspectRatio={cropTarget === 'desktop' ? 16 / 9 : 3 / 4}
        title={cropTarget === 'desktop' ? 'Crop PC / Desktop Widescreen Banner (16:9)' : 'Crop Mobile Device Banner (3:4)'}
      />
    </div>
  );
}
