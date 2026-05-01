"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
      } else {
        setSuccess(true);
        // Automatically sign in after registration
        setTimeout(async () => {
          await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
            callbackUrl: "/",
          });
          window.location.href = "/";
        }, 1500);
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
        <div className="mb-12 flex justify-between items-end">
          <div>
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">
                Calotes<span className="text-accent">.</span>
              </h1>
            </Link>
            <p className="text-muted mt-4 font-medium uppercase tracking-widest text-[10px]">
              Join the community
            </p>
          </div>
          <button 
            onClick={() => router.back()}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-text transition-colors flex items-center gap-2 mb-1"
          >
            <ArrowLeft size={12} /> Back
          </button>
        </div>

        <div className="bg-card border border-border p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 -mr-8 -mt-8 rotate-45 transition-all duration-500 group-hover:bg-accent/20" />
          
          <h2 className="text-2xl font-display font-bold uppercase mb-8 tracking-tight border-b border-border pb-4">
            Register
          </h2>

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-accent" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Welcome Aboard!</h3>
              <p className="text-muted text-sm uppercase tracking-widest font-medium">
                Redirecting you to the collection...
              </p>
              <div className="flex justify-center pt-4">
                <Loader2 className="w-6 h-6 animate-spin text-text" />
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-accent-red/10 text-accent-red text-sm p-4 border border-accent-red/20 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-bg border border-border p-4 text-text focus:outline-none focus:border-text transition-colors placeholder:text-muted/50"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

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
                <label className="text-xs font-bold uppercase tracking-widest text-muted">
                  Password
                </label>
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
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Or join with</span>
              <div className="flex-1 h-[1px] bg-border" />
            </div>
          )}

          {!success && (
            <div className="mt-6">
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-3 bg-bg border border-border py-4 font-bold uppercase tracking-widest text-xs hover:border-text transition-all active:scale-[0.98]"
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
          )}
        </div>

        {!success && (
          <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-text border-b border-text hover:text-accent hover:border-accent transition-colors">
              Sign In
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
