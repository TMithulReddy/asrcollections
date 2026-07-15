import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "whatsapp";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand-mauve text-brand-white hover:brightness-110 active:scale-[0.98]",
  whatsapp: "bg-[#25D366] text-white hover:brightness-110 active:scale-[0.98]",
};

const baseStyles =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50";

export default function Button({
  variant = "primary",
  children,
  className = "",
  href,
  ...props
}: ButtonProps) {
  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
