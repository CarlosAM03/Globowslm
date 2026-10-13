import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Appearance = { variant?: Variant; className?: string };

function classes(variant: Variant, className?: string) {
  return ["button", `button--${variant}`, className].filter(Boolean).join(" ");
}

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & Appearance) {
  return <button type={type} className={classes(variant, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & Appearance) {
  return <a className={classes(variant, className)} {...props} />;
}
