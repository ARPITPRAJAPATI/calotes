'use client'; // Flags this file as a client component to handle dashboard interface interactions, file uploads, and fetches

// Import state and lifecycle hooks
import { useState, useEffect } from 'react';
// Import UI vector graphics icons
import { Plus, Trash2, Upload } from 'lucide-react';
// Import hot toast notification triggers
import toast from 'react-hot-toast';

// Category interface schema definitions
interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export default function AdminCategoriesPage() {
  // Category form inputs states
  const [categories, setCategories] = useState<Category[]>([]); // Holds categories list
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  
  // UI status spinners
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories list from backend API
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update slug state on changes to category name (converts spaces/special symbols to hyphens)
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  // Upload single category cover image to Cloudinary via upload endpoint
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file); // Bind binary payload

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImage(data.url); // Set returned secure URL
        toast.success('Category image uploaded successfully!');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Post category creation payload to backend database api
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Name and slug are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, image }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Collection category created!');
        // Reset form inputs fields
        setName('');
        setSlug('');
        setDescription('');
        setImage('');
        fetchCategories(); // Refresh categories list grid
      } else {
        toast.error(data.error || 'Failed to create category');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete category from database using category ID
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return; // Display confirm safety popup

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Category deleted');
        fetchCategories(); // Refresh categories list grid
      } else {
        toast.error('Failed to delete category');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="space-y-12">
      {/* Page Header title */}
      <div className="border-b border-border pb-4">
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter">
          Collection Categories
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left column - Creation Form */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2">
            Create Category
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)} // Slug generator
                placeholder="e.g., Heavyweight Hoodies"
                className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., heavyweight-hoodies"
                className="w-full bg-card border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the archive collection..."
                rows={3}
                className="w-full bg-card border border-border p-4 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors resize-none"
              />
            </div>

            {/* Banner cover image selection box */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">Cover Image</label>
              {image ? (
                <div className="relative group aspect-square w-full border border-border bg-white overflow-hidden">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-widest"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className="border border-dashed border-border aspect-square w-full flex flex-col items-center justify-center cursor-pointer hover:border-text transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Upload size={20} className="text-muted group-hover:text-text transition-colors mb-2 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-text transition-colors">
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </span>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full bg-text text-bg py-3 text-[10px] font-black uppercase tracking-widest hover:bg-bg-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Collection'}
            </button>
          </form>
        </div>

        {/* Right column - Categories Grid List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2">
            Existing Collections ({categories.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <div key={cat._id} className="bg-card border border-border p-4 flex gap-4 relative group">
                {/* Visual image box */}
                <div className="w-20 h-20 bg-white border border-border overflow-hidden shrink-0">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted font-black uppercase tracking-widest bg-gray-100">
                      NO IMG
                    </div>
                  )}
                </div>
                {/* Details layout */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight">{cat.name}</h3>
                    <p className="text-[9px] text-muted font-bold tracking-widest mt-1">/{cat.slug}</p>
                    {cat.description && (
                      <p className="text-[10px] text-muted line-clamp-2 mt-2 leading-relaxed font-semibold">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  {/* Delete button option */}
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="absolute top-4 right-4 text-muted hover:text-accent-red transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty collection state box */}
            {categories.length === 0 && (
              <div className="col-span-full border border-dashed border-border p-12 text-center text-muted font-bold text-xs uppercase tracking-widest">
                No collection categories configured yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

