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

interface ProductUnit {
  id: string;
  sku: string | null;
  status: string;
}

interface ProductAvailability {
  total_units: number;
  sold_units: number;
  available_units: number;
}

interface ProductFormProps {
  categories: Category[];
  availability?: ProductAvailability;
  initialData?: {
    id: string;
    name: string;
    slug: string;
    category_id: string;
    fabric_type: string;
    description: string;
    price: number;
    discount_price: number | null;
    is_featured: boolean;
    units: ProductUnit[];
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

export default function ProductForm({ categories, initialData, availability }: ProductFormProps) {
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

  // Sale toggle state
  const initialOnSale =
    initialData != null && initialData.discount_price != null && initialData.discount_price > 0;
  const [onSale, setOnSale] = useState(initialOnSale);
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false);

  // Back-calculate initial discount percentage from price & discount_price
  const computeInitialPct = (): string => {
    if (
      initialData &&
      initialData.discount_price != null &&
      initialData.discount_price > 0 &&
      initialData.price > 0
    ) {
      const pct = ((initialData.price - initialData.discount_price) / initialData.price) * 100;
      return Math.round(pct).toString();
    }
    return "";
  };
  const [discountPct, setDiscountPct] = useState(computeInitialPct);

  // Units state
  const existingUnits: ProductUnit[] = initialData?.units ?? [];
  const [unitCount, setUnitCount] = useState(
    existingUnits.length > 0 ? existingUnits.length : 1
  );
  const [unitSkus, setUnitSkus] = useState<string[]>(() => {
    if (existingUnits.length > 0) {
      return existingUnits.map((u) => u.sku ?? "");
    }
    return [""];
  });

  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from name (unless manually edited)
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(name));
    }
  }, [name, slugManuallyEdited]);

  // Recalculate discount_price whenever price or discountPct changes and sale is on
  useEffect(() => {
    if (onSale && discountPct !== "" && price !== "") {
      const p = Number(price);
      const pct = Number(discountPct);
      if (!isNaN(p) && !isNaN(pct) && pct >= 0 && pct <= 100) {
        const dp = Math.round(p - (p * pct) / 100);
        setDiscountPrice(dp.toString());
      }
    }
  }, [price, discountPct, onSale]);

  // When unit count changes, grow/shrink the SKU array
  const handleUnitCountChange = (newCount: number) => {
    if (newCount < 1) newCount = 1;
    setUnitCount(newCount);
    setUnitSkus((prev) => {
      if (newCount > prev.length) {
        return [...prev, ...Array(newCount - prev.length).fill("")];
      }
      return prev.slice(0, newCount);
    });
  };

  const handleSkuChange = (index: number, value: string) => {
    setUnitSkus((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

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
        folder: "asr-products",
        public_id_prefix: "asr-products",
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

    // Validate duplicate SKUs within this product
    const filledSkus = unitSkus.filter((s) => s.trim() !== "");
    const uniqueSkus = new Set(filledSkus);
    if (uniqueSkus.size < filledSkus.length) {
      setError("Duplicate SKU within this product.");
      setIsSaving(false);
      return;
    }

    // For editing: validate that we don't remove non-available units
    if (isEditing && initialData) {
      const nonAvailableCount = existingUnits.filter(
        (u) => u.status === "reserved" || u.status === "sold"
      ).length;
      if (unitCount < nonAvailableCount) {
        setError(
          `Cannot remove unit — ${nonAvailableCount} unit${nonAvailableCount !== 1 ? "s are" : " is"} reserved or sold and must stay recorded.`
        );
        setIsSaving(false);
        return;
      }
    }

    try {
      const supabase = createClient();

      // Build product payload WITHOUT sku and status (dead columns)
      const computedDiscountPrice = onSale && discountPrice ? Number(discountPrice) : null;

      const productData = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        category_id: categoryId,
        fabric_type: fabricType.trim(),
        description: description.trim(),
        price: Number(price),
        discount_price: computedDiscountPrice,
        is_featured: isFeatured,
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

      // ── Sync product_units ──
      if (isEditing && initialData) {
        // Existing units, ordered same as they were passed in
        const kept = existingUnits.slice(0, unitCount);
        const removedCandidates = existingUnits.slice(unitCount);

        // Update SKUs on kept units
        for (let i = 0; i < kept.length; i++) {
          const newSku = unitSkus[i]?.trim() || null;
          if (newSku !== kept[i].sku) {
            const { error: updErr } = await supabase
              .from("product_units")
              .update({ sku: newSku })
              .eq("id", kept[i].id);
            if (updErr) throw new Error(updErr.message);
          }
        }

        // Delete removed units (only available ones — validation above ensures this is safe)
        for (const unit of removedCandidates) {
          if (unit.status === "available") {
            const { error: delErr } = await supabase
              .from("product_units")
              .delete()
              .eq("id", unit.id);
            if (delErr) throw new Error(delErr.message);
          }
        }

        // Insert new units if count increased
        if (unitCount > existingUnits.length) {
          const newRows = [];
          for (let i = existingUnits.length; i < unitCount; i++) {
            newRows.push({
              product_id: productId,
              sku: unitSkus[i]?.trim() || null,
              status: "available",
            });
          }
          const { error: insErr } = await supabase
            .from("product_units")
            .insert(newRows);
          if (insErr) throw new Error(insErr.message);
        }
      } else {
        // New product: insert all units
        const newRows = [];
        for (let i = 0; i < unitCount; i++) {
          newRows.push({
            product_id: productId,
            sku: unitSkus[i]?.trim() || null,
            status: "available",
          });
        }
        const { error: insErr } = await supabase
          .from("product_units")
          .insert(newRows);
        if (insErr) throw new Error(insErr.message);
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

      {/* Price + Sale Toggle */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className={labelClass}>Price (₹) *</label>
            <input id="price" type="number" step="1" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>This item is on sale?</label>
            <div className="flex items-center gap-4 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="onSale"
                  checked={onSale}
                  onChange={() => setOnSale(true)}
                  className="accent-brand-plum"
                />
                <span className="text-sm text-brand-plum">Yes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="onSale"
                  checked={!onSale}
                  onChange={() => {
                    setOnSale(false);
                    setDiscountPct("");
                    setDiscountPrice("");
                  }}
                  className="accent-brand-plum"
                />
                <span className="text-sm text-brand-plum">No</span>
              </label>
            </div>
          </div>
          <div>
            <label className={labelClass}>Show on Homepage?</label>
            <div className="flex items-center gap-4 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="accent-brand-plum w-4 h-4 rounded"
                />
                <span className="text-sm text-brand-plum">Featured</span>
              </label>
            </div>
          </div>
        </div>

        {onSale && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-0">
            <div>
              <label htmlFor="discountPct" className={labelClass}>Discount %</label>
              <input
                id="discountPct"
                type="number"
                step="1"
                min="0"
                max="100"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                className={inputClass}
                placeholder="e.g. 20"
              />
            </div>
            <div>
              <label htmlFor="discountPrice" className={labelClass}>Discount Price (₹)</label>
              <input
                id="discountPrice"
                type="number"
                step="1"
                min="0"
                value={discountPrice}
                readOnly
                className={`${inputClass} bg-brand-blush/50 cursor-not-allowed`}
                placeholder="Auto-calculated"
              />
            </div>
          </div>
        )}
      </div>

      {/* Number of Units + per-unit SKUs */}
      <div className="space-y-3">
        {isEditing && availability && (
          <div className="text-sm text-brand-plum/70 bg-brand-blush/40 border border-brand-rose/20 rounded-md px-3 py-2">
            <span className="font-medium text-green-700">{availability.available_units} available</span>
            {" · "}
            <span className="font-medium text-red-700">{availability.sold_units} sold</span>
            {" · "}
            <span className="font-medium text-brand-plum">{availability.total_units} total</span>
          </div>
        )}
        <div>
          <label htmlFor="unitCount" className={labelClass}>Number of Units</label>
          <input
            id="unitCount"
            type="number"
            min="1"
            value={unitCount}
            onChange={(e) => handleUnitCountChange(Math.max(1, parseInt(e.target.value) || 1))}
            className={`${inputClass} max-w-[140px]`}
          />
        </div>

        <div className="space-y-2">
          {Array.from({ length: unitCount }).map((_, i) => {
            const existingUnit = existingUnits[i];
            const statusBadge = existingUnit ? (
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                  existingUnit.status === "available"
                    ? "bg-green-100 text-green-700"
                    : existingUnit.status === "reserved"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {existingUnit.status}
              </span>
            ) : null;

            return (
              <div key={i}>
                <label htmlFor={`sku-${i}`} className={labelClass}>
                  Unit {i + 1} SKU
                  {statusBadge}
                </label>
                <input
                  id={`sku-${i}`}
                  type="text"
                  value={unitSkus[i] ?? ""}
                  onChange={(e) => handleSkuChange(i, e.target.value)}
                  className={inputClass}
                  placeholder="Optional"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className={labelClass}>Product Images *</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((publicId, index) => (
            <div
              key={publicId + index}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
                if (!isNaN(fromIndex) && fromIndex !== index) {
                  moveImage(fromIndex, index);
                }
              }}
              className={`relative group w-24 h-32 rounded-md overflow-hidden bg-brand-blush cursor-move transition-all ${
                index === 0 ? "border-2 border-brand-plum ring-2 ring-brand-plum/20" : "border border-brand-rose/20"
              }`}
            >
              <Image
                src={getImageUrl(publicId, 100)}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
              <span className={`absolute top-1 left-1 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm ${index === 0 ? "bg-brand-plum" : "bg-brand-plum/60"}`}>
                {index === 0 ? "Primary" : index + 1}
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
