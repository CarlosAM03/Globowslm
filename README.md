# Globows LM V1.0.0

Aplicación institucional de **Globows LM by Licey Márquez**. La V1 será una Landing Page productiva para presentar la marca, la trayectoria de su fundadora, cinco servicios, trabajos decorativos por categorías, formación, certificaciones verificadas y canales oficiales de contacto. Se implementará por los sprints del [plan maestro](Docs/Planeacion/PlanDeImplementacion.md); **la V1 aún no está publicada**.

Repositorio oficial: [CarlosAM03/Globowslm](https://github.com/CarlosAM03/Globowslm). La rama `feature/sprints-1-2-landing-core` contiene la implementación técnica inicial para revisión; `main` no se modifica durante esta ejecución.

## Alcance

La V1 incluye una sola página con ocho posiciones conceptuales (la de confianza/orientación es condicional), Navbar, Footer y menú flotante global de cinco canales. Hero usa una fotografía; servicios y eventos están integrados. Contenido, imágenes, enlaces y acreditaciones comerciales requieren validación antes de publicarse. Se excluyen backend de negocio, base de datos, autenticación, panel, CMS, pagos y módulos V2.

Las fuentes de autoridad son [ERP](Docs/00-ERP.md) para visión/roadmap, [ERV1](Docs/01-ERV1.md) para alcance y aceptación, [MID](Docs/05-DiseñoUI_UX/03-MID.md) para identidad visual, [UIA](Docs/05-DiseñoUI_UX/04-UIArquitecture.md) junto al [ADR D01–D09](Docs/05-DiseñoUI_UX/05-ADR-Arquitectura-UI-Consolidada.md) para estructura. [Docs/Index.md](Docs/Index.md) explica la jerarquía completa; la [matriz V1](Docs/Planeacion/MatrizTrazabilidadV1.md) sigue cada requisito.

## Stack y requisitos

Next.js 16.4.0 con App Router/Turbopack, React 19, TypeScript 5 y Tailwind CSS 4. shadcn/ui y Motion se adoptarán únicamente para necesidades concretas en los sprints. El despliegue previsto es Vercel por integración Git; Preview Deployment y producción tienen aprobaciones distintas.

Usa **Node.js >=22.16.0 <23** y **npm >=10.9.0 <12**; la Foundation se validó localmente con Node 22.16.0 y npm 11.7.0. Mantén `package-lock.json` sincronizado y utiliza `npm ci` para instalaciones reproducibles.

```powershell
npm ci
npm run dev
```

## Comandos

| Comando | Función |
|---|---|
| `npm run dev` | Servidor de desarrollo Next.js. |
| `npm run typegen` | Genera los tipos de rutas y `next-env.d.ts` con Next.js 16. |
| `npm run typecheck` | Ejecuta `next typegen` y después `tsc --noEmit`, también desde un checkout limpio. |
| `npm run lint` | ESLint. |
| `npm run build` | Build de producción. |
| `npm run start` | Ejecuta un build ya generado. |
| `npm test` | Nueve pruebas del helper WhatsApp con el runner de Node. |
| `npm run test:e2e` | Chromium/Playwright: navegación, menú, catálogo, filtros y siete anchos responsive sobre un build existente. |
| `npm run assets:prepare` | Regenera cinco derivados WebP sin modificar originales. |
| `./scripts/Initialize-ProjectStructure.ps1` | Crea solo los directorios V1 faltantes y `.gitkeep`; se puede repetir sin sobrescribir archivos. |

Para pruebas de navegador, ejecuta `npx playwright install chromium`, `npm run build` y `npm run test:e2e`. CI instala Chromium con sus dependencias del sistema y ejecuta types, lint, unitarias, build y E2E; conserva reportes/capturas como artifacts durante siete días. Los reportes locales quedan ignorados por Git. El runner Node 22.16 advierte que la eliminación de tipos es experimental; esas advertencias no se suprimen.

## Organización

- `src/app/`: App Router, layout, página y estilos; `robots.ts` y `sitemap.ts` esperan un dominio confirmado.
- `src/components/`, `src/content/`, `src/config/`, `src/lib/`: componentes, contenido validado, configuración pública y utilidades según se implementen.
- `public/images/`: cinco derivados WebP para revisión editorial; autorización comercial pendiente. `assets/` conserva fotografías originales.
- `src/styles/fonts/`: fuentes oficiales locales Manrope/Cormorant Garamond, licencias OFL y procedencia; el build no descarga Google Fonts.
- `legacy/index.html`: preview HTML histórico, **referencia visual**, no código de producción. El [preview anterior](https://github.com/CarlosAM03/globows-preview) pertenece a otro repositorio.
- `Docs/`: fuentes oficiales, decisiones y planeación; `tests/`: pruebas reales unitarias/E2E; `.github/workflows/`: validación CI.

## Estado y publicación

La aplicación implementa Design System, Navbar/MobileMenu, Hero, About, cinco servicios, ocasiones y galería categorizada. Solo menú móvil y filtros requieren estado cliente. No se implementó Sprint 3 ni se realizó despliegue productivo. Las consultas WhatsApp están deshabilitadas porque falta el número oficial validado; cuatro fotografías de servicios y la aceptación comercial de textos/imagenes siguen pendientes. Un banner editorial y `noindex` identifican esta versión de desarrollo. Antes de producción deben cerrarse la matriz ERV1, aceptación comercial, QA, seguridad, dominio y HTTPS; `noindex` se revisará al preparar el release.

El reporte `audit-report.json` es un artefacto local excluido de Git. La cadena de vulnerabilidad alta en herramientas de desarrollo se sigue en [el registro de riesgo](Docs/Planeacion/RegistroRiesgoDependencias.md); no está aceptada por el arquitecto responsable.
