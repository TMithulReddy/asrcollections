"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: {
  name: string;
  slug: string;
  display_order: number;
}) {
  const supabase = createClient();

  const { error } = await supabase.from("categories").insert({
    name: formData.name.trim(),
    slug: formData.slug.trim(),
    display_order: formData.display_order,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true, error: null };
}

export async function updateCategory(
  categoryId: string,
  formData: { name: string; slug: string; display_order: number }
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("categories")
    .update({
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      display_order: formData.display_order,
    })
    .eq("id", categoryId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true, error: null };
}

export async function deleteCategory(categoryId: string) {
  const supabase = createClient();

  // Check if any products reference this category
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (count && count > 0) {
    return {
      success: false,
      error: `Cannot delete: ${count} product${count > 1 ? "s" : ""} still assigned to this category. Reassign them first.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/sarees");
  revalidatePath("/");
  return { success: true, error: null };
}
