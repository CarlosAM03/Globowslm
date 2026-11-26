import { CertificationCatalog } from "@/components/admin/CertificationCatalog";

export default function CertificationsPage() {
  return <main id="contenido-admin" className="admin-dashboard">
    <h1>Certificaciones verificadas</h1>
    <CertificationCatalog />
  </main>;
}
