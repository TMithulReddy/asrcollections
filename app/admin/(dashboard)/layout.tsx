import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminSearch from "@/components/admin/AdminSearch";
import AdminBackButton from "@/components/admin/AdminBackButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-brand-white">
      {/* Sidebar */}
      <AdminSidebar>
          <form action={async () => {
            "use server";
            const supabase = createClient();
            await supabase.auth.signOut();
            redirect("/admin/login");
          }}>
            <button
              type="submit"
              className="flex items-center w-full px-4 py-2 text-brand-blush border border-brand-blush/20 hover:bg-brand-mauve/20 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </form>
      </AdminSidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen bg-brand-blush overflow-hidden">
        <header className="flex-shrink-0 px-8 py-4 bg-brand-white border-b border-brand-rose/20 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <AdminBackButton />
          </div>
          <div className="w-full max-w-md flex justify-end">
            <AdminSearch />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
