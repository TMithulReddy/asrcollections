"use server";

import { createClient } from "@/utils/supabase/server";

export interface SearchResult {
  id: string;
  type: "product" | "order";
  title: string;
  subtitle: string;
  href: string;
}

export async function searchAdminItems(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = createClient();
  const searchPattern = `%${query.trim()}%`;
  
  const { data: products } = await supabase
    .from("products")
    .select("id, name, sku, slug")
    .or(`name.ilike.${searchPattern},sku.ilike.${searchPattern}`)
    .limit(5);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_ref, customers (name, phone)")
    .or(`order_ref.ilike.${searchPattern}`)
    .limit(5);
    
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone")
    .or(`name.ilike.${searchPattern},phone.ilike.${searchPattern}`)
    .limit(5);
    
  let additionalOrders: { id: string; order_ref: string; customers: unknown }[] = [];
  if (customers && customers.length > 0) {
    const customerIds = customers.map((c) => c.id);
    const { data: cOrders } = await supabase
      .from("orders")
      .select("id, order_ref, customers (name, phone)")
      .in("customer_id", customerIds)
      .limit(5);
    additionalOrders = cOrders || [];
  }

  const results: SearchResult[] = [];

  if (products) {
    products.forEach((p) => {
      results.push({
        id: p.id,
        type: "product",
        title: p.name,
        subtitle: p.sku || "No SKU",
        href: `/admin/products/${p.id}/edit`,
      });
    });
  }

  const allOrders = [...(orders || []), ...additionalOrders];
  const uniqueOrders = Array.from(new Map(allOrders.map((o) => [o.id, o])).values());

  uniqueOrders.forEach((o) => {
    const cust = Array.isArray(o.customers) ? o.customers[0] : o.customers;
    results.push({
      id: o.id,
      type: "order",
      title: o.order_ref,
      subtitle: `${cust?.name || "Unknown"} (${cust?.phone || ""})`,
      href: `/admin/orders?search=${o.order_ref}`,
    });
  });

  return results.slice(0, 10);
}
