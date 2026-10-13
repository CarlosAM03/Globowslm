import type { HTMLAttributes } from "react";

export function SectionContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["page-container", className].filter(Boolean).join(" ")} {...props} />;
}
