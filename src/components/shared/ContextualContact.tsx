import { MessageCircle } from "lucide-react";
import { site } from "@/config/site";
import { createWhatsappUrl, type WhatsappInterest } from "@/lib/whatsapp";
import { Button, ButtonLink } from "@/components/ui/Button";

export function ContextualContact({ interest, label, describedBy }: { interest: WhatsappInterest; label: string; describedBy: string }) {
  const href = createWhatsappUrl(site.whatsappNumber, interest);
  const icon = <MessageCircle className="icon" strokeWidth={1.75} aria-hidden="true" />;
  return href ? (
    <ButtonLink href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} por WhatsApp (abre un servicio externo)`}>
      {icon}{label}
    </ButtonLink>
  ) : (
    <Button disabled aria-describedby={describedBy}>{icon}{label}</Button>
  );
}
