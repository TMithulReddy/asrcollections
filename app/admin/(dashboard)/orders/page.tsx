import { createClient } from "@/utils/supabase/server";
import OrderActions from "@/components/admin/OrderActions";
import OrderExportButton, { ExportOrder } from "@/components/admin/OrderExportButton";
import Link from "next/link";

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

/** Display label for order status — 'pending' shows as 'Reserved' in the UI */
function statusLabel(status: string): string {
  if (status === "pending") return "Reserved";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

interface OrdersPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const supabase = createClient();

  const searchParamValue = typeof searchParams.search === "string" ? searchParams.search.trim() : "";
  const isSearch = searchParamValue !== "";
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : null;

  // ── SKU search: find order IDs that have a matching unit SKU ──
  let skuOrderIds: string[] = [];
  if (isSearch) {
    // Find product_unit IDs matching the search term
    const { data: matchingUnits } = await supabase
      .from("product_units")
      .select("id")
      .ilike("sku", `%${searchParamValue}%`);

    if (matchingUnits && matchingUnits.length > 0) {
      const unitIds = matchingUnits.map((u) => u.id);
      // Find order_items that reference those units (only confirmed orders have product_unit_id set)
      const { data: matchingItems } = await supabase
        .from("order_items")
        .select("order_id")
        .in("product_unit_id", unitIds);

      if (matchingItems && matchingItems.length > 0) {
        skuOrderIds = Array.from(new Set(matchingItems.map((i) => i.order_id)));
      }
    }
  }

  // ── Main orders query ──
  let query = supabase
    .from("orders")
    .select(`
      id, order_ref, status, total_amount, created_at, confirmed_at,
      customers (name, phone),
      order_items (id, product_id, product_unit_id, quantity, products (name), product_units (sku, status))
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (isSearch) {
    if (skuOrderIds.length > 0) {
      // Match by order_ref OR by order IDs that matched via SKU
      query = query.or(`order_ref.ilike.%${searchParamValue}%,id.in.(${skuOrderIds.join(",")})`);
    } else {
      query = query.ilike("order_ref", `%${searchParamValue}%`);
    }
  }

  const [{ data: orders, error }, { data: allOrdersForCounts }] = await Promise.all([
    query,
    supabase.from("orders").select("status"),
  ]);

  const counts = { pending: 0, confirmed: 0, rejected: 0, expired: 0, total: 0 };
  if (allOrdersForCounts) {
    counts.total = allOrdersForCounts.length;
    allOrdersForCounts.forEach((o) => {
      if (o.status in counts) {
        counts[o.status as keyof typeof counts]++;
      }
    });
  }

  if (error) {
    console.error("Error fetching orders:", error);
  } else if (orders) {
    // ── Drift warnings: confirmed orders should have all items with a sold unit ──
    const driftWarnings: string[] = [];
    orders.forEach((order) => {
      if (order.status === "confirmed") {
        const items = order.order_items || [];
        items.forEach((item: { id: string; product_unit_id: string | null; product_units: { sku: string | null; status: string } | { sku: string | null; status: string }[] | null }) => {
          const unit = Array.isArray(item.product_units) ? item.product_units[0] : item.product_units;
          if (!item.product_unit_id || !unit || unit.status !== "sold") {
            driftWarnings.push(
              `Order ${order.order_ref} is confirmed but item ${item.id} has no sold unit assigned.`
            );
          }
        });
      }
    });
    if (driftWarnings.length > 0) {
      console.warn("DATA INTEGRITY WARNINGS:", driftWarnings);
    }
  }

  // ── Build export data ──
  const exportData: ExportOrder[] = (orders || []).map((order) => {
    const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
    const items = order.order_items || [];
    const itemsSummary = items
      .map((item: { quantity: number; product_unit_id: string | null; products: { name: string } | { name: string }[] | null; product_units: { sku: string | null } | { sku: string | null }[] | null }) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        const unit = Array.isArray(item.product_units) ? item.product_units[0] : item.product_units;
        const productName = product?.name || "Unknown";
        const skuSuffix = item.product_unit_id && unit?.sku ? ` (SKU: ${unit.sku})` : "";
        return `${productName} ×${item.quantity}${skuSuffix}`;
      })
      .join(", ");

    return {
      order_ref: order.order_ref,
      customerName: (customer as { name?: string })?.name || "—",
      customerPhone: (customer as { phone?: string })?.phone || "",
      itemsSummary,
      total: Number(order.total_amount),
      status: order.status,
      date: new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  });

  return (
    <div>
      <h1 className="text-3xl font-heading text-brand-plum mb-6">Orders</h1>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/orders?status=pending" className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${statusFilter === "pending" ? "bg-brand-plum text-brand-white border-brand-plum" : "bg-brand-white text-brand-plum border-brand-rose/40 hover:bg-brand-blush/30"}`}>
            Reserved ({counts.pending})
          </Link>
          <Link href="/admin/orders?status=confirmed" className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${statusFilter === "confirmed" ? "bg-brand-plum text-brand-white border-brand-plum" : "bg-brand-white text-brand-plum border-brand-rose/40 hover:bg-brand-blush/30"}`}>
            Confirmed ({counts.confirmed})
          </Link>
          <Link href="/admin/orders?status=rejected" className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${statusFilter === "rejected" ? "bg-brand-plum text-brand-white border-brand-plum" : "bg-brand-white text-brand-plum border-brand-rose/40 hover:bg-brand-blush/30"}`}>
            Rejected ({counts.rejected})
          </Link>
          <Link href="/admin/orders?status=expired" className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${statusFilter === "expired" ? "bg-brand-plum text-brand-white border-brand-plum" : "bg-brand-white text-brand-plum border-brand-rose/40 hover:bg-brand-blush/30"}`}>
            Expired ({counts.expired})
          </Link>
          <Link href="/admin/orders" className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${!statusFilter || statusFilter === "all" ? "bg-brand-plum text-brand-white border-brand-plum" : "bg-brand-white text-brand-plum border-brand-rose/40 hover:bg-brand-blush/30"}`}>
            Total ({counts.total})
          </Link>
        </div>
        <OrderExportButton orders={exportData} />
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
                  .map((item: { quantity: number; product_unit_id: string | null; products: { name: string } | { name: string }[] | null; product_units: { sku: string | null } | { sku: string | null }[] | null }) => {
                    const product = Array.isArray(item.products) ? item.products[0] : item.products;
                    const unit = Array.isArray(item.product_units) ? item.product_units[0] : item.product_units;
                    const productName = product?.name || "Unknown";
                    const skuSuffix = item.product_unit_id && unit?.sku ? ` (SKU: ${unit.sku})` : "";
                    return `${productName} ×${item.quantity}${skuSuffix}`;
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
