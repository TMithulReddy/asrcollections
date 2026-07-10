import { supabase } from "@/lib/supabase";

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

function generateOrderRef(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `ASR-${digits}`;
}

async function isOrderRefTaken(orderRef: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("order_ref", orderRef)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function generateUniqueOrderRef(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderRef = generateOrderRef();
    const taken = await isOrderRefTaken(orderRef);
    if (!taken) {
      return orderRef;
    }
  }

  return generateOrderRef();
}

async function rollbackBuyNowOrder({
  customerId,
  orderId,
}: {
  customerId: string | null;
  orderId: string | null;
}) {
  if (orderId) {
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Buy now rollback failed on order_items:", itemsError);
    }

    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      console.error("Buy now rollback failed on orders:", orderError);
    }
  }

  if (customerId) {
    const { error: customerError } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (customerError) {
      console.error("Buy now rollback failed on customers:", customerError);
    }
  }
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

    if (product.status !== "available") {
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

    let orderRef: string | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      orderRef = await generateUniqueOrderRef();

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          order_ref: orderRef,
          status: "pending",
          total_amount: salePrice,
        })
        .select("id")
        .single();

      if (!orderError && order) {
        orderId = order.id;
        break;
      }

      if (orderError?.code === "23505") {
        continue;
      }

      throw orderError ?? new Error("Failed to create order");
    }

    if (!orderId || !orderRef) {
      throw new Error("Failed to create order after retry");
    }

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
      orderRef,
      productName: product.name,
      price: salePrice,
    };
  } catch (error) {
    console.error("Buy now order failed:", error);
    await rollbackBuyNowOrder({ customerId, orderId });
    throw error;
  }
}
