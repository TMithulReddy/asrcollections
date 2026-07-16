"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveOrder(orderId: string) {
  const supabase = createClient();

  const { error } = await supabase.rpc("approve_order", { p_order_id: orderId });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true, error: null };
}

export async function rejectOrder(orderId: string) {
  const supabase = createClient();

  const { error } = await supabase.rpc("reject_order", { p_order_id: orderId });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true, error: null };
}
