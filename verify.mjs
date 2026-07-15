import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log("--- Starting Verifications ---");

  // 1. Fetch 3 products
  const { data: products } = await supabase.from("products").select("id, category_id, status").limit(4);
  if (!products || products.length < 4) {
    console.log("Not enough products to test.");
    return;
  }
  
  const targetProducts = products.slice(0, 3);
  const testProduct = products[3];

  // Fetch categories
  const { data: categories } = await supabase.from("categories").select("id").limit(2);
  const newCat = categories[1].id;

  console.log("\n2. Bulk Move 3 products");
  const productIds = targetProducts.map(p => p.id);
  const { error: moveError } = await supabase.from("products").update({ category_id: newCat }).in("id", productIds);
  if (moveError) console.error("Move error:", moveError);
  
  // Confirm via fetch
  const { data: verifyMove } = await supabase.from("products").select("category_id").in("id", productIds);
  const allMoved = verifyMove.every(p => p.category_id === newCat);
  console.log("Bulk Move successful:", allMoved);

  console.log("\n3. Inline Edit 1 product status");
  const { error: statusError } = await supabase.from("products").update({ status: "reserved" }).eq("id", targetProducts[0].id);
  if (statusError) console.error("Status error:", statusError);
  
  const { data: verifyStatus } = await supabase.from("products").select("status, updated_at").eq("id", targetProducts[0].id).single();
  console.log("Inline Edit successful:", verifyStatus.status === "reserved");
  console.log("Updated at timestamp:", verifyStatus.updated_at);

  console.log("\n4. Bulk Delete 1 test product");
  // Delete from product_images first
  await supabase.from("product_images").delete().eq("product_id", testProduct.id);
  const { error: deleteError } = await supabase.from("products").delete().eq("id", testProduct.id);
  
  const { data: verifyDelete } = await supabase.from("products").select("id").eq("id", testProduct.id);
  console.log("Bulk Delete successful:", verifyDelete.length === 0);

  console.log("\n--- Verifications Complete ---");
}

verify().catch(console.error);
