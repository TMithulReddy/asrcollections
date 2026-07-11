"use client";

import { useState } from "react";
import { Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";

interface ProductListActionsProps {
  productId: string;
}

export default function ProductListActions({ productId }: ProductListActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProduct(productId);
    } catch (error) {
      alert("Failed to delete product. Please try again.");
      console.error(error);
      setIsDeleting(false); // only reset if failed, on success page revalidates
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="text-brand-plum/60 hover:text-brand-plum transition-colors"
        title="Edit Product"
      >
        <Edit className="w-5 h-5" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-brand-rose/80 hover:text-brand-rose transition-colors disabled:opacity-50"
        title="Delete Product"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
