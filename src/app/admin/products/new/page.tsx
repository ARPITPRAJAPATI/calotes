'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  
  // Product state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('Vintage');
  const [condition, setCondition] = useState('Great');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('1');
  const [isFeatured, setIsFeatured] = useState(false);
  const [pitToPit, setPitToPit] = useState('');
  const [length, setLength] = useState('');
  const [waist, setWaist] = useState('');
  const [tags, setTags] = useState('');

  // UI state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'Free Size'];

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      }
    } catch {
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          uploadedUrls.push(data.url);
        } else {
          toast.error(`Failed to upload ${files[i].name}: ${data.error}`);
        }
      }
      
      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(`Successfully uploaded ${uploadedUrls.length} images!`);
      }
    } catch {
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !slug || !description || !price || !category || images.length === 0) {
      toast.error('Please fill in all required fields and upload at least one image');
      return;
    }

    setIsSubmitting(true);

    const productData = {
      name,
      slug,
      description,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      images,
      category,
      brand,
      condition,
      sizes: selectedSizes,
      sku: sku || undefined,
      stock: parseInt(stock),
      isFeatured,
      measurements: {
        pitToPit: pitToPit || undefined,
        length: length || undefined,
        waist: waist || undefined,
      },
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        toast.success('Archive product cataloged!');
        router.push('/admin/products');
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to catalog product');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Link href="/admin/products" className="text-muted hover:text-text transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
          Catalog New Piece
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left column - main fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Piece Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., 90s Carhartt Active Jacket"
                className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Slug (URL) *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., 90s-carhartt-active-jacket"
                className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Editorial Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the fit, history, and character of this archive piece..."
                rows={6}
                className="w-full bg-card border border-border p-4 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Retail Price (INR) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2499"
                  className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Compare At Price (Sale)</label>
                <input
                  type="number"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="3499"
                  className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                />
              </div>
            </div>

            {/* Sizes Checkboxes */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">Available Sizes *</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-2 border text-[10px] font-black uppercase tracking-wider transition-colors ${
                      selectedSizes.includes(size)
                        ? 'bg-text text-bg border-text'
                        : 'bg-card border-border text-muted hover:border-text'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Measurements */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">Measurements (Optional)</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Pit-To-Pit (in)</label>
                  <input
                    type="text"
                    value={pitToPit}
                    onChange={(e) => setPitToPit(e.target.value)}
                    placeholder="23"
                    className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Length (in)</label>
                  <input
                    type="text"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="27"
                    className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Waist (in)</label>
                  <input
                    type="text"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    placeholder="32"
                    className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - details + image uploads */}
        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2">
            Collection Details
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">Collection Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors cursor-pointer"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Vintage / Nike / Carhartt"
                className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted block">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors cursor-pointer"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Great">Great</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Stock Quantity</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">SKU (Unique Identification)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="CV-CARH-001"
                className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="streetwear, rare, workwear"
                className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 py-2 border-y border-border">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-text"
              />
              <label htmlFor="isFeatured" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">
                Feature on Homepage
              </label>
            </div>

            {/* Multi-Image Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">Images (At least 1) *</label>
              
              <div className="grid grid-cols-3 gap-2">
                {images.map((url, idx) => (
                  <div key={idx} className="relative group aspect-[3/4] border border-border bg-white overflow-hidden">
                    <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-text text-bg text-[8px] font-bold px-1 py-0.5">
                      {idx === 0 ? 'COVER' : idx + 1}
                    </div>
                  </div>
                ))}

                <label className="border border-dashed border-border aspect-[3/4] flex flex-col items-center justify-center cursor-pointer hover:border-text transition-colors group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Upload size={18} className="text-muted group-hover:text-text mb-1 transition-colors animate-bounce" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-center text-muted group-hover:text-text transition-colors px-1">
                    {isUploading ? 'Uploading...' : 'Add Images'}
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full bg-text text-bg py-4 text-[10px] font-black uppercase tracking-widest hover:bg-bg-dark transition-colors disabled:opacity-50 mt-4"
            >
              {isSubmitting ? 'Cataloging Piece...' : 'Catalog Piece'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
