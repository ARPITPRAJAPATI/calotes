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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-12 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">
              Calotes<span className="text-accent">.</span>
            </h1>
          </Link>
          <p className="text-muted mt-4 font-medium uppercase tracking-widest text-xs">
            Access your curated vintage archive
          </p>
        </div>

        <div className="bg-card border border-border p-8 relative overflow-hidden group">
          {/* Brutalist design element */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 -mr-8 -mt-8 rotate-45 transition-all duration-500 group-hover:bg-accent/20" />
          
          <h2 className="text-2xl font-display font-bold uppercase mb-8 tracking-tight border-b border-border pb-4">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-accent-red/10 text-accent-red text-sm p-4 border border-accent-red/20 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full bg-bg border border-border p-4 text-text focus:outline-none focus:border-text transition-colors placeholder:text-muted/50"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">
                  Password
                </label>
                <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-text hover:text-accent transition-colors">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                className="w-full bg-bg border border-border p-4 text-text focus:outline-none focus:border-text transition-colors placeholder:text-muted/50"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text text-bg py-4 font-display font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-bg-dark transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Enter Archive <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Or continue with</span>
            <div className="flex-1 h-[1px] bg-border" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="flex items-center justify-center gap-3 bg-bg border border-border py-4 font-bold uppercase tracking-widest text-xs hover:border-text transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                />
              </svg>
              Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-muted">
          New to Calotes?{" "}
          <Link href="/register" className="text-text border-b border-text hover:text-accent hover:border-accent transition-colors">
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
