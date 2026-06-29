export const dynamic = "force-dynamic"; // Forces dynamic execution to evaluate session checks on every administrative access attempt
import { redirect } from "next/navigation"; // Import redirect helper
import { auth } from "@/auth"; // Import NextAuth server session checker
import AdminSidebar from "./AdminSidebar"; // Import Sidebar dashboard navbar component

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth(); // Hydrate user session properties on the server side

  // Protect Admin Route: verify session validity and validate role configurations
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/"); // Terminate access and perform redirection to the home collection
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Interactive dashboard navigation bar component */}
      <AdminSidebar />

      {/* Main Administrative Panel viewport frame */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 pt-24 lg:pt-12">
        {children}
      </main>
    </div>
  );
}

