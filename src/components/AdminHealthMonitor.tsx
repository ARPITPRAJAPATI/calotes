"use client";

import React, { useState, useEffect } from "react";
import { Activity, Database, Cloud, Mail, ShieldCheck, RefreshCw, Cpu } from "lucide-react";

interface HealthData {
  status: string;
  timestamp: string;
  responseTimeMs: number;
  services: {
    database: { status: string; latencyMs: number; error: string | null };
    cloudinary: { status: string; error: string | null };
    resend: { status: string; error: string | null };
    env: { status: string; missingVars: string[] };
  };
  system: {
    nodeVersion: string;
    uptimeSeconds: number;
    memory: { heapUsedMb: number; heapTotalMb: number; rssMb: number };
  };
}

export default function AdminHealthMonitor() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health?t=" + Date.now());
      const data = await res.json();
      setHealth(data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch system health metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "healthy" || status === "ok") {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational</span>;
    }
    if (status === "degraded") {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Degraded</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 border border-rose-500/20"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Down</span>;
  };

  return (
    <div className="bg-card border border-border p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-bg border border-border text-terracotta">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">System Health & Infrastructure Monitor</h2>
            <p className="text-[10px] text-muted font-mono mt-0.5">
              Live status ping · Auto-refreshes every 30s {lastRefreshed && `(Last updated: ${lastRefreshed})`}
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-bg border border-border text-[9px] font-black uppercase tracking-widest hover:text-terracotta hover:border-terracotta/40 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh Health
        </button>
      </div>

      {health ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Database Metric */}
          <div className="p-4 bg-bg border border-border/70 space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <Database size={13} className="text-terracotta" /> MongoDB Atlas
              </span>
              {getStatusBadge(health.services.database.status)}
            </div>
            <p className="text-lg font-mono font-bold text-text">
              {health.services.database.latencyMs} <span className="text-xs text-muted font-normal">ms latency</span>
            </p>
          </div>

          {/* 2. Cloudinary CDN Metric */}
          <div className="p-4 bg-bg border border-border/70 space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <Cloud size={13} className="text-terracotta" /> Cloudinary CDN
              </span>
              {getStatusBadge(health.services.cloudinary.status)}
            </div>
            <p className="text-xs font-mono text-muted uppercase tracking-wider pt-1">
              Image Storage & Transformations
            </p>
          </div>

          {/* 3. Resend Email Service */}
          <div className="p-4 bg-bg border border-border/70 space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <Mail size={13} className="text-terracotta" /> Resend Mailer
              </span>
              {getStatusBadge(health.services.resend.status)}
            </div>
            <p className="text-xs font-mono text-muted uppercase tracking-wider pt-1">
              Invoices & OTP Mailer API
            </p>
          </div>

          {/* 4. Server Process & Memory */}
          <div className="p-4 bg-bg border border-border/70 space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <Cpu size={13} className="text-terracotta" /> Server Memory
              </span>
              <span className="text-[10px] font-mono text-muted">{health.system.uptimeSeconds}s uptime</span>
            </div>
            <p className="text-lg font-mono font-bold text-text">
              {health.system.memory.heapUsedMb} <span className="text-xs text-muted font-normal">MB Heap</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-muted font-mono animate-pulse">
          Loading real-time health diagnostics...
        </div>
      )}
    </div>
  );
}
