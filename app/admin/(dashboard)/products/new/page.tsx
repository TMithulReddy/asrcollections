import { createClient } from "@/utils/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("display_order", { ascending: true });

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center text-sm text-brand-plum/60 hover:text-brand-plum transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Products
      </Link>
      <h1 className="text-3xl font-heading text-brand-plum mb-6">Add New Product</h1>
      <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm p-6">
        <ProductForm categories={categories || []} />
      </div>
    </div>
  );
}
