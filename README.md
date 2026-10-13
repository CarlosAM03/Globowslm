# Globows LM V1.0.0

Aplicación institucional de **Globows LM by Licey Márquez**. La V1 será una Landing Page productiva para presentar la marca, la trayectoria de su fundadora, cinco servicios, trabajos decorativos por categorías, formación, certificaciones verificadas y canales oficiales de contacto. Se implementará por los sprints del [plan maestro](Docs/Planeacion/PlanDeImplementacion.md); **la V1 aún no está publicada**.

Repositorio oficial: [CarlosAM03/Globowslm](https://github.com/CarlosAM03/Globowslm). PR #1 y #2 integrados a main; la candidata 1.0.0-rc.1 se prepara en `feature/sprints-4-5-release-hardening`, sin merge ni release automático.

## Alcance

La V1 incluye una sola página con ocho posiciones conceptuales (la de confianza/orientación es condicional), Navbar, Footer y menú flotante global de cinco canales. Hero usa una fotografía; servicios y eventos están integrados. El preview tiene aprobación comercial expresa para copy, fotografías, teléfono, WhatsApp y tres redes. Solo correo y credenciales individuales/evidencias inexistentes permanecen pendientes. Se excluyen backend de negocio, base de datos, autenticación, panel, CMS, pagos y módulos V2.

Las fuentes de autoridad son [ERP](Docs/00-ERP.md) para visión/roadmap, [ERV1](Docs/01-ERV1.md) para alcance y aceptación, [MID](Docs/05-DiseñoUI_UX/03-MID.md) para identidad visual, [UIA](Docs/05-DiseñoUI_UX/04-UIArquitecture.md) junto al [ADR D01–D09](Docs/05-DiseñoUI_UX/05-ADR-Arquitectura-UI-Consolidada.md) para estructura. [Docs/Index.md](Docs/Index.md) explica la jerarquía completa; la [matriz V1](Docs/Planeacion/MatrizTrazabilidadV1.md) sigue cada requisito.

## Stack y requisitos

Next.js 16.4.0 con App Router/Turbopack, React 19, TypeScript 5 y Tailwind CSS 4. shadcn/ui y Motion se adoptarán únicamente para necesidades concretas en los sprints. El despliegue previsto es Vercel por integración Git; Preview Deployment y producción tienen aprobaciones distintas.

Usa **Node.js >=22.19.0 <23** y **npm >=10.9.0 <12**; la Foundation inicial usaba Node 22.16.0; la candidata usa Node 22.19.0 para compatibilidad con Lighthouse 13.5.0, dentro del mismo major. Mantén `package-lock.json` sincronizado y utiliza `npm ci` para instalaciones reproducibles.

```powershell
npm ci
npm run dev
```

## Comandos

| Comando | Función |
| --- | --- |
| `npm run dev` | Servidor de desarrollo Next.js. |
| `npm run typegen` | Genera los tipos de rutas y `next-env.d.ts` con Next.js 16. |
| `npm run typecheck` | Ejecuta `next typegen` y después `tsc --noEmit`, también desde un checkout limpio. |
| `npm run lint` | ESLint. |
| `npm run build` | Build de producción. |
| `npm run start` | Ejecuta un build ya generado. |
| `npm test` | 27 pruebas reales de WhatsApp, contactos, carrusel, certificaciones, FAQ y SEO. |
| `npm run test:e2e` | Chromium/Playwright: regresión, accesibilidad axe y nueve anchos responsive sobre un build existente. |
| `npm run audit:lighthouse -- final` | Mide móvil/escritorio contra un servidor productivo activo en puerto 3100; reportes locales ignorados. |
| `npm run assets:prepare` | Regenera siete derivados WebP sin modificar originales. |
| `./scripts/Initialize-ProjectStructure.ps1` | Crea solo los directorios V1 faltantes y `.gitkeep`; se puede repetir sin sobrescribir archivos. |

Para pruebas de navegador, ejecuta `npx playwright install chromium`, `npm run build` y `npm run test:e2e`. CI instala Chromium con sus dependencias del sistema y ejecuta types, lint, unitarias, build y E2E; conserva reportes/capturas como artifacts durante siete días. Los reportes locales quedan ignorados por Git. Las advertencias reales del runner se registran, sin suprimirlas.

## Organización

- `src/app/`: App Router, layout, página y estilos; robots mantiene el documento rastreable con noindex; sitemap no publica URLs hasta confirmar dominio.
- `src/components/`, `src/content/`, `src/config/`, `src/lib/`: componentes, contenido validado, configuración pública y utilidades según se implementen.
- `public/images/`: siete derivados WebP de fotografías aprobadas. `assets/` conserva fotografías originales.
- `src/styles/fonts/`: fuentes oficiales locales Manrope/Cormorant Garamond, licencias OFL y procedencia; el build no descarga Google Fonts.
- `legacy/index.html`: preview HTML histórico, **referencia visual**, no código de producción. El [preview anterior](https://github.com/CarlosAM03/globows-preview) pertenece a otro repositorio.
- `Docs/`: fuentes oficiales, decisiones y planeación; `tests/`: pruebas reales unitarias/E2E; `.github/workflows/`: validación CI.

## Estado y publicación

La candidata integra las ocho posiciones conceptuales: Hero, About, servicios/eventos, carrusel categorizado manual, formación, certificaciones, FAQ y Contacto; Navbar, Footer y menú flotante compacto. WhatsApp contextual y Facebook/Instagram/TikTok están activos desde configuración única. Correo oficial y catálogo individual de credenciales no se encuentran en las fuentes; certificaciones conserva estado explícito sin entradas inventadas. Falta imagen representativa de acreditación para el servicio de certificaciones. `noindex` no se abre sin autorización expresa. No se declara V1 liberada.

Para establecer el dominio permanente, el responsable deberá confirmar `GLOBOWS_CANONICAL_URL` (origen HTTPS, sin path/query). No configurarlo conserva canonical ausente y sitemap vacío; la URL Vercel actual solo sirve como base de imágenes compartidas. No hay analítica comercial activa. Operación, puerta de release y rollback: [Release Candidate](Docs/Planeacion/ReleaseCandidateV1.md).
