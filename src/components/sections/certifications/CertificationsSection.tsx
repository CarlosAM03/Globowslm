import Image from "next/image";
import { BadgeCheck, FileCheck } from "lucide-react";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { certifications as verifiedContent } from "@/content/certifications";
import { getVerifiedCertifications } from "@/lib/certifications";
import type { Certification } from "@/types/content";
import { HorizontalTimeline } from "./HorizontalTimeline";
import "./certifications.css";

export function CertificationsSection({ entries = verifiedContent }: { entries?: readonly Certification[] }) {
  const verified = getVerifiedCertifications(entries);
  return (
    <section id="certificaciones" className="section certifications-section" aria-labelledby="certifications-title">
      <SectionContainer>
        <SectionTitle id="certifications-title" eyebrow="Certificaciones y trayectoria" description="La formación continua es un pilar de Globows LM. Cada credencial se incorporará después de cotejar su información y sus evidencias.">Preparación que acompaña cada creación.</SectionTitle>
        {verified.length > 0 ? <HorizontalTimeline>{verified.map((entry) => <li key={entry.id} className="certification-card">
          <BadgeCheck size={32} strokeWidth={1.75} aria-hidden="true" />
          <h3>{entry.name}</h3>
          {entry.organization && <p className="certification-organization">{entry.organization}</p>}
          {entry.date && <p>{entry.date}</p>}
          {entry.description && <p>{entry.description}</p>}
          {entry.image?.approval === "approved" && <Image src={entry.image.src} width={entry.image.width} height={entry.image.height} alt={entry.image.alt} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />}
        </li>)}</HorizontalTimeline> : <div className="certification-empty" role="note">
          <FileCheck size={32} strokeWidth={1.75} aria-hidden="true" />
          <div><h3>Credenciales en validación</h3><p>No hay certificaciones individuales verificadas disponibles para publicar. El timeline horizontal mostrará únicamente nombres, organismos y evidencias confirmados.</p></div>
        </div>}
      </SectionContainer>
    </section>
  );
}
