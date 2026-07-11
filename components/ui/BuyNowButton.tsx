"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import CustomerCheckoutModal from "@/components/ui/CustomerCheckoutModal";
import { validateCustomerDetails } from "@/lib/checkout-validation";
import { buildBuyNowMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

interface BuyNowButtonProps {
  productSlug: string;
  disabled?: boolean;
}

type ModalStep = "form" | "success";

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

    const validation = validateCustomerDetails(name, phone);
    setNameError(validation.nameError);
    setPhoneError(validation.phoneError);

    if (!validation.valid) {
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
          name: name.trim(),
          phone,
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
        customerName: name.trim(),
        customerPhone: validation.normalizedPhone,
      });

      window.location.assign(buildWhatsAppUrl(whatsappNumber, message));

      setOrderRef(data.orderRef);
      setStep("success");
    } catch {
      setSubmitError("Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CustomerCheckoutModal
      isOpen={isOpen}
      onClose={closeModal}
      step={step}
      orderRef={orderRef}
      name={name}
      phone={phone}
      nameError={nameError}
      phoneError={phoneError}
      submitError={submitError}
      isSubmitting={isSubmitting}
      onNameChange={setName}
      onPhoneChange={setPhone}
      onSubmit={handleSubmit}
      formId="buy-now"
      trigger={
        <Button variant="whatsapp" disabled={disabled} onClick={openModal}>
          Buy now via WhatsApp
        </Button>
      }
    />
  );
}
