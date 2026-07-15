"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface PromotionData {
  name: string;
  discount_percent: number;
  category_id: string | null;
  product_ids: string[] | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
}

export async function createPromotion(data: PromotionData) {
  const supabase = createClient();

  const { error } = await supabase.from("promotions").insert({
    name: data.name.trim(),
    discount_percent: data.discount_percent,
    category_id: data.category_id || null,
    product_ids: data.product_ids || null,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    active: data.active,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/promotions");
  return { success: true, error: null };
}

export async function updatePromotion(id: string, data: PromotionData) {
  const supabase = createClient();

  const { error } = await supabase
    .from("promotions")
    .update({
      name: data.name.trim(),
      discount_percent: data.discount_percent,
      category_id: data.category_id || null,
      product_ids: data.product_ids || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      active: data.active,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/promotions");
  return { success: true, error: null };
}

export async function deletePromotion(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("promotions").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/promotions");
  return { success: true, error: null };
}
