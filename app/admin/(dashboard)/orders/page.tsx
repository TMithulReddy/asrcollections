import { createClient } from "@/utils/supabase/server";
import OrderActions from "@/components/admin/OrderActions";
import OrderStatusFilter from "@/components/admin/OrderStatusFilter";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

interface OrdersPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const supabase = createClient();

  let query = supabase
    .from("orders")
    .select(`
      id, order_ref, status, total_amount, created_at, confirmed_at,
      customers (name, phone),
      order_items (id, product_id, quantity, products (name))
    `)
    .order("created_at", { ascending: false });

  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : null;
  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
  }

  return (
    <div>
      <h1 className="text-3xl font-heading text-brand-plum mb-6">Orders</h1>

      <div className="mb-6">
        <Suspense fallback={null}>
          <OrderStatusFilter />
        </Suspense>
      </div>

      <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-blush/30 border-b border-brand-rose/20 text-brand-plum text-sm font-medium">
              <th className="px-5 py-4">Order Ref</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Items</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-rose/10">
            {!orders || orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-brand-plum/60">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const customer = Array.isArray(order.customers)
                  ? order.customers[0]
                  : order.customers;
                const items = order.order_items || [];
                const itemsSummary = items
                  .map((item: { quantity: number; products: { name: string } | { name: string }[] | null }) => {
                    const product = Array.isArray(item.products) ? item.products[0] : item.products;
                    const productName = product?.name || "Unknown";
                    return `${productName} ×${item.quantity}`;
                  })
                  .join(", ");

                return (
                  <tr key={order.id} className="hover:bg-brand-blush/10 transition-colors">
                    <td className="px-5 py-4 text-brand-plum font-medium text-sm">
                      {order.order_ref}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm text-brand-plum">{(customer as { name: string; phone: string })?.name || "—"}</p>
                        <p className="text-xs text-brand-plum/60">{(customer as { name: string; phone: string })?.phone || ""}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-brand-plum/80 max-w-xs truncate">
                      {itemsSummary || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-brand-plum/80">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-brand-plum/60">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 flex justify-end">
                      <OrderActions orderId={order.id} status={order.status} />
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
