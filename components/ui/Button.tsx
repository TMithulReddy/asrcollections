import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "whatsapp";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand-mauve text-brand-white hover:opacity-90",
  whatsapp: "bg-[#25D366] text-white hover:opacity-90",
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
