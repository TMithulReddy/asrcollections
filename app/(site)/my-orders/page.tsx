"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Package, Truck, CheckCircle2, ClipboardCheck, LogOut } from "lucide-react";

const SESSION_KEY = "asr-my-orders-session";

interface OrderItem {
  product_name_snapshot: string;
  quantity: number;
  price_snapshot: number;
}

interface Order {
  order_ref: string;
  status: string;
  fulfillment_stage: string | null;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

const STAGES = [
  { value: "confirmed", label: "Confirmed", icon: ClipboardCheck },
  { value: "packaged", label: "Packaged", icon: Package },
  { value: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { value: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

function stageIndex(stage: string | null): number {
  return STAGES.findIndex((s) => s.value === stage);
}

/** Display label for order status — 'pending' shows as 'Reserved' */
function statusLabel(status: string): string {
  if (status === "pending") return "Reserved";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    expired: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function FulfillmentTimeline({ currentStage }: { currentStage: string | null }) {
  const current = stageIndex(currentStage);

  return (
    <div className="mt-4">
      {/* Desktop / wider view */}
      <div className="hidden sm:flex items-center gap-0">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isDone = i < current;
          const isCurrent = i === current;

          return (
            <div key={stage.value} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                    isDone
                      ? "bg-green-100 border-green-500 text-green-600"
                      : isCurrent
                        ? "bg-brand-mauve/10 border-brand-mauve text-brand-mauve ring-2 ring-brand-mauve/20"
                        : "bg-brand-blush/40 border-brand-blushDark text-brand-plum/30"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-medium leading-tight text-center max-w-[72px] ${
                    isDone
                      ? "text-green-700"
                      : isCurrent
                        ? "text-brand-mauve"
                        : "text-brand-plum/40"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 mt-[-18px] ${
                    i < current ? "bg-green-400" : "bg-brand-blushDark"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile compact view */}
      <div className="flex sm:hidden flex-col gap-2">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isDone = i < current;
          const isCurrent = i === current;

          return (
            <div
              key={stage.value}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isDone
                  ? "bg-green-50 text-green-700"
                  : isCurrent
                    ? "bg-brand-mauve/10 text-brand-mauve"
                    : "bg-brand-blush/30 text-brand-plum/35"
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
              {stage.label}
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-green-500" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  const fetchOrders = useCallback(async (lookupName: string, lookupPhone: string) => {
    setIsLoading(true);
    setSubmitError("");

    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_customer_orders", {
      p_phone: lookupPhone.trim(),
      p_name: lookupName.trim(),
    });

    if (error) {
      setSubmitError(error.message);
      setIsLoading(false);
      return false;
    }

    if (!data || data.length === 0) {
      setSubmitError("No orders found for that name and phone number — please check and try again.");
      setIsLoading(false);
      return false;
    }

    setOrders(data as Order[]);
    setIsLoading(false);
    return true;
  }, []);

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const { name: sName, phone: sPhone } = JSON.parse(stored);
        if (sName && sPhone) {
          setName(sName);
          setPhone(sPhone);
          fetchOrders(sName, sPhone).then((ok) => {
            if (!ok) {
              // Stale session — clear it
              sessionStorage.removeItem(SESSION_KEY);
            }
            setSessionReady(true);
          });
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }
    setSessionReady(true);
  }, [fetchOrders]);

  function handleExit() {
    sessionStorage.removeItem(SESSION_KEY);
    setOrders(null);
    setName("");
    setPhone("");
    setSubmitError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate
    let valid = true;
    setNameError("");
    setPhoneError("");
    setSubmitError("");

    if (!name.trim()) {
      setNameError("Please enter your name.");
      valid = false;
    }
    if (!phone.trim()) {
      setPhoneError("Please enter your phone number.");
      valid = false;
    }
    if (!valid) return;

    const ok = await fetchOrders(name, phone);
    if (ok) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: name.trim(), phone: phone.trim() }));
    }
  }

  // Don't render anything until we've checked sessionStorage
  if (!sessionReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-brand-mauve border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Lookup form ──
  if (!orders) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-brand-blushDark bg-brand-white p-8 shadow-sm">
            <h1 className="font-heading text-2xl text-brand-plum text-center">
              My Orders
            </h1>
            <p className="mt-2 text-sm text-brand-plum/60 text-center">
              Enter the name and phone number you used when placing your order.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="my-orders-name"
                  className="block text-sm text-brand-plum"
                >
                  Name
                </label>
                <input
                  id="my-orders-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-blushDark px-3 py-2 text-sm text-brand-plum focus:outline-none focus:ring-2 focus:ring-brand-mauve/30 focus:border-brand-mauve transition-colors"
                  autoComplete="name"
                  placeholder="Your full name"
                />
                {nameError && (
                  <p className="mt-1 text-xs text-brand-rose">{nameError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="my-orders-phone"
                  className="block text-sm text-brand-plum"
                >
                  Phone
                </label>
                <input
                  id="my-orders-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-blushDark px-3 py-2 text-sm text-brand-plum focus:outline-none focus:ring-2 focus:ring-brand-mauve/30 focus:border-brand-mauve transition-colors"
                  autoComplete="tel"
                  placeholder="Your phone number"
                />
                {phoneError && (
                  <p className="mt-1 text-xs text-brand-rose">{phoneError}</p>
                )}
              </div>

              {submitError && (
                <p className="text-sm text-brand-rose">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center w-full rounded-lg bg-brand-mauve px-5 py-2.5 text-sm font-medium text-brand-white transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Looking up…" : "View My Orders"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Orders list ──
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl text-brand-plum">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-brand-plum/60">
            Showing orders for {name}
          </p>
        </div>
        <button
          onClick={handleExit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-blushDark px-3 py-2 text-sm font-medium text-brand-plum hover:bg-brand-blush/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Exit
        </button>
      </div>

      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order.order_ref}
            className="rounded-xl border border-brand-blushDark bg-brand-white p-5 sm:p-6 shadow-sm"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-brand-plum">
                  {order.order_ref}
                </p>
                <p className="mt-0.5 text-xs text-brand-plum/50">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.status} />
                <span className="text-sm font-medium text-brand-plum">
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="mt-4 border-t border-brand-blush pt-3">
              <ul className="space-y-1">
                {order.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm text-brand-plum/80"
                  >
                    <span>
                      {item.product_name_snapshot}
                      <span className="text-brand-plum/50"> ×{item.quantity}</span>
                    </span>
                    <span className="text-brand-plum/50">
                      ₹{Number(item.price_snapshot).toLocaleString("en-IN")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fulfillment timeline — only for confirmed orders */}
            {order.status === "confirmed" && (
              <FulfillmentTimeline currentStage={order.fulfillment_stage} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
