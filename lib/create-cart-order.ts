import { supabase } from "@/lib/supabase";
import { expireStaleReservation } from "@/lib/expire-reservations";

export interface CartCheckoutItem {
  productId: string;
  quantity: number;
}

interface CartCheckoutInput {
  customerName: string;
  customerPhone: string;
  items: CartCheckoutItem[];
}

export interface CartCheckoutLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CartCheckoutResult {
  orderRef: string;
  totalAmount: number;
  lineItems: CartCheckoutLineItem[];
}

export async function createCartOrder(
  input: CartCheckoutInput
): Promise<CartCheckoutResult> {
  if (input.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const slugs = input.items.map((item) => item.productId);

  // Fetch product details to build lineItems for the WhatsApp message
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, slug, name, price, discount_price")
    .in("slug", slugs);

  if (productsError || !products) {
    throw productsError ?? new Error("Failed to load products");
  }

  // Expire stale reservations before attempting checkout
  for (const product of products) {
    await expireStaleReservation(product.id);
  }

  // Build lineItems from product data + cart quantities
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const lineItems: CartCheckoutLineItem[] = [];

  for (const cartItem of input.items) {
    const product = productBySlug.get(cartItem.productId);
    if (!product) {
      throw new Error(`Product not found: ${cartItem.productId}`);
    }
    const unitPrice = Number(product.discount_price ?? product.price);
    lineItems.push({
      name: product.name,
      quantity: cartItem.quantity,
      unitPrice,
    });
  }

  // Build the items array for the RPC
  const rpcItems = input.items.map((item) => ({
    slug: item.productId,
    quantity: item.quantity,
  }));

  const { data, error } = await supabase.rpc("create_cart_order", {
    p_items: rpcItems,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
  });

  if (error) {
    console.error("create_cart_order RPC failed:", error);
    throw new Error(error.message || "Cart checkout failed");
  }

  // The RPC returns a single row (or array with one element)
  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error("Cart checkout returned no data");
  }

  return {
    orderRef: row.order_ref,
    totalAmount: Number(row.total_amount),
    lineItems,
  };
}
