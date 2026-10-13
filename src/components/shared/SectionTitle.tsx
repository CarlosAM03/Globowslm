import type { ReactNode } from "react";

type Props = { id: string; eyebrow: string; children: ReactNode; description?: string };

export function SectionTitle({ id, eyebrow, children, description }: Props) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{children}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}
