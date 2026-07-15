"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import CustomerCheckoutModal from "@/components/ui/CustomerCheckoutModal";
import { useCart } from "@/lib/cart-context";
import { validateCustomerDetails } from "@/lib/checkout-validation";
import { buildCartCheckoutMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

type ModalStep = "form" | "success";

export default function CartCheckoutButton() {
  const { items, clearCart } = useCart();
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
      const response = await fetch("/api/cart-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as {
        orderRef?: string;
        totalAmount?: number;
        lineItems?: { name: string; quantity: number; unitPrice: number }[];
        error?: string;
      };

      if (
        !response.ok ||
        !data.orderRef ||
        !data.totalAmount ||
        !data.lineItems?.length
      ) {
        setSubmitError(
          data.error ?? "Something went wrong, please try again."
        );
        return;
      }

      const message = buildCartCheckoutMessage({
        lineItems: data.lineItems,
        totalAmount: data.totalAmount,
        orderRef: data.orderRef,
        customerName: name.trim(),
        customerPhone: validation.normalizedPhone,
      });

      const whatsappUrl = buildWhatsAppUrl(whatsappNumber, message);
      const newWindow = window.open(whatsappUrl, "_blank");
      if (!newWindow) {
        window.location.href = whatsappUrl;
      }

      clearCart();
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
      formId="cart-checkout"
      trigger={
        <Button variant="whatsapp" onClick={openModal}>
          Buy now via WhatsApp
        </Button>
      }
    />
  );
}
