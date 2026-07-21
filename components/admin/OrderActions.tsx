"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { approveOrder, rejectOrder, advanceFulfillmentStage } from "@/app/admin/(dashboard)/orders/actions";

interface OrderActionsProps {
  orderId: string;
  status: string;
  fulfillmentStage: string | null;
}

const FULFILLMENT_STAGES = [
  { value: "confirmed", label: "Confirmed" },
  { value: "packaged", label: "Packaged" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
] as const;

export default function OrderActions({ orderId, status, fulfillmentStage }: OrderActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const isPending = status === "pending";
  const isConfirmed = status === "confirmed";

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

  async function handleStageChange(newStage: string) {
    if (newStage === fulfillmentStage) return;
    setIsProcessing(true);
    setError("");
    const result = await advanceFulfillmentStage(orderId, newStage);
    if (!result.success) {
      setError(result.error || "Failed to update fulfillment stage.");
      setIsProcessing(false);
    } else {
      window.location.reload();
    }
  }

  if (isPending) {
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

  if (isConfirmed) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={fulfillmentStage || "confirmed"}
          onChange={(e) => handleStageChange(e.target.value)}
          disabled={isProcessing}
          className="text-xs rounded-md border border-brand-rose/40 bg-brand-white text-brand-plum px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-plum disabled:opacity-50 transition-colors"
        >
          {FULFILLMENT_STAGES.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }

  return null;
}
