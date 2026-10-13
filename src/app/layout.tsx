import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingContactMenu } from "@/components/layout/FloatingContactMenu";
import "./globals.css";

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
  title: "Globows LM by Licey Márquez | Decoración profesional con globos",
  description: "Decoración profesional con globos y formación presencial. Conoce la historia de Licey Márquez, los servicios de Globows LM y sus decoraciones.",
  robots: { index: false, follow: false }, // Editorial review; enable indexing at release.
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body>
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <div className="editorial-banner">Versión de desarrollo · Contenido visual y canales comerciales en validación.</div>
        <Navbar />
        {children}
        <Footer />
        <FloatingContactMenu />
      </body>
    </html>
  );
}
