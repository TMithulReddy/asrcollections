"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-plum transition-colors hover:text-brand-mauve"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
