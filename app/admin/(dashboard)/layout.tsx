import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import SidebarNav from "@/components/admin/SidebarNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-brand-white">
      {/* Sidebar */}
      <aside className="w-56 bg-brand-plum border-r border-brand-rose/20 flex flex-col">
        <div className="p-6 pb-4">
          <Link href="/admin/dashboard" className="text-xl font-heading text-brand-white">
            ASR Admin
          </Link>
        </div>
        
        <div className="px-4 pb-4 border-b border-brand-blush/20 mb-4">
          <Link 
            href="/" 
            className="flex items-center w-full px-4 py-2 text-brand-blush border border-brand-blush/20 hover:bg-brand-mauve/20 rounded-md transition-colors text-sm"
          >
            ← Back to Store
          </Link>
        </div>
        
        <SidebarNav />

        <div className="p-4 border-t border-brand-blush/20">
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 bg-brand-blush">
        {children}
      </main>
    </div>
  );
}
