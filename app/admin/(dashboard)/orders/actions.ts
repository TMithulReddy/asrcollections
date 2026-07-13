"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveOrder(orderId: string) {
  const supabase = createClient();

  // Get the order's items to find all product IDs
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id")
    .eq("order_id", orderId);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  // Set order status to confirmed
  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", orderId);

  if (orderError) {
    return { success: false, error: orderError.message };
  }

  // Mark all products in this order as sold
  for (const item of orderItems || []) {
    await supabase
      .from("products")
      .update({ status: "sold", reserved_until: null })
      .eq("id", item.product_id);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true, error: null };
}

export async function rejectOrder(orderId: string) {
  const supabase = createClient();

  // Get the order's items to find all product IDs
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id")
    .eq("order_id", orderId);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  // Set order status to rejected
  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "rejected" })
    .eq("id", orderId);

  if (orderError) {
    return { success: false, error: orderError.message };
  }

  // Release all products back to available
  for (const item of orderItems || []) {
    await supabase
      .from("products")
      .update({ status: "available", reserved_until: null })
      .eq("id", item.product_id);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true, error: null };
}
