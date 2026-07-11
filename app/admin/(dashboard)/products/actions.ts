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
