import { BlogCatalog } from "@/components/admin/BlogCatalog";

export default function BlogAdminPage() {
  return <main id="contenido-admin" className="admin-dashboard">
    <h1>Blog editorial</h1>
    <BlogCatalog />
  </main>;
}
