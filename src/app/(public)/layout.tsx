import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingContactMenu } from "@/components/layout/FloatingContactMenu";
import { navigation } from "@/config/site";
import { publicContact } from "@/lib/cms/public-contact";
import { loadPublicSite } from "@/lib/cms/public-site";

async function CmsChrome({ part }: { part: "header" | "footer" }) {
  const site = (await loadPublicSite())?.site;
  const items = [
    ...navigation.filter(({ href }) => href !== "#confianza" || !!site?.faq.length)
      .map(({ href, label }) => ({ href: `/${href}`, label })),
    { href: "/blog", label: "Blog" },
  ];
  if (part === "header") return <Navbar items={items} home="/#inicio" contact="/#contacto" />;
  const links = publicContact(site?.contact);
  return <><Footer items={items} links={links} /><FloatingContactMenu links={links} /></>;
}

export default function PublicLayout({ children }: LayoutProps<"/">) {
  const baseline = process.env.CMS_BASELINE_FIXTURE === "1";
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    {baseline ? <Navbar /> : <Suspense fallback={<div className="site-header-placeholder" aria-hidden="true" />}><CmsChrome part="header" /></Suspense>}
    {children}
    {baseline ? <><Footer /><FloatingContactMenu /></> : <Suspense><CmsChrome part="footer" /></Suspense>}
  </>;
}
