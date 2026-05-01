"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, LogOut, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/profile");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") setLoadingOrders(false);
  }, [status]);

  if (status === "loading" || status === "unauthenticated") return (
    <div className="h-screen bg-bg flex items-center justify-center">
      <Loader2 className="animate-spin text-muted" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="pt-28 pb-4 px-6 md:px-12 border-b border-border">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Calotes — Account</p>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-12">
            <div>
              <h1 className="font-display font-black text-4xl uppercase tracking-tighter mb-2">
                {session?.user?.name?.split(' ')[0]}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{session?.user?.email}</p>
            </div>
            <nav className="space-y-4 border-t border-border pt-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-4">Account</p>
              <Link href="/shop" className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors group">
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /> Continue Shopping
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Orders */}
          <div className="lg:col-span-9">
            <div className="flex justify-between items-end border-b border-border pb-4 mb-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Order History</h2>
            </div>

            {loadingOrders ? (
              <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-muted" /></div>
            ) : orders.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-8 text-center">
                <Package size={48} strokeWidth={0.8} className="text-muted" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2">No orders yet.</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Your archive is waiting to be curated.</p>
                </div>
                <Link href="/shop" className="awwwards-btn mt-4 inline-flex items-center gap-2">
                  Start Collecting <ArrowUpRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Order List (populated when orders exist) */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
