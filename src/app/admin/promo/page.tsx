'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Tag, Percent, RefreshCw } from 'lucide-react';

interface Promo {
  _id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  isActive: boolean;
  minOrderAmount: number;
  createdAt: string;
}

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/promo');
      const data = await res.json();
      if (res.ok) {
        setPromos(data);
      } else {
        toast.error('Failed to load coupons');
      }
    } catch (err) {
      toast.error('Error fetching discount coupons');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      return toast.error('Code and Value are required');
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: parseFloat(minOrderAmount) || 0,
          isActive,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Discount Code ${code.toUpperCase()} created!`);
        setCode('');
        setDiscountValue('');
        setMinOrderAmount('');
        setIsActive(true);
        fetchPromos(true);
      } else {
        toast.error(data.error || 'Failed to create coupon');
      }
    } catch (err) {
      toast.error('An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!confirm(`Are you sure you want to delete the code ${codeName}?`)) return;

    try {
      const res = await fetch(`/api/promo/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Coupon ${codeName} deleted!`);
        setPromos((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      toast.error('An error occurred during deletion');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-xs font-black uppercase tracking-widest text-muted gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-text" />
        Retrieving Discount Registers...
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
            Discounts & Coupons
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-1">
            Create and manage customer promotional codes manually.
          </p>
        </div>
        <button
          onClick={() => fetchPromos(true)}
          disabled={refreshing}
          className="flex items-center gap-2 border border-border px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-card transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Creator Column */}
        <div className="bg-card border border-border p-8 h-fit space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-border pb-2 text-text flex items-center gap-2">
            <Tag size={14} className="text-accent" />
            Create Promo Code
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
                Coupon Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. VINTAGE20"
                className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-text transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat')}
                className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-text transition-colors"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (INR)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
                  Value *
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted block">
                  Min. Subtotal
                </label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full bg-bg border border-border px-4 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-text transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-text"
              />
              <label htmlFor="isActive" className="text-[10px] font-black uppercase tracking-widest text-muted cursor-pointer select-none">
                Enable Coupon Immediately
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-text text-bg py-4 text-[10px] font-black uppercase tracking-widest hover:bg-bg-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={14} />}
              {submitting ? 'Creating Code...' : 'Create Coupon'}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-card border border-border overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-bg text-[10px] font-black uppercase tracking-widest text-muted border-b border-border">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount Rate</th>
                <th className="p-4">Requirements</th>
                <th className="p-4 w-24">Status</th>
                <th className="p-4 w-12 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-bold uppercase tracking-widest text-xs">
              {promos.map((promo) => (
                <tr key={promo._id} className="hover:bg-bg/50 transition-colors">
                  {/* Code */}
                  <td className="p-4 flex items-center gap-2">
                    <Tag size={12} className="text-muted shrink-0" />
                    <span className="text-text font-black">{promo.code}</span>
                  </td>
                  {/* Discount */}
                  <td className="p-4">
                    {promo.discountType === 'percentage' ? (
                      <span className="flex items-center gap-1">
                        {promo.discountValue}% Off
                      </span>
                    ) : (
                      <span>₹{promo.discountValue} Off</span>
                    )}
                  </td>
                  {/* Min order */}
                  <td className="p-4 text-muted">
                    {promo.minOrderAmount > 0 ? (
                      <span>Min Order: ₹{promo.minOrderAmount}</span>
                    ) : (
                      <span>No Minimum</span>
                    )}
                  </td>
                  {/* Active */}
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-[8px] border font-black tracking-widest ${
                        promo.isActive
                          ? 'bg-accent/10 border-accent/40 text-text'
                          : 'bg-bg border-border text-muted'
                      }`}
                    >
                      {promo.isActive ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  {/* Delete */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(promo._id, promo.code)}
                      className="text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted font-bold text-xs uppercase tracking-widest">
                    No promo codes generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
