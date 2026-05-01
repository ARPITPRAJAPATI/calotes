"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl,
      });
      if (res?.error) { setError("Invalid credentials."); }
      else { router.push(callbackUrl); router.refresh(); }
    } catch { setError("An unexpected error occurred."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg text-text grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Large Fashion Image */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop"
          alt="Calotes Editorial"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-12 left-12 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70">Calotes — Since 2026</p>
          <p className="font-display font-black text-5xl uppercase tracking-tighter leading-[0.9]">
            The Archive<br />is Waiting.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-8 md:p-16 lg:p-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <Link href="/" className="block mb-16">
            <span className="font-display font-black text-3xl uppercase tracking-tighter">Calotes</span>
          </Link>

          <div className="mb-10">
            <h1 className="font-display font-black text-4xl uppercase tracking-tighter mb-2">Welcome Back</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Sign in to access your collection.</p>
          </div>

          {error && (
            <p className="text-accent-pink text-[10px] font-bold uppercase tracking-widest mb-6 border-l-2 border-accent-pink pl-3">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-3">Email</label>
              <input
                type="email" required
                className="w-full bg-transparent border-b border-border py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-text transition-colors placeholder:text-muted/40"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-3">Password</label>
              <input
                type="password" required
                className="w-full bg-transparent border-b border-border py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-text transition-colors placeholder:text-muted/40"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text text-bg py-5 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-bg-dark transition-colors mt-8 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Enter Archive <ArrowRight size={14} /></>}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="awwwards-btn w-full flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-10 text-[10px] font-bold uppercase tracking-widest text-muted text-center">
            New here?{" "}
            <Link href="/register" className="text-text underline-hover">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
