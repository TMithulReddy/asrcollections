import { FormEvent, ReactNode } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import BorderMotif from "@/components/ui/BorderMotif";

interface CustomerCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: "form" | "success";
  orderRef: string;
  name: string;
  phone: string;
  nameError: string;
  phoneError: string;
  submitError: string;
  isSubmitting: boolean;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  formId: string;
  submitLabel?: string;
  submittingLabel?: string;
  trigger?: ReactNode;
}

export default function CustomerCheckoutModal({
  isOpen,
  onClose,
  step,
  orderRef,
  name,
  phone,
  nameError,
  phoneError,
  submitError,
  isSubmitting,
  onNameChange,
  onPhoneChange,
  onSubmit,
  formId,
  submitLabel = "Continue to WhatsApp",
  submittingLabel = "Placing order...",
  trigger,
}: CustomerCheckoutModalProps) {
  return (
    <>
      {trigger}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-plum/40 p-4 sm:items-center">
          <div
            className="w-full max-w-md rounded-lg bg-brand-white p-6 relative overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-title`}
          >
            <BorderMotif variant="corner" className="absolute top-0 right-0 pointer-events-none" />
            
            <div className="flex items-start justify-between gap-4 relative z-10">
              <h2
                id={`${formId}-title`}
                className="font-heading text-xl text-brand-plum"
              >
                {step === "form" ? "Complete your order" : "Order created"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1 text-brand-plum"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {step === "form" ? (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor={`${formId}-name`}
                    className="block text-sm text-brand-plum"
                  >
                    Name
                  </label>
                  <input
                    id={`${formId}-name`}
                    type="text"
                    value={name}
                    onChange={(event) => onNameChange(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-brand-blushDark px-3 py-2 text-sm text-brand-plum"
                    autoComplete="name"
                  />
                  {nameError && (
                    <p className="mt-1 text-xs text-brand-rose">{nameError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-phone`}
                    className="block text-sm text-brand-plum"
                  >
                    Phone
                  </label>
                  <input
                    id={`${formId}-phone`}
                    type="tel"
                    value={phone}
                    onChange={(event) => onPhoneChange(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-brand-blushDark px-3 py-2 text-sm text-brand-plum"
                    autoComplete="tel"
                  />
                  {phoneError ? (
                    <p className="mt-1 text-xs text-brand-rose">{phoneError}</p>
                  ) : (
                    <p className="mt-1 text-xs text-brand-plum/60">
                      We&apos;ll only use this to confirm your order over WhatsApp — nothing else.
                    </p>
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
                  {isSubmitting ? submittingLabel : submitLabel}
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
                  onClick={onClose}
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
