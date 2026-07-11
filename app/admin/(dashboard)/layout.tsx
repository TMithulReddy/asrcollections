import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-brand-blush">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-rose/20 flex flex-col">
        <div className="p-6">
          <Link href="/admin/dashboard" className="text-xl font-bold text-brand-plum">
            ASR Admin
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/admin/products" className="block px-4 py-2 text-brand-plum hover:bg-brand-blushDark rounded-md transition-colors">
            Products
          </Link>
          <Link href="/admin/categories" className="block px-4 py-2 text-brand-plum hover:bg-brand-blushDark rounded-md transition-colors">
            Categories
          </Link>
          <Link href="/admin/orders" className="block px-4 py-2 text-brand-plum hover:bg-brand-blushDark rounded-md transition-colors">
            Orders
          </Link>
          <Link href="/admin/promotions" className="block px-4 py-2 text-brand-plum hover:bg-brand-blushDark rounded-md transition-colors">
            Promotions
          </Link>
          <Link href="/admin/banners" className="block px-4 py-2 text-brand-plum hover:bg-brand-blushDark rounded-md transition-colors">
            Banners
          </Link>
        </nav>

        <div className="p-4 border-t border-brand-rose/20">
          <form action={async () => {
            "use server";
            const supabase = createClient();
            await supabase.auth.signOut();
            redirect("/admin/login");
          }}>
            <button
              type="submit"
              className="flex items-center w-full px-4 py-2 text-brand-plum hover:bg-brand-rose/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
