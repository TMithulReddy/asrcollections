"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import {
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "@/app/admin/(dashboard)/promotions/actions";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

interface Promotion {
  id: string;
  name: string;
  discount_percent: number;
  category_id: string | null;
  product_ids: string[] | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
}

interface PromotionManagerProps {
  initialPromotions: Promotion[];
  categories: Category[];
  products: Product[];
}

/** Converts a full ISO timestamp (from Supabase timestamptz) to YYYY-MM-DD for <input type="date"> */
function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  // Slice the first 10 chars covers both "2026-07-23" and "2026-07-23T00:00:00+00:00"
  return value.slice(0, 10);
}

export default function PromotionManager({
  initialPromotions,
  categories,
  products,
}: PromotionManagerProps) {
  const [promotions] = useState(initialPromotions);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDiscount, setFormDiscount] = useState("");
  const [applyType, setApplyType] = useState<"all" | "category" | "products">("all");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formProductIds, setFormProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function openAddForm() {
    setEditingId(null);
    setFormName("");
    setFormDiscount("");
    setApplyType("all");
    setFormCategoryId("");
    setFormProductIds([]);
    setProductSearch("");
    setFormStartDate("");
    setFormEndDate("");
    setFormActive(true);
    setError("");
    setShowForm(true);
  }

  function openEditForm(promo: Promotion) {
    setEditingId(promo.id);
    setFormName(promo.name);
    setFormDiscount(String(promo.discount_percent));
    
    if (promo.product_ids && promo.product_ids.length > 0) {
      setApplyType("products");
    } else if (promo.category_id) {
      setApplyType("category");
    } else {
      setApplyType("all");
    }
    
    setFormCategoryId(promo.category_id || "");
    setFormProductIds(promo.product_ids || []);
    setProductSearch("");
    
    setFormStartDate(toDateInputValue(promo.start_date));
    setFormEndDate(toDateInputValue(promo.end_date));
    setFormActive(promo.active);
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formName.trim()) {
      setError("Promotion name is required.");
      setIsSubmitting(false);
      return;
    }
    if (!formDiscount || isNaN(Number(formDiscount))) {
      setError("Valid discount percentage is required.");
      setIsSubmitting(false);
      return;
    }

    const data = {
      name: formName.trim(),
      discount_percent: Number(formDiscount),
      category_id: applyType === "category" && formCategoryId ? formCategoryId : null,
      product_ids: applyType === "products" && formProductIds.length > 0 ? formProductIds : null,
      start_date: formStartDate || null,
      end_date: formEndDate || null,
      active: formActive,
    };

    const result = editingId
      ? await updatePromotion(editingId, data)
      : await createPromotion(data);

    if (!result.success) {
      setError(result.error || "Failed to save promotion.");
      setIsSubmitting(false);
      return;
    }

    window.location.reload();
  }

  async function handleDelete(promo: Promotion) {
    if (!window.confirm(`Delete promotion "${promo.name}"?`)) return;
    setError("");
    const result = await deletePromotion(promo.id);
    if (!result.success) {
      setError(result.error || "Failed to delete promotion.");
      return;
    }
    window.location.reload();
  }

  function getAppliesTo(promo: Promotion) {
    if (promo.product_ids && promo.product_ids.length > 0) {
      return `Specific Products (${promo.product_ids.length})`;
    }
    if (promo.category_id) {
      const cat = categories.find((c) => c.id === promo.category_id);
      return `Category: ${cat?.name || "Unknown"}`;
    }
    return "All Products";
  }

  const inputClass =
    "w-full px-3 py-2 border border-brand-rose/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-plum bg-brand-white text-brand-plum";
  const labelClass = "block text-sm font-medium text-brand-plum mb-1";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading text-brand-plum">Promotions</h1>
        <button
          onClick={openAddForm}
          className="flex items-center bg-brand-plum text-brand-white px-4 py-2 rounded-md hover:bg-brand-plum/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Promotion
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading text-brand-plum">
              {editingId ? "Edit Promotion" : "New Promotion"}
            </h2>
            <button onClick={closeForm} className="text-brand-plum/40 hover:text-brand-plum">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="promo-name" className={labelClass}>Name *</label>
                <input id="promo-name" type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="promo-discount" className={labelClass}>Discount % *</label>
                <input id="promo-discount" type="number" min="1" max="100" value={formDiscount} onChange={(e) => setFormDiscount(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Apply To</label>
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={applyType === "all"} onChange={() => setApplyType("all")} className="text-brand-plum focus:ring-brand-plum" />
                  <span className="text-sm text-brand-plum">All Products</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={applyType === "category"} onChange={() => setApplyType("category")} className="text-brand-plum focus:ring-brand-plum" />
                  <span className="text-sm text-brand-plum">Category</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={applyType === "products"} onChange={() => setApplyType("products")} className="text-brand-plum focus:ring-brand-plum" />
                  <span className="text-sm text-brand-plum">Specific Products</span>
                </label>
              </div>

              {applyType === "category" && (
                <div>
                  <select id="promo-category" value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)} className={inputClass}>
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {applyType === "products" && (
                <div className="border border-brand-rose/30 rounded-md p-3">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className={inputClass + " mb-3"}
                  />
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {products
                      .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map(p => (
                        <label key={p.id} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={formProductIds.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) setFormProductIds(prev => [...prev, p.id]);
                              else setFormProductIds(prev => prev.filter(id => id !== p.id));
                            }}
                            className="rounded text-brand-plum focus:ring-brand-plum"
                          />
                          <span className="text-sm text-brand-plum">{p.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="promo-start" className={labelClass}>Start Date</label>
                <input id="promo-start" type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="promo-end" className={labelClass}>End Date</label>
                <input id="promo-end" type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="promo-active" type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} className="rounded border-brand-rose/30 text-brand-plum focus:ring-brand-plum" />
              <label htmlFor="promo-active" className="text-sm text-brand-plum">Active</label>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={isSubmitting} className="bg-brand-plum text-brand-white px-5 py-2 rounded-md hover:bg-brand-plum/90 transition-colors disabled:opacity-50">
                {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button type="button" onClick={closeForm} className="text-brand-plum/60 hover:text-brand-plum transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-brand-blush/30 border-b border-brand-rose/20 text-brand-plum text-sm font-medium">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Applies To</th>
              <th className="px-6 py-4">Date Range</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-rose/10">
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-brand-plum/60">
                  No promotions found.
                </td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-brand-blush/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-brand-plum">{promo.name}</td>
                  <td className="px-6 py-4 text-brand-plum/80">{promo.discount_percent}%</td>
                  <td className="px-6 py-4 text-brand-plum/80">{getAppliesTo(promo)}</td>
                  <td className="px-6 py-4 text-sm text-brand-plum/60">
                    {toDateInputValue(promo.start_date) || "—"} → {toDateInputValue(promo.end_date) || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${promo.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {promo.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => openEditForm(promo)} className="text-brand-plum/60 hover:text-brand-plum transition-colors" title="Edit">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(promo)} className="text-brand-rose/80 hover:text-brand-rose transition-colors" title="Delete">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
