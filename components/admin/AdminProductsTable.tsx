"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Star, Sparkles, Tag, X } from "lucide-react";
import { getImageUrl } from "@/lib/cloudinary";
import { formatRelativeTime } from "@/lib/time-utils";
import ProductListActions from "./ProductListActions";
import {
  bulkUpdateCategory,
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
  discount_price: number | null;
  category_id: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  updated_at: string;
  product_images?: ProductImage[];
  availability: {
    available_units: number;
    sold_units: number;
    total_units: number;
  };
}

interface AdminProductsTableProps {
  products: Product[];
  categories: Category[];
}

export default function AdminProductsTable({ products, categories }: AdminProductsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [inlineSaveStatus, setInlineSaveStatus] = useState<Record<string, string>>({});
  
  const [activeSalePopover, setActiveSalePopover] = useState<string | null>(null);
  const [saleInputType, setSaleInputType] = useState<"percent" | "amount">("percent");
  const [saleInputValue, setSaleInputValue] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActiveSalePopover(null);
      }
    }
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveSalePopover(null);
      }
    }

    if (activeSalePopover) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [activeSalePopover]);

  const handleApplySale = async (product: Product) => {
    let newDiscountPrice: number | null = null;
    const val = parseFloat(saleInputValue);
    
    if (!isNaN(val) && val > 0) {
      if (saleInputType === "percent") {
        const discountAmt = product.price * (val / 100);
        newDiscountPrice = Math.max(0, Math.round(product.price - discountAmt));
      } else {
        newDiscountPrice = Math.max(0, Math.round(product.price - val));
      }
    }

    await handleInlineEdit(product.id, "discount_price", newDiscountPrice);
    setActiveSalePopover(null);
  };

  const handleRemoveSale = async (product: Product) => {
    await handleInlineEdit(product.id, "discount_price", null);
    setActiveSalePopover(null);
  };

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
    setInlineSaveStatus((prev: Record<string, string>) => ({ ...prev, [key]: "Saved ✓" }));
    setTimeout(() => {
      setInlineSaveStatus((prev: Record<string, string>) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 2000);
  };

  const handleInlineEdit = async (productId: string, field: "category_id" | "is_featured" | "is_new_arrival" | "discount_price", value: string | boolean | number | null) => {
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
              onClick={handleBulkDelete}
              className="px-2 py-1 text-xs border border-red-200 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete selected
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
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
            <th className="px-6 py-4">Sale</th>
            <th className="px-6 py-4">Homepage</th>
            <th className="px-6 py-4">New Arrival</th>
            <th className="px-6 py-4">Last updated</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-rose/10">
          {!products || products.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-6 py-8 text-center text-brand-plum/60">
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
                    {product.availability.available_units > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {product.availability.available_units} available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Sold out
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 relative">
                    <button
                      onClick={() => {
                        if (activeSalePopover === product.id) {
                          setActiveSalePopover(null);
                        } else {
                          setActiveSalePopover(product.id);
                          setSaleInputType("percent");
                          setSaleInputValue("");
                        }
                      }}
                      className="p-1 rounded hover:bg-brand-blush transition-colors"
                      title="Quick edit sale"
                    >
                      <Tag 
                        className={`w-5 h-5 ${product.discount_price != null ? "fill-brand-mauve text-brand-mauve" : "text-brand-plum/40"}`} 
                      />
                    </button>
                    {inlineSaveStatus[`${product.id}-discount_price`] && (
                      <span className="absolute top-1/2 -translate-y-1/2 -right-12 text-[10px] text-green-600 font-medium animate-pulse bg-green-50 px-1 rounded border border-green-200">
                        {inlineSaveStatus[`${product.id}-discount_price`]}
                      </span>
                    )}
                    {activeSalePopover === product.id && (
                      <div 
                        ref={popoverRef}
                        className="absolute left-0 top-full mt-2 z-50 w-64 bg-white rounded-lg shadow-xl border border-brand-rose/20 p-4"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-brand-plum text-sm">Set Sale Price</h4>
                          <button onClick={() => setActiveSalePopover(null)} className="text-brand-plum/40 hover:text-brand-plum">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {product.discount_price != null && (
                          <div className="mb-3 p-2 bg-brand-blush/30 rounded text-xs text-brand-plum flex flex-col items-start gap-1">
                            <span>Currently: ₹{product.discount_price.toLocaleString("en-IN")}</span>
                            <button 
                              onClick={() => handleRemoveSale(product)}
                              className="text-red-600 hover:underline font-medium"
                            >
                              Remove from sale
                            </button>
                          </div>
                        )}

                        <div className="flex bg-brand-blush/50 rounded p-1 mb-3">
                          <button
                            className={`flex-1 text-xs py-1 rounded font-medium transition-colors ${saleInputType === "percent" ? "bg-white shadow-sm text-brand-plum" : "text-brand-plum/60"}`}
                            onClick={() => setSaleInputType("percent")}
                          >
                            % off
                          </button>
                          <button
                            className={`flex-1 text-xs py-1 rounded font-medium transition-colors ${saleInputType === "amount" ? "bg-white shadow-sm text-brand-plum" : "text-brand-plum/60"}`}
                            onClick={() => setSaleInputType("amount")}
                          >
                            ₹ off
                          </button>
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-xs text-brand-plum/60 mb-1">
                            {saleInputType === "percent" ? "Discount %" : "Amount off (₹)"}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={saleInputValue}
                            onChange={(e) => setSaleInputValue(e.target.value)}
                            className="w-full border border-brand-rose/40 rounded px-2 py-1.5 text-sm text-brand-plum focus:outline-none focus:border-brand-plum"
                            placeholder={saleInputType === "percent" ? "e.g. 15" : "e.g. 500"}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setActiveSalePopover(null)}
                            className="px-3 py-1.5 text-xs text-brand-plum/60 hover:text-brand-plum"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleApplySale(product)}
                            disabled={!saleInputValue}
                            className="px-3 py-1.5 text-xs bg-brand-plum text-white rounded hover:bg-brand-plum/90 disabled:opacity-50"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 relative">
                    <button
                      onClick={() => handleInlineEdit(product.id, "is_featured", !product.is_featured)}
                      className="p-1 rounded hover:bg-brand-blush transition-colors"
                      title={product.is_featured ? "Remove from homepage" : "Show on homepage"}
                    >
                      <Star 
                        className={`w-5 h-5 ${product.is_featured ? "fill-brand-mauve text-brand-mauve" : "text-brand-plum/40"}`} 
                      />
                    </button>
                    {inlineSaveStatus[`${product.id}-is_featured`] && (
                      <span className="absolute top-1/2 -translate-y-1/2 -right-10 text-[10px] text-green-600 font-medium animate-pulse bg-green-50 px-1 rounded border border-green-200">
                        {inlineSaveStatus[`${product.id}-is_featured`]}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 relative">
                    <button
                      onClick={() => handleInlineEdit(product.id, "is_new_arrival", !product.is_new_arrival)}
                      className="p-1 rounded hover:bg-brand-blush transition-colors"
                      title={product.is_new_arrival ? "Remove from New Arrivals" : "Mark as New Arrival"}
                    >
                      <Sparkles 
                        className={`w-5 h-5 ${product.is_new_arrival ? "fill-brand-mauve text-brand-mauve" : "text-brand-plum/40"}`} 
                      />
                    </button>
                    {inlineSaveStatus[`${product.id}-is_new_arrival`] && (
                      <span className="absolute top-1/2 -translate-y-1/2 -right-10 text-[10px] text-green-600 font-medium animate-pulse bg-green-50 px-1 rounded border border-green-200">
                        {inlineSaveStatus[`${product.id}-is_new_arrival`]}
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
    </div>
  );
}
