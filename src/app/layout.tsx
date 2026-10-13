import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingContactMenu } from "@/components/layout/FloatingContactMenu";
import "./globals.css";
import { canonicalOrigin, seo } from "@/config/seo";

const manrope = localFont({
  src: "../styles/fonts/manrope-latin-variable.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
  adjustFontFallback: "Arial",
});

const cormorant = localFont({
  src: "../styles/fonts/cormorant-garamond-latin-variable.woff2",
  variable: "--font-cormorant",
  weight: "300 700",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  metadataBase: new URL(canonicalOrigin ?? seo.currentDeployment),
  ...(canonicalOrigin && { alternates: { canonical: canonicalOrigin } }),
  openGraph: { type: "website", locale: "es_MX", siteName: "Globows LM", title: seo.title, description: seo.description, images: [{ url: seo.image, width: 852, height: 856, alt: "Decoración profesional de Globows LM" }] },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: [seo.image] },
  robots: { index: false, follow: false }, // Opening indexing requires explicit release authorization.
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body>
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <Navbar />
        {children}
        <Footer />
        <FloatingContactMenu />
      </body>
    </html>
  );
}
