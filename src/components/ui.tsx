/**
 * Shared Button and Card. Use these for new and reworked screens so buttons
 * and panels look the same everywhere.
 */
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
const VARIANT: Record<Variant, string> = {
  primary: "bg-primary text-white hover:brightness-110 border border-primary",
  secondary: "bg-bg-card text-text-heading border border-border-main hover:border-text-heading",
  ghost: "bg-transparent text-text-body border border-transparent hover:text-text-heading hover:bg-bg-main",
  danger: "bg-rust text-white hover:brightness-110 border border-rust",
};

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md"; children?: ReactNode }) {
  const sz = size === "sm" ? "px-3 py-1.5 text-[13px]" : "px-4 py-2.5 text-[14px]";
  return (
    <button {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sz} ${VARIANT[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return <div {...rest} className={`bg-bg-card border border-border-main rounded-xl ${className}`}>{children}</div>;
}
