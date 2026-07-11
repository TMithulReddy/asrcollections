import { supabase } from "@/lib/supabase";
import { insertOrderWithRetry } from "@/lib/order-ref";
import { rollbackOrder } from "@/lib/order-rollback";
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
  let customerId: string | null = null;
  let orderId: string | null = null;

  try {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price, discount_price, status")
      .eq("slug", input.productSlug)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${input.productSlug}`);
    }

    // Release this product's reservation if it has expired
    await expireStaleReservation(product.id);

    // Re-fetch status after potential expiry
    const { data: freshProduct } = await supabase
      .from("products")
      .select("status")
      .eq("id", product.id)
      .single();

    if (!freshProduct || freshProduct.status !== "available") {
      throw new Error(`Product is not available: ${input.productSlug}`);
    }

    const salePrice = product.discount_price ?? product.price;

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: input.customerName,
        phone: input.customerPhone,
      })
      .select("id")
      .single();

    if (customerError || !customer) {
      throw customerError ?? new Error("Failed to create customer");
    }

    customerId = customer.id;

    const order = await insertOrderWithRetry({
      customerId: customer.id,
      totalAmount: salePrice,
    });
    orderId = order.orderId;

    const { error: orderItemError } = await supabase.from("order_items").insert({
      order_id: orderId,
      product_id: product.id,
      product_name_snapshot: product.name,
      price_snapshot: salePrice,
      quantity: 1,
    });

    if (orderItemError) {
      throw orderItemError;
    }

    const reservedUntil = new Date(
      Date.now() + 4 * 60 * 60 * 1000
    ).toISOString();

    const { data: reservedProduct, error: reserveError } = await supabase
      .from("products")
      .update({
        status: "reserved",
        reserved_until: reservedUntil,
      })
      .eq("id", product.id)
      .eq("status", "available")
      .select("id");

    if (reserveError || !reservedProduct?.length) {
      throw reserveError ?? new Error("Product could not be reserved");
    }

    return {
      orderRef: order.orderRef,
      productName: product.name,
      price: salePrice,
    };
  } catch (error) {
    console.error("Buy now order failed:", error);
    await rollbackOrder({ customerId, orderId });
    throw error;
  }
}
