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

interface Promotion {
  id: string;
  name: string;
  discount_percent: number;
  category_id: string | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
}

interface PromotionManagerProps {
  initialPromotions: Promotion[];
  categories: Category[];
}

export default function PromotionManager({
  initialPromotions,
  categories,
}: PromotionManagerProps) {
  const [promotions] = useState(initialPromotions);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDiscount, setFormDiscount] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function openAddForm() {
    setEditingId(null);
    setFormName("");
    setFormDiscount("");
    setFormCategoryId("");
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
    setFormCategoryId(promo.category_id || "");
    setFormStartDate(promo.start_date || "");
    setFormEndDate(promo.end_date || "");
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
      category_id: formCategoryId || null,
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

  function getCategoryName(catId: string | null) {
    if (!catId) return "All Products";
    const cat = categories.find((c) => c.id === catId);
    return cat?.name || "Unknown";
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
              <label htmlFor="promo-category" className={labelClass}>Apply to Category</label>
              <select id="promo-category" value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)} className={inputClass}>
                <option value="">All Products</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-brand-plum/50 mt-1">Leave empty to apply to all products, or pick a specific category.</p>
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
        <table className="w-full text-left border-collapse">
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
                  <td className="px-6 py-4 text-brand-plum/80">{getCategoryName(promo.category_id)}</td>
                  <td className="px-6 py-4 text-sm text-brand-plum/60">
                    {promo.start_date || "—"} → {promo.end_date || "—"}
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
  );
}
