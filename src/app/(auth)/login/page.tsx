"use client"; // Flags this file as a client component to handle browser inputs, NextAuth oauth redirects, and client validations

// Import React hooks and Suspense wrappers
import { useState, Suspense } from "react";
// Import NextAuth client helper to trigger sign-in procedures
import { signIn } from "next-auth/react";
// Import routing hooks
import { useRouter, useSearchParams } from "next/navigation";
// Import Link for page transitions
import Link from "next/link";
// Import Framer Motion
import { motion } from "framer-motion";
// Import vectors
import { ArrowLeft, ArrowRight, Loader2, Mail, Phone, KeyRound, Edit2, ShieldCheck, Lock } from "lucide-react";

function LoginFormInner() {
  const router = useRouter(); // Initialize router redirects
  const searchParams = useSearchParams(); // Read search parameters (requires Suspense parent container wrapper)
  const callbackUrl = searchParams.get("callbackUrl") || "/"; // Extract target redirect URL on successful login

  // Login mode: "email" | "phone"
  const [loginMode, setLoginMode] = useState<"email" | "phone">("email");
  // Phone auth method: "otp" | "password"
  const [phoneAuthMethod, setPhoneAuthMethod] = useState<"otp" | "password">("otp");

  // Form states
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Input states
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [phoneData, setPhoneData] = useState({ phone: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState<1 | 2>(1); // 1 = enter phone, 2 = enter OTP

  // Handle Email + Password login submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl,
      });
      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone + Password login submission
  const handlePhonePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneData.phone) {
      setError("Phone number is required.");
      return;
    }
    setLoading(true);
    setError("");
    setInfoMessage("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        phone: phoneData.phone,
        password: phoneData.password,
        callbackUrl,
      });
      if (res?.error) {
        setError("Invalid phone number or password.");
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Phone OTP handler
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneData.phone || phoneData.phone.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneData.phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send verification code");
      } else {
        setOtpStep(2);
        const hintText = data.testHint ? ` (${data.testHint})` : "";
        setInfoMessage(`Verification code sent to ${phoneData.phone}${hintText}`);
      }
    } catch {
      setError("An unexpected error occurred while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Resend Phone OTP handler
  const handleResendPhoneOtp = async () => {
    setResending(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneData.phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend code");
      } else {
        const hintText = data.testHint ? ` (${data.testHint})` : "";
        setInfoMessage(`A new code was sent to ${phoneData.phone}${hintText}`);
      }
    } catch {
      setError("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify Phone OTP and Sign In handler
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        phone: phoneData.phone,
        otp: otp,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid or expired verification code.");
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("An unexpected error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Top Branding Navigation Header */}
      <div className="flex justify-between items-center mb-12">
        <Link href="/" className="block">
          <span className="font-display font-black text-3xl uppercase tracking-tighter">Calotes</span>
        </Link>
        <button 
          onClick={() => router.back()} // Go back
          className="text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-text transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={12} /> Back
        </button>
      </div>

      {/* Tab Toggle Navigation (Sign In / Register) */}
      <div className="grid grid-cols-2 bg-card border border-border mb-6 p-1 rounded-lg">
        <div className="py-2.5 text-center text-xs font-bold uppercase tracking-widest bg-terracotta text-bg rounded-md shadow-sm">
          Sign In
        </div>
        <Link
          href="/register"
          className="py-2.5 text-center text-xs font-bold uppercase tracking-widest text-muted hover:text-text transition-colors rounded-md"
        >
          Register
        </Link>
      </div>

      {/* Main Headers */}
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl uppercase tracking-tighter mb-1">Welcome Back</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Sign in to access your items.</p>
      </div>

      {/* Mode Switcher: Email vs Phone */}
      <div className="flex border-b border-border mb-6">
        <button
          type="button"
          onClick={() => {
            setLoginMode("email");
            setError("");
            setInfoMessage("");
          }}
          className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border-b-2 ${
            loginMode === "email"
              ? "border-terracotta text-text font-black"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Mail size={13} /> Email
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMode("phone");
            setError("");
            setInfoMessage("");
          }}
          className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border-b-2 ${
            loginMode === "phone"
              ? "border-terracotta text-text font-black"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Phone size={13} /> Phone
        </button>
      </div>

      {/* Info Notice Indicator */}
      {infoMessage && (
        <div className="bg-text/5 text-text text-xs p-3 mb-6 border border-border font-medium flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
          <div className="text-[11px] font-semibold tracking-wide">{infoMessage}</div>
        </div>
      )}

      {/* Error alert indicator bar */}
      {error && (
        <p className="text-accent text-[10px] font-bold uppercase tracking-widest mb-6 border-l-2 border-accent pl-3">
          {error}
        </p>
      )}

      {/* EMAIL LOGIN FORM */}
      {loginMode === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-3">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-transparent border-b border-border py-3 text-xs font-bold tracking-widest outline-none focus:border-text transition-colors placeholder:text-muted/40"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-3">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-transparent border-b border-border py-3 text-xs font-bold tracking-widest outline-none focus:border-text transition-colors placeholder:text-muted/40"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-5 mt-8 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Enter Items <ArrowRight size={14} /></>}
          </button>
        </form>
      )}

      {/* PHONE LOGIN FORM */}
      {loginMode === "phone" && (
        <div className="space-y-5">
          {/* Phone Sub-Toggle: OTP vs Password */}
          <div className="grid grid-cols-2 bg-bg border border-border p-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
            <button
              type="button"
              onClick={() => {
                setPhoneAuthMethod("otp");
                setError("");
                setInfoMessage("");
              }}
              className={`py-2 text-center rounded transition-colors flex items-center justify-center gap-1.5 ${
                phoneAuthMethod === "otp"
                  ? "bg-card text-text shadow-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              <KeyRound size={11} /> Login via OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setPhoneAuthMethod("password");
                setError("");
                setInfoMessage("");
              }}
              className={`py-2 text-center rounded transition-colors flex items-center justify-center gap-1.5 ${
                phoneAuthMethod === "password"
                  ? "bg-card text-text shadow-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              <Lock size={11} /> Password
            </button>
          </div>

          {/* PHONE VIA OTP */}
          {phoneAuthMethod === "otp" && (
            <>
              {otpStep === 1 ? (
                /* Step 1: Input Phone Number */
                <form onSubmit={handleSendPhoneOtp} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-3">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full bg-transparent border-b border-border py-3 text-xs font-bold tracking-widest outline-none focus:border-text transition-colors placeholder:text-muted/40"
                      placeholder="+91 98765 43210"
                      value={phoneData.phone}
                      onChange={(e) => setPhoneData({ ...phoneData, phone: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-5 mt-6 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Send Verification Code <Mail size={14} /></>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Input 6-Digit OTP */
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-1.5">
                        <KeyRound size={12} className="text-terracotta" /> 6-Digit Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep(1);
                          setError("");
                          setInfoMessage("");
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-terracotta hover:underline flex items-center gap-1"
                      >
                        <Edit2 size={10} /> Edit Number
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      className="w-full bg-transparent border-b-2 border-terracotta py-3 text-center text-2xl font-mono tracking-[0.4em] text-text focus:outline-none transition-colors placeholder:text-muted/20"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-5 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Verify & Enter Items <ArrowRight size={14} /></>
                    )}
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      disabled={resending}
                      onClick={handleResendPhoneOtp}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors disabled:opacity-50"
                    >
                      {resending ? "Resending Code..." : "Didn't receive code? Resend OTP"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* PHONE VIA PASSWORD */}
          {phoneAuthMethod === "password" && (
            <form onSubmit={handlePhonePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full bg-transparent border-b border-border py-3 text-xs font-bold tracking-widest outline-none focus:border-text transition-colors placeholder:text-muted/40"
                  placeholder="+91 98765 43210"
                  value={phoneData.phone}
                  onChange={(e) => setPhoneData({ ...phoneData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-3">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full bg-transparent border-b border-border py-3 text-xs font-bold tracking-widest outline-none focus:border-text transition-colors placeholder:text-muted/40"
                  placeholder="••••••••"
                  value={phoneData.password}
                  onChange={(e) => setPhoneData({ ...phoneData, password: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-5 mt-8 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Enter Items <ArrowRight size={14} /></>}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Google OAuth trigger options */}
      <div className="mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <button
          onClick={() => signIn("google", { callbackUrl })} // Trigger Google NextAuth oauth sign-in process
          className="btn-outline w-full justify-center py-5"
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column: Large fashion graphic layout */}
      <div className="hidden lg:block relative overflow-hidden border-r border-border/50">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop"
          alt="Calotes Editorial"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-12 left-12 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-accent">Calotes — Since 2026</p>
          <p className="font-display font-black text-5xl uppercase tracking-tighter leading-[0.9]">
            The Items<br />are Waiting.
          </p>
        </div>
      </div>

      {/* Right Column: Form interactive area */}
      <div className="flex items-center justify-center p-8 md:p-16 lg:p-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Wrap the form inner component in a Suspense boundary to prevent build failures from useSearchParams calls */}
          <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>}>
            <LoginFormInner />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
