"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProduct(productId: string) {
  const supabase = createClient();

  // The authenticated admin's session is automatically used by createClient().
  // RLS will allow this deletion because the user role is 'admin'.
  
  // We can try to delete from product_images first just in case there's no ON DELETE CASCADE,
  // but if there IS a cascade, deleting the product will do it anyway. Let's delete images first safely.
  await supabase.from("product_images").delete().eq("product_id", productId);
  
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  // Revalidate both the admin products page and the public products pages
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  revalidatePath("/");
  
  return { success: true };
}

export async function bulkUpdateCategory(productIds: string[], categoryId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("products").update({ category_id: categoryId }).in("id", productIds);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true };
}

export async function bulkUpdateStatus(productIds: string[], status: string) {
  const supabase = createClient();
  const updateData: Record<string, string | null> = { status };
  if (status === "available" || status === "sold") {
    updateData.reserved_until = null;
  }
  const { error } = await supabase.from("products").update(updateData).in("id", productIds);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true };
}

export async function bulkDeleteProducts(productIds: string[]) {
  const supabase = createClient();
  await supabase.from("product_images").delete().in("product_id", productIds);
  const { error } = await supabase.from("products").delete().in("id", productIds);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true };
}

export async function updateProductInline(productId: string, field: string, value: string) {
  if (field !== "status" && field !== "category_id") {
    throw new Error(`Invalid field: ${field}. Only 'status' and 'category_id' can be updated inline.`);
  }

  const supabase = createClient();
  const updateData: Record<string, string | null> = { [field]: value };
  
  if (field === "status" && (value === "available" || value === "sold")) {
    updateData.reserved_until = null;
  }

  const { error } = await supabase.from("products").update(updateData).eq("id", productId);
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true };
}
