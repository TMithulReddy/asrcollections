"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/cloudinary";
import { formatRelativeTime } from "@/lib/time-utils";
import ProductListActions from "./ProductListActions";
import {
  bulkUpdateCategory,
  bulkUpdateStatus,
  bulkDeleteProducts,
  updateProductInline
} from "@/app/admin/(dashboard)/products/actions";

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  image_url: string;
  display_order: number;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  status: string;
  category_id: string;
  updated_at: string;
  product_images?: ProductImage[];
}

interface AdminProductsTableProps {
  products: Product[];
  categories: Category[];
}

export default function AdminProductsTable({ products, categories }: AdminProductsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [inlineSaveStatus, setInlineSaveStatus] = useState<Record<string, string>>({});

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(products.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const showSavedIndicator = (key: string) => {
    setInlineSaveStatus((prev) => ({ ...prev, [key]: "Saved ✓" }));
    setTimeout(() => {
      setInlineSaveStatus((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 2000);
  };

  const handleInlineEdit = async (productId: string, field: "status" | "category_id", value: string) => {
    const key = `${productId}-${field}`;
    try {
      await updateProductInline(productId, field, value);
      showSavedIndicator(key);
    } catch (err) {
      console.error("Failed inline update:", err);
      alert("Update failed.");
    }
  };

  const handleBulkMove = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    if (!catId) return;
    
    setIsProcessing(true);
    try {
      await bulkUpdateCategory(Array.from(selectedIds), catId);
      setSelectedIds(new Set());
    } catch {
      alert("Bulk move failed.");
    } finally {
      setIsProcessing(false);
      e.target.value = ""; // Reset dropdown
    }
  };

  const handleBulkStatus = async (status: string) => {
    setIsProcessing(true);
    try {
      await bulkUpdateStatus(Array.from(selectedIds), status);
      setSelectedIds(new Set());
    } catch {
      alert("Bulk status update failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} products? This cannot be undone.`)) return;
    setIsProcessing(true);
    try {
      await bulkDeleteProducts(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch {
      alert("Bulk delete failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const allSelected = products.length > 0 && selectedIds.size === products.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < products.length;

  return (
    <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm overflow-hidden">
      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-brand-blush/30 px-6 py-3 border-b border-brand-rose/20 flex items-center justify-between text-sm">
          <span className="font-medium text-brand-plum">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-3">
            <select
              disabled={isProcessing}
              onChange={handleBulkMove}
              defaultValue=""
              className="px-2 py-1 text-xs border border-brand-rose/40 rounded bg-white text-brand-plum focus:outline-none focus:ring-1 focus:ring-brand-plum"
            >
              <option value="" disabled>Move to category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            
            <button
              disabled={isProcessing}
              onClick={() => handleBulkStatus("available")}
              className="px-2 py-1 text-xs border border-brand-rose/40 rounded bg-white hover:bg-green-50 text-brand-plum transition-colors"
            >
              Mark as available
            </button>
            <button
              disabled={isProcessing}
              onClick={() => handleBulkStatus("sold")}
              className="px-2 py-1 text-xs border border-brand-rose/40 rounded bg-white hover:bg-red-50 text-brand-plum transition-colors"
            >
              Mark as sold
            </button>
            <button
              disabled={isProcessing}
              onClick={handleBulkDelete}
              className="px-2 py-1 text-xs border border-red-200 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete selected
            </button>
          </div>
        </div>
      )}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-brand-blush/30 border-b border-brand-rose/20 text-brand-plum text-sm font-medium">
            <th className="px-6 py-4 w-12">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={handleSelectAll}
                className="w-4 h-4 text-brand-plum rounded border-brand-rose/40 focus:ring-brand-plum cursor-pointer"
              />
            </th>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Last updated</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-rose/10">
          {!products || products.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-brand-plum/60">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const sortedImages = [...(product.product_images || [])].sort(
                (a, b) => a.display_order - b.display_order
              );
              const firstImage = sortedImages[0]?.image_url;
              const isSelected = selectedIds.has(product.id);

              return (
                <tr
                  key={product.id}
                  className={`transition-colors ${
                    isSelected ? "bg-brand-blush/20" : "hover:bg-brand-blush/10"
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                      className="w-4 h-4 text-brand-plum rounded border-brand-rose/40 focus:ring-brand-plum cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-12 h-16 bg-brand-blush rounded-md overflow-hidden flex-shrink-0">
                        {firstImage ? (
                          <Image
                            src={getImageUrl(firstImage, 100)}
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
                  <td className="px-6 py-4 relative">
                    <select
                      value={product.category_id || ""}
                      onChange={(e) => handleInlineEdit(product.id, "category_id", e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-brand-rose/40 focus:border-brand-plum focus:outline-none text-brand-plum/80 text-sm py-1 cursor-pointer w-full max-w-[150px]"
                    >
                      <option value="" disabled>Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {inlineSaveStatus[`${product.id}-category_id`] && (
                      <span className="absolute top-1/2 -translate-y-1/2 -left-10 text-[10px] text-green-600 font-medium animate-pulse bg-green-50 px-1 rounded border border-green-200">
                        {inlineSaveStatus[`${product.id}-category_id`]}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-brand-plum/80">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 relative">
                    <select
                      value={product.status}
                      onChange={(e) => handleInlineEdit(product.id, "status", e.target.value)}
                      className={`text-xs font-medium py-1 px-2 rounded-md focus:outline-none cursor-pointer ${
                        product.status === "available"
                          ? "bg-green-100 text-green-800"
                          : product.status === "reserved"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                    {inlineSaveStatus[`${product.id}-status`] && (
                      <span className="absolute top-1/2 -translate-y-1/2 -left-10 text-[10px] text-green-600 font-medium animate-pulse bg-green-50 px-1 rounded border border-green-200">
                        {inlineSaveStatus[`${product.id}-status`]}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-brand-plum/60 whitespace-nowrap">
                    {formatRelativeTime(product.updated_at)}
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
  );
}
