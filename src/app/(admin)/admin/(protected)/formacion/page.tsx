import { TrainingCatalog } from "@/components/admin/TrainingCatalog";

export default function TrainingPage() {
  return <main id="contenido-admin" className="admin-dashboard">
    <h1>Formación presencial</h1>
    <TrainingCatalog />
  </main>;
}
