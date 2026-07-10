import { supabase } from "@/lib/supabase";

export function generateOrderRef(): string {
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

export async function generateUniqueOrderRef(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderRef = generateOrderRef();
    const taken = await isOrderRefTaken(orderRef);
    if (!taken) {
      return orderRef;
    }
  }

  return generateOrderRef();
}

export async function insertOrderWithRetry({
  customerId,
  totalAmount,
}: {
  customerId: string;
  totalAmount: number;
}): Promise<{ orderId: string; orderRef: string }> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const orderRef = await generateUniqueOrderRef();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        order_ref: orderRef,
        status: "pending",
        total_amount: totalAmount,
      })
      .select("id")
      .single();

    if (!orderError && order) {
      return { orderId: order.id, orderRef };
    }

    if (orderError?.code === "23505") {
      continue;
    }

    throw orderError ?? new Error("Failed to create order");
  }

  throw new Error("Failed to create order after retry");
}
