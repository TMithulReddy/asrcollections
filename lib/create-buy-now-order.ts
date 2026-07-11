import { supabase } from "@/lib/supabase";
import { expireStaleReservation } from "@/lib/expire-reservations";

interface BuyNowOrderInput {
  productSlug: string;
  customerName: string;
  customerPhone: string;
}

interface BuyNowOrderResult {
  orderRef: string;
  productName: string;
  price: number;
}

export async function createBuyNowOrder(
  input: BuyNowOrderInput
): Promise<BuyNowOrderResult> {
  // Try to expire any stale reservation on this product first
  // (uses a separate RPC, so it's fine if it's a no-op)
  const { data: productLookup } = await supabase
    .from("products")
    .select("id")
    .eq("slug", input.productSlug)
    .single();

  if (productLookup) {
    await expireStaleReservation(productLookup.id);
  }

  const { data, error } = await supabase.rpc("create_buy_now_order", {
    p_product_slug: input.productSlug,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
  });

  if (error) {
    console.error("create_buy_now_order RPC failed:", error);
    throw new Error(error.message || "Buy now order failed");
  }

  // The RPC returns a single row (or array with one element)
  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error("Buy now order returned no data");
  }

  return {
    orderRef: row.order_ref,
    productName: row.product_name,
    price: Number(row.price),
  };
}
