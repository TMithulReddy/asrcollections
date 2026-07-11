"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, X } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/admin/(dashboard)/categories/actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  product_count: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formOrder, setFormOrder] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function openAddForm() {
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setSlugManuallyEdited(false);
    setFormOrder(String(categories.length + 1));
    setError("");
    setShowForm(true);
  }

  function openEditForm(cat: Category) {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setSlugManuallyEdited(true);
    setFormOrder(String(cat.display_order));
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  function handleNameChange(value: string) {
    setFormName(value);
    if (!slugManuallyEdited) {
      setFormSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formName.trim()) {
      setError("Category name is required.");
      setIsSubmitting(false);
      return;
    }

    const data = {
      name: formName.trim(),
      slug: formSlug.trim() || slugify(formName),
      display_order: Number(formOrder) || 0,
    };

    const result = editingId
      ? await updateCategory(editingId, data)
      : await createCategory(data);

    if (!result.success) {
      setError(result.error || "Failed to save category.");
      setIsSubmitting(false);
      return;
    }

    // Refresh categories — a proper revalidation happens server-side,
    // but we also refresh client state by reloading the page
    window.location.reload();
  }

  async function handleDelete(cat: Category) {
    if (
      !window.confirm(
        `Are you sure you want to delete "${cat.name}"?`
      )
    ) {
      return;
    }

    setError("");
    const result = await deleteCategory(cat.id);

    if (!result.success) {
      setError(result.error || "Failed to delete category.");
      return;
    }

    // Refresh
    window.location.reload();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading text-brand-plum">Categories</h1>
        <button
          onClick={openAddForm}
          className="flex items-center bg-brand-plum text-brand-white px-4 py-2 rounded-md hover:bg-brand-plum/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="mb-6 bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading text-brand-plum">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            <button onClick={closeForm} className="text-brand-plum/40 hover:text-brand-plum">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="cat-name"
                  className="block text-sm font-medium text-brand-plum mb-1"
                >
                  Name *
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-brand-rose/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-plum bg-brand-white text-brand-plum"
                />
              </div>
              <div>
                <label
                  htmlFor="cat-slug"
                  className="block text-sm font-medium text-brand-plum mb-1"
                >
                  Slug
                </label>
                <input
                  id="cat-slug"
                  type="text"
                  value={formSlug}
                  onChange={(e) => {
                    setFormSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="w-full px-3 py-2 border border-brand-rose/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-plum bg-brand-white text-brand-plum"
                  placeholder="Auto-generated"
                />
              </div>
              <div>
                <label
                  htmlFor="cat-order"
                  className="block text-sm font-medium text-brand-plum mb-1"
                >
                  Display Order
                </label>
                <input
                  id="cat-order"
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-rose/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-plum bg-brand-white text-brand-plum"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-plum text-brand-white px-5 py-2 rounded-md hover:bg-brand-plum/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="text-brand-plum/60 hover:text-brand-plum transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-blush/30 border-b border-brand-rose/20 text-brand-plum text-sm font-medium">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4">Display Order</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-rose/10">
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-brand-plum/60"
                >
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-brand-blush/10 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-brand-plum">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 text-brand-plum/60 text-sm">
                    {cat.slug}
                  </td>
                  <td className="px-6 py-4 text-brand-plum/80">
                    {cat.product_count}
                  </td>
                  <td className="px-6 py-4 text-brand-plum/80">
                    {cat.display_order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => openEditForm(cat)}
                        className="text-brand-plum/60 hover:text-brand-plum transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="text-brand-rose/80 hover:text-brand-rose transition-colors"
                        title="Delete"
                      >
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
