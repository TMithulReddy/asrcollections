import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import ProductListActions from "@/components/admin/ProductListActions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      slug,
      name,
      price,
      status,
      categories (name),
      product_images (image_url, display_order)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading text-brand-plum">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center bg-brand-plum text-brand-white px-4 py-2 rounded-md hover:bg-brand-plum/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-blush/30 border-b border-brand-rose/20 text-brand-plum text-sm font-medium">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-rose/10">
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-brand-plum/60">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                // Sort images by display_order
                const sortedImages = [...(product.product_images || [])].sort(
                  (a, b) => a.display_order - b.display_order
                );
                const firstImage = sortedImages[0]?.image_url;
                const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
                const categoryName = (category as { name: string })?.name || "Uncategorized";

                return (
                  <tr key={product.id} className="hover:bg-brand-blush/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-12 h-16 bg-brand-blush rounded-md overflow-hidden flex-shrink-0">
                          {firstImage ? (
                            <Image
                              src={`https://res.cloudinary.com/dtsdbtsm8/image/upload/c_fill,w_100,h_133,q_auto,f_auto/${firstImage}`}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-brand-plum/40">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-brand-plum font-medium line-clamp-1">{product.name}</p>
                          <p className="text-xs text-brand-plum/60">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brand-plum/80">{categoryName}</td>
                    <td className="px-6 py-4 text-brand-plum/80">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === "available"
                            ? "bg-green-100 text-green-800"
                            : product.status === "reserved"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end">
                      <ProductListActions productId={product.id} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
