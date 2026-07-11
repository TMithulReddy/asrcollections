import { supabase } from "@/lib/supabase";

export async function rollbackOrder({
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
      console.error("Order rollback failed on order_items:", itemsError);
    }

    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      console.error("Order rollback failed on orders:", orderError);
    }
  }

  if (customerId) {
    const { error: customerError } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (customerError) {
      console.error("Order rollback failed on customers:", customerError);
    }
  }
}

export async function releaseReservedProducts(productIds: string[]) {
  if (productIds.length === 0) {
    return;
  }

  for (const productId of productIds) {
    const { error } = await supabase.rpc("expire_reservation", {
      p_product_id: productId,
    });

    if (error) {
      console.error(`Failed to release reserved product ${productId}:`, error);
    }
  }
}
