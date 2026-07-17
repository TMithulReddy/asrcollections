"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import { getImageUrl } from "@/lib/cloudinary";
import {
  createBanner,
  updateBanner,
  deleteBanner,
} from "@/app/admin/(dashboard)/banners/actions";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
}

export default function BannerManager({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners] = useState(initialBanners);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formOrder, setFormOrder] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load Cloudinary script
  useEffect(() => {
    if (document.getElementById("cloudinary-widget-script")) return;
    const script = document.createElement("script");
    script.id = "cloudinary-widget-script";
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const openUploadWidget = useCallback(() => {
    if (!window.cloudinary) {
      setError("Image upload is still loading. Please try again in a moment.");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "hzxrxgf1",
        uploadPreset: "asr_products",
        folder: "asr-banners",
        public_id_prefix: "asr-banners",
        multiple: false,
        sources: ["local", "camera"],
        resourceType: "image",
      },
      (err: unknown, result: { event: string; info: { public_id: string } }) => {
        if (err) {
          setError("Image upload failed. Please try again.");
          return;
        }
        if (result.event === "success") {
          setFormImage(result.info.public_id);
        }
      }
    );
    widget.open();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setFormTitle("");
    setFormImage("");
    setFormLink("");
    setFormOrder(String(banners.length + 1));
    setFormStartDate("");
    setFormEndDate("");
    setFormActive(true);
    setError("");
    setShowForm(true);
  }

  function openEditForm(banner: Banner) {
    setEditingId(banner.id);
    setFormTitle(banner.title);
    setFormImage(banner.image_url);
    setFormLink(banner.link_url || "");
    setFormOrder(String(banner.display_order));
    setFormStartDate(banner.start_date || "");
    setFormEndDate(banner.end_date || "");
    setFormActive(banner.active);
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

    if (!formTitle.trim()) {
      setError("Banner title is required.");
      setIsSubmitting(false);
      return;
    }
    if (!formImage.trim()) {
      setError("An image is required.");
      setIsSubmitting(false);
      return;
    }

    const data = {
      title: formTitle.trim(),
      image_url: formImage.trim(),
      link_url: formLink.trim() || null,
      display_order: Number(formOrder) || 0,
      start_date: formStartDate || null,
      end_date: formEndDate || null,
      active: formActive,
    };

    const result = editingId
      ? await updateBanner(editingId, data)
      : await createBanner(data);

    if (!result.success) {
      setError(result.error || "Failed to save banner.");
      setIsSubmitting(false);
      return;
    }

    window.location.reload();
  }

  async function handleDelete(banner: Banner) {
    if (!window.confirm(`Delete banner "${banner.title}"?`)) return;
    setError("");
    const result = await deleteBanner(banner.id);
    if (!result.success) {
      setError(result.error || "Failed to delete banner.");
      return;
    }
    window.location.reload();
  }

  const inputClass =
    "w-full px-3 py-2 border border-brand-rose/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-plum bg-brand-white text-brand-plum";
  const labelClass = "block text-sm font-medium text-brand-plum mb-1";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading text-brand-plum">Banners</h1>
        <button
          onClick={openAddForm}
          className="flex items-center bg-brand-plum text-brand-white px-4 py-2 rounded-md hover:bg-brand-plum/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
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
              {editingId ? "Edit Banner" : "New Banner"}
            </h2>
            <button onClick={closeForm} className="text-brand-plum/40 hover:text-brand-plum">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="banner-title" className={labelClass}>Title *</label>
                <input id="banner-title" type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="banner-link" className={labelClass}>Link URL</label>
                <input id="banner-link" type="text" value={formLink} onChange={(e) => setFormLink(e.target.value)} className={inputClass} placeholder="/sarees?fabric=kanjivaram" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Image *</label>
              <div className="mt-2 flex items-center gap-4">
                {formImage ? (
                  <div className="relative w-40 h-24 rounded-md overflow-hidden border border-brand-rose/20 bg-brand-blush">
                    <Image
                      src={getImageUrl(formImage, 300)}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormImage("")}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openUploadWidget}
                    className="w-40 h-24 rounded-md border-2 border-dashed border-brand-rose/40 flex flex-col items-center justify-center text-brand-plum/60 hover:border-brand-plum hover:text-brand-plum transition-colors"
                  >
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs">Upload Banner Image</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="banner-order" className={labelClass}>Display Order</label>
                <input id="banner-order" type="number" value={formOrder} onChange={(e) => setFormOrder(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="banner-start" className={labelClass}>Start Date</label>
                <input id="banner-start" type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="banner-end" className={labelClass}>End Date</label>
                <input id="banner-end" type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input id="banner-active" type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} className="rounded border-brand-rose/30 text-brand-plum focus:ring-brand-plum" />
              <label htmlFor="banner-active" className="text-sm text-brand-plum">Active</label>
            </div>

            <div className="flex items-center gap-3 pt-2">
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
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Date Range</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-rose/10">
            {banners.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-brand-plum/60">
                  No banners found.
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-brand-blush/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative w-24 h-12 bg-brand-blush rounded overflow-hidden">
                      <Image
                        src={getImageUrl(banner.image_url, 150)}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-brand-plum">{banner.title}</td>
                  <td className="px-6 py-4 text-brand-plum/80">{banner.display_order}</td>
                  <td className="px-6 py-4 text-sm text-brand-plum/60">
                    {banner.start_date || "—"} → {banner.end_date || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {banner.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => openEditForm(banner)} className="text-brand-plum/60 hover:text-brand-plum transition-colors" title="Edit">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(banner)} className="text-brand-rose/80 hover:text-brand-rose transition-colors" title="Delete">
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
