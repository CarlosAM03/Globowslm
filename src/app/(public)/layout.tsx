import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingContactMenu } from "@/components/layout/FloatingContactMenu";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <Navbar />
      {children}
      <Footer />
      <FloatingContactMenu />
    </>
  );
}
