"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { buildBuyNowMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

interface BuyNowButtonProps {
  productSlug: string;
  disabled?: boolean;
}

type ModalStep = "form" | "success";

function validatePhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 10;
}

export default function BuyNowButton({
  productSlug,
  disabled = false,
}: BuyNowButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  function resetModal() {
    setStep("form");
    setName("");
    setPhone("");
    setNameError("");
    setPhoneError("");
    setSubmitError("");
    setOrderRef("");
    setIsSubmitting(false);
  }

  function openModal() {
    resetModal();
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    resetModal();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    let valid = true;

    if (!trimmedName) {
      setNameError("Name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!validatePhone(trimmedPhone)) {
      setPhoneError("Phone must be at least 10 digits.");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!valid) {
      return;
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    if (!whatsappNumber) {
      setSubmitError("WhatsApp number is not configured.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/buy-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          name: trimmedName,
          phone: trimmedPhone,
        }),
      });

      const data = (await response.json()) as {
        orderRef?: string;
        productName?: string;
        price?: number;
        error?: string;
      };

      if (!response.ok || !data.orderRef || !data.productName || !data.price) {
        setSubmitError(
          data.error ?? "Something went wrong, please try again."
        );
        return;
      }

      const message = buildBuyNowMessage({
        productName: data.productName,
        price: data.price,
        productPageUrl: window.location.href,
        orderRef: data.orderRef,
        customerName: trimmedName,
        customerPhone: trimmedPhone.replace(/\D/g, ""),
      });

      window.open(buildWhatsAppUrl(whatsappNumber, message), "_blank", "noopener,noreferrer");

      setOrderRef(data.orderRef);
      setStep("success");
    } catch {
      setSubmitError("Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button variant="whatsapp" disabled={disabled} onClick={openModal}>
        Buy now via WhatsApp
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-plum/40 p-4 sm:items-center">
          <div
            className="w-full max-w-md rounded-lg bg-brand-white p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="buy-now-title"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="buy-now-title"
                className="font-heading text-xl text-brand-plum"
              >
                {step === "form" ? "Complete your order" : "Order created"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="p-1 text-brand-plum"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {step === "form" ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="buy-now-name"
                    className="block text-sm text-brand-plum"
                  >
                    Name
                  </label>
                  <input
                    id="buy-now-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-brand-blushDark px-3 py-2 text-sm text-brand-plum"
                    autoComplete="name"
                  />
                  {nameError && (
                    <p className="mt-1 text-xs text-brand-rose">{nameError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="buy-now-phone"
                    className="block text-sm text-brand-plum"
                  >
                    Phone
                  </label>
                  <input
                    id="buy-now-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-brand-blushDark px-3 py-2 text-sm text-brand-plum"
                    autoComplete="tel"
                  />
                  {phoneError && (
                    <p className="mt-1 text-xs text-brand-rose">{phoneError}</p>
                  )}
                </div>

                {submitError && (
                  <p className="text-sm text-brand-rose">{submitError}</p>
                )}

                <Button
                  type="submit"
                  variant="whatsapp"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Placing order..." : "Continue to WhatsApp"}
                </Button>
              </form>
            ) : (
              <div className="mt-6">
                <p className="text-sm text-brand-rose">
                  Order {orderRef} created — complete it on WhatsApp.
                </p>
                <Button
                  variant="primary"
                  className="mt-6 w-full"
                  onClick={closeModal}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
