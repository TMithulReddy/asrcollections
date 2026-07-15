"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { getImageUrl } from "@/lib/cloudinary";
import { createClient } from "@/utils/supabase/client";

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        config: Record<string, unknown>,
        callback: (error: unknown, result: { event: string; info: { public_id: string } }) => void
      ) => { open: () => void };
    };
  }
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    category_id: string;
    fabric_type: string;
    description: string;
    price: number;
    discount_price: number | null;
    sku: string;
    status: string;
    images: string[]; // public_ids
  };
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

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData);
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [fabricType, setFabricType] = useState(initialData?.fabric_type ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [discountPrice, setDiscountPrice] = useState(
    initialData?.discount_price?.toString() ?? ""
  );
  const [sku, setSku] = useState(initialData?.sku ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "available");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from name (unless manually edited)
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(name));
    }
  }, [name, slugManuallyEdited]);

  // Load Cloudinary Upload Widget script
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
        multiple: true,
        sources: ["local", "camera"],
        maxFiles: 10,
        resourceType: "image",
      },
      (err: unknown, result: { event: string; info: { public_id: string } }) => {
        if (err) {
          setError("Image upload failed. Please try again.");
          return;
        }
        if (result.event === "success") {
          setImages((prev) => [...prev, result.info.public_id]);
        }
      }
    );
    widget.open();
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    if (!name.trim()) { setError("Product name is required."); setIsSaving(false); return; }
    if (!categoryId) { setError("Please select a category."); setIsSaving(false); return; }
    if (!price || isNaN(Number(price))) { setError("Valid price is required."); setIsSaving(false); return; }
    if (images.length === 0) { setError("At least one product image is required."); setIsSaving(false); return; }

    try {
      const supabase = createClient();

      const productData = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        category_id: categoryId,
        fabric_type: fabricType.trim(),
        description: description.trim(),
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        sku: sku.trim(),
        status,
      };

      let productId: string;

      if (isEditing && initialData) {
        // Update existing product
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", initialData.id);

        if (updateError) throw new Error(updateError.message);
        productId = initialData.id;
      } else {
        // Insert new product
        const { data: inserted, error: insertError } = await supabase
          .from("products")
          .insert(productData)
          .select("id")
          .single();

        if (insertError) throw new Error(insertError.message);
        productId = inserted.id;
      }

      // Replace product_images: delete existing, insert current set
      await supabase.from("product_images").delete().eq("product_id", productId);

      if (images.length > 0) {
        const imageRows = images.map((publicId, index) => ({
          product_id: productId,
          image_url: publicId,
          display_order: index,
        }));

        const { error: imgError } = await supabase
          .from("product_images")
          .insert(imageRows);

        if (imgError) throw new Error(imgError.message);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
      setIsSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-brand-rose/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-plum bg-brand-white text-brand-plum";
  const labelClass = "block text-sm font-medium text-brand-plum mb-1";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className={labelClass}>Product Name *</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className={labelClass}>Slug</label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
          className={inputClass}
          placeholder="Auto-generated from name"
        />
      </div>

      {/* Category + Fabric Type row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className={labelClass}>Category *</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className={inputClass}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="fabricType" className={labelClass}>Fabric Type</label>
          <input id="fabricType" type="text" value={fabricType} onChange={(e) => setFabricType(e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
      </div>

      {/* Price + Discount Price + SKU row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="price" className={labelClass}>Price (₹) *</label>
          <input id="price" type="number" step="1" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="discountPrice" className={labelClass}>Discount Price (₹)</label>
          <input id="discountPrice" type="number" step="1" min="0" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className={inputClass} placeholder="Optional" />
        </div>
        <div>
          <label htmlFor="sku" className={labelClass}>SKU</label>
          <input id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className={labelClass}>Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Images */}
      <div>
        <label className={labelClass}>Product Images *</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((publicId, index) => (
            <div key={publicId + index} className="relative group w-24 h-32 rounded-md overflow-hidden border border-brand-rose/20 bg-brand-blush">
              <Image
                src={getImageUrl(publicId, 100)}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <button type="button" onClick={() => moveImage(index, index - 1)} className="bg-white/80 rounded p-0.5 text-xs text-brand-plum" title="Move left">
                    ←
                  </button>
                )}
                {index < images.length - 1 && (
                  <button type="button" onClick={() => moveImage(index, index + 1)} className="bg-white/80 rounded p-0.5 text-xs text-brand-plum" title="Move right">
                    →
                  </button>
                )}
              </div>
              <span className="absolute top-1 left-1 bg-brand-plum/70 text-white text-[10px] px-1 rounded">
                {index + 1}
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={openUploadWidget}
            className="w-24 h-32 rounded-md border-2 border-dashed border-brand-rose/40 flex flex-col items-center justify-center text-brand-plum/60 hover:border-brand-plum hover:text-brand-plum transition-colors"
          >
            <Upload className="w-5 h-5 mb-1" />
            <span className="text-xs">Upload</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-brand-plum text-brand-white px-6 py-2 rounded-md hover:bg-brand-plum/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-brand-plum/60 hover:text-brand-plum transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
