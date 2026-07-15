import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Package, Clock, ShieldCheck, Tag, ArrowRight } from "lucide-react";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminDashboardPage() {
  const supabase = createClient();
  
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("order_ref, name, total_amount, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
    
  const pendingOrdersCount = pendingOrders?.length || 0;
  const recentPending = pendingOrders?.slice(0, 5) || [];
  
  const { data: products } = await supabase
    .from("products")
    .select("status");
    
  const activeProducts = products?.filter(p => p.status === "available").length || 0;
  const reservedProducts = products?.filter(p => p.status === "reserved").length || 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, status, confirmed_at, order_items(product_id)")
    .gte("confirmed_at", startOfMonth)
    .eq("status", "confirmed");

  let soldThisMonthCount = 0;
  if (recentOrders) {
    for (const order of recentOrders) {
      soldThisMonthCount += (order.order_items as { product_id: string }[])?.length || 0;
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-heading text-brand-plum mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Pending Orders (Distinct) */}
        <Link href="/admin/orders?status=pending" className="block">
          <div className="bg-brand-mauve text-brand-white rounded-lg p-6 shadow-sm transition-transform hover:-translate-y-1 h-full">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-brand-blush" />
              <h2 className="text-sm font-medium text-brand-blush">Pending orders</h2>
            </div>
            <p className="text-3xl font-bold">{pendingOrdersCount}</p>
          </div>
        </Link>
        
        {/* Active Products */}
        <div className="bg-brand-white border border-brand-rose/20 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-5 h-5 text-brand-mauve" />
            <h2 className="text-sm font-medium text-brand-plum/80">Active products</h2>
          </div>
          <p className="text-3xl font-bold text-brand-plum">{activeProducts}</p>
        </div>
        
        {/* Reserved right now */}
        <div className="bg-brand-white border border-brand-rose/20 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-brand-mauve" />
            <h2 className="text-sm font-medium text-brand-plum/80">Reserved right now</h2>
          </div>
          <p className="text-3xl font-bold text-brand-plum">{reservedProducts}</p>
        </div>
        
        {/* Sold this month */}
        <div className="bg-brand-white border border-brand-rose/20 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-brand-mauve" />
            <h2 className="text-sm font-medium text-brand-plum/80">Sold this month</h2>
          </div>
          <p className="text-3xl font-bold text-brand-plum">{soldThisMonthCount}</p>
        </div>
      </div>

      <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-rose/20">
          <h2 className="text-lg font-medium text-brand-plum">Needs your attention</h2>
        </div>
        
        {recentPending.length > 0 ? (
          <ul className="divide-y divide-brand-rose/20">
            {recentPending.map((order) => (
              <li key={order.order_ref}>
                <Link 
                  href="/admin/orders" 
                  className="flex items-center justify-between px-6 py-4 hover:bg-brand-blush/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-brand-plum">{order.order_ref}</p>
                    <p className="text-sm text-brand-plum/70">{order.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium text-brand-plum">{formatPrice(order.total_amount)}</p>
                    <ArrowRight className="w-4 h-4 text-brand-mauve" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-brand-plum/70">
            Nothing pending — you&apos;re all caught up
          </div>
        )}
      </div>
    </div>
  );
}
