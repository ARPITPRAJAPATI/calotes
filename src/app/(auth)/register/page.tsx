"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, Mail, KeyRound, Edit2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();

  // Step state: 1 = Registration details, 2 = OTP Verification
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  // Step 1: Send OTP handler
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send verification code");
      } else {
        setStep(2);
        setInfoMessage(`Verification code sent to ${formData.email}`);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    setResending(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend verification code");
      } else {
        setInfoMessage(`A new verification code was sent to ${formData.email}`);
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP & Create Account handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid verification code");
      } else {
        setSuccess(true);
        // Automatically sign user in after verification
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
    } catch {
      setError("An unexpected error occurred during verification");
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
        {/* Header Navigation */}
        <div className="mb-10 flex justify-between items-center">
          <div>
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">
                Calotes<span className="text-terracotta">.</span>
              </h1>
            </Link>
          </div>
          <button
            onClick={() => router.back()}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-text transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={12} /> Back
          </button>
        </div>

        {/* Tab Toggle Navigation (Sign In / Register) */}
        {!success && (
          <div className="grid grid-cols-2 bg-card border border-border mb-6 p-1 rounded-lg">
            <Link
              href="/login"
              className="py-3 text-center text-xs font-bold uppercase tracking-widest text-muted hover:text-text transition-colors rounded-md"
            >
              Sign In
            </Link>
            <div className="py-3 text-center text-xs font-bold uppercase tracking-widest bg-terracotta text-bg rounded-md shadow-sm">
              Register
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <div className="bg-card border border-border p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-terracotta/10 -mr-8 -mt-8 rotate-45 transition-all duration-500 group-hover:bg-terracotta/20" />

          <h2 className="text-xl font-display font-bold uppercase mb-6 tracking-tight border-b border-border pb-4 flex items-center justify-between">
            <span>{step === 1 ? "Create Account" : "Verify Email"}</span>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">
              Step {step} of 2
            </span>
          </h2>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-terracotta" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Account Verified!</h3>
              <p className="text-muted text-xs uppercase tracking-widest font-medium">
                Logging you into Calotes Vintage...
              </p>
              <div className="flex justify-center pt-4">
                <Loader2 className="w-6 h-6 animate-spin text-text" />
              </div>
            </motion.div>
          ) : step === 1 ? (
            /* STEP 1: Registration Input Form */
            <form onSubmit={handleSendOtp} className="space-y-5">
              {error && (
                <div className="bg-terracotta/10 text-terracotta text-xs p-3.5 border border-terracotta/20 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-bg border border-border p-3.5 text-xs text-text focus:outline-none focus:border-text transition-colors placeholder:text-muted/40 font-medium"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-bg border border-border p-3.5 text-xs text-text focus:outline-none focus:border-text transition-colors placeholder:text-muted/40 font-medium"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-bg border border-border p-3.5 text-xs text-text focus:outline-none focus:border-text transition-colors placeholder:text-muted/40 font-medium"
                  placeholder="•••••••• (Min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-4 mt-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send Verification Code <Mail className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {infoMessage && (
                <div className="bg-text/5 text-text text-xs p-3.5 border border-border font-medium flex items-start gap-2">
                  <Mail className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <div>{infoMessage}</div>
                </div>
              )}

              {error && (
                <div className="bg-terracotta/10 text-terracotta text-xs p-3.5 border border-terracotta/20 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-1.5">
                    <KeyRound size={12} className="text-terracotta" /> 6-Digit OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError("");
                      setInfoMessage("");
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-terracotta hover:underline flex items-center gap-1"
                  >
                    <Edit2 size={10} /> Edit Info
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  className="w-full bg-bg border border-border p-4 text-center text-2xl font-mono tracking-[0.4em] text-text focus:outline-none focus:border-terracotta transition-colors placeholder:text-muted/20"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-4 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Verify & Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendOtp}
                  className="text-xs font-bold uppercase tracking-widest text-muted hover:text-text transition-colors disabled:opacity-50"
                >
                  {resending ? "Resending Code..." : "Didn't receive code? Resend OTP"}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Or join with</span>
              <div className="flex-1 h-[1px] bg-border" />
            </div>
          )}

          {!success && (
            <div className="mt-4">
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="btn-outline w-full justify-center py-4"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                </svg>
                Google
              </button>
            </div>
          )}
        </div>

        {!success && (
          <p className="mt-6 text-center text-xs font-bold uppercase tracking-widest text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-text underline-hover hover:text-terracotta transition-colors">
              Sign In
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
