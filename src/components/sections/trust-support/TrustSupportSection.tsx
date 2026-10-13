import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { faq } from "@/content/faq";

export function TrustSupportSection() {
  if (faq.length === 0) return null;
  return <section id="confianza" className="section trust-section" aria-labelledby="trust-title"><SectionContainer>
    <SectionTitle id="trust-title" eyebrow="Consultas">Preguntas Comunes</SectionTitle>
    <div className="faq-list">{faq.map((item) => <details key={item.question} name="globows-faq"><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
  </SectionContainer></section>;
}
