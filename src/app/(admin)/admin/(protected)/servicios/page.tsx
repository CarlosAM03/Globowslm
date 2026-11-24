import { ServiceCatalog } from "@/components/admin/ServiceCatalog";

export default function ServicesPage() {
  return (
    <main id="contenido-admin" className="admin-dashboard">
      <h1>Servicios y tipos de evento</h1>
      <ServiceCatalog />
    </main>
  );
}
