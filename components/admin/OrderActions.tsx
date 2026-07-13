"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { approveOrder, rejectOrder } from "@/app/admin/(dashboard)/orders/actions";

interface OrderActionsProps {
  orderId: string;
  status: string;
}

export default function OrderActions({ orderId, status }: OrderActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const isPending = status === "pending";

  async function handleApprove() {
    if (!window.confirm("Approve this order? This will mark all products as SOLD.")) return;
    setIsProcessing(true);
    setError("");
    const result = await approveOrder(orderId);
    if (!result.success) {
      setError(result.error || "Failed to approve order.");
      setIsProcessing(false);
    } else {
      window.location.reload();
    }
  }

  async function handleReject() {
    if (!window.confirm("Reject this order? This will release all products back to AVAILABLE.")) return;
    setIsProcessing(true);
    setError("");
    const result = await rejectOrder(orderId);
    if (!result.success) {
      setError(result.error || "Failed to reject order.");
      setIsProcessing(false);
    } else {
      window.location.reload();
    }
  }

  if (!isPending) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={isProcessing}
        className="p-1.5 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
        title="Approve Order"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={handleReject}
        disabled={isProcessing}
        className="p-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
        title="Reject Order"
      >
        <X className="w-4 h-4" />
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
