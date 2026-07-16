import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CustomerDetailPageProps {
  params: { id: string };
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

function statusLabel(status: string): string {
  if (status === "pending") return "Reserved";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const supabase = createClient();

  // 1. Fetch customer details
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, name, phone, created_at")
    .eq("id", params.id)
    .single();

  if (customerError || !customer) {
    notFound();
  }

  // 2. Fetch their orders with items
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id, order_ref, status, total_amount, created_at, confirmed_at,
      order_items (product_name_snapshot, quantity, price_snapshot)
    `)
    .eq("customer_id", params.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching customer orders:", ordersError);
  }

  return (
    <div>
      <Link
        href="/admin/customers"
        className="inline-flex items-center text-sm text-brand-plum/60 hover:text-brand-plum transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Customers
      </Link>

      <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-heading text-brand-plum">{customer.name || "Unknown Customer"}</h1>
        <div className="mt-2 text-sm text-brand-plum/80 flex flex-col sm:flex-row sm:gap-6">
          <p>
            <span className="font-semibold text-brand-plum">Phone:</span> {customer.phone}
          </p>
          <p>
            <span className="font-semibold text-brand-plum">Customer since:</span>{" "}
            {new Date(customer.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-heading text-brand-plum mb-4">Order History</h2>

      <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-blush/30 border-b border-brand-rose/20 text-brand-plum text-sm font-medium">
              <th className="px-5 py-4">Order Ref</th>
              <th className="px-5 py-4">Items</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-rose/10">
            {!orders || orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-brand-plum/60">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const items = order.order_items || [];
                const itemsSummary = items
                  .map((item: { product_name_snapshot: string; quantity: number; price_snapshot: number }) => 
                    `${item.product_name_snapshot || "Unknown"} ×${item.quantity}`
                  )
                  .join(", ");

                return (
                  <tr key={order.id} className="hover:bg-brand-blush/10 transition-colors">
                    <td className="px-5 py-4 text-brand-plum font-medium text-sm">
                      {order.order_ref}
                    </td>
                    <td className="px-5 py-4 text-sm text-brand-plum/80 max-w-xs truncate">
                      {itemsSummary || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-brand-plum/80">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-brand-plum/60">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
