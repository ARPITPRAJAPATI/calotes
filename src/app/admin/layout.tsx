export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Protect Admin Route
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      <AdminSidebar />

      {/* Admin Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 pt-24 lg:pt-12">
        {children}
      </main>
    </div>
  );
}
