export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Protect Admin Route
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <h2 className="font-display font-black text-2xl uppercase tracking-tighter">Calotes Admin</h2>
        </div>
        
        <AdminNav />

        <div className="p-4 border-t border-border">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted hover:bg-bg hover:text-text transition-colors">
            <ArrowLeft size={18} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-y-auto p-12">
        {children}
      </main>
    </div>
  );
}
