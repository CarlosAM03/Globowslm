# Globows LM V1.0.0

Aplicación institucional de **Globows LM by Licey Márquez**. La V1 será una Landing Page productiva para presentar la marca, la trayectoria de su fundadora, cinco servicios, trabajos decorativos por categorías, formación, certificaciones verificadas y canales oficiales de contacto. Se implementará por los sprints del [plan maestro](Docs/Planeacion/PlanDeImplementacion.md); **la V1 aún no está publicada**.

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
| `./scripts/Initialize-ProjectStructure.ps1` | Crea solo los directorios V1 faltantes y `.gitkeep`; se puede repetir sin sobrescribir archivos. |

No se anuncian comandos unitarios o E2E mientras sus pruebas no existan. Cada sprint deberá comprobar lint, tipos, build, enlaces, responsive y accesibilidad aplicables; las pruebas automatizadas se incorporarán cuando tengan casos reales. El workflow de GitHub Actions preparado para Sprint 0 requiere un repositorio para ejecutarse remotamente.

## Organización

- `src/app/`: App Router, layout, página y estilos; `robots.ts` y `sitemap.ts` esperan un dominio confirmado.
- `src/components/`, `src/content/`, `src/config/`, `src/lib/`: componentes, contenido validado, configuración pública y utilidades según se implementen.
- `public/images/`: copias web optimizadas y autorizadas cuando estén listas; `assets/` conserva fotografías originales.
- `legacy/index.html`: preview HTML histórico, **referencia visual**, no código de producción. El [preview anterior](https://github.com/CarlosAM03/globows-preview) pertenece a otro repositorio.
- `Docs/`: fuentes oficiales, decisiones y planeación; `tests/`: espacio para pruebas reales futuras; `.github/workflows/`: CI inicial.

## Estado y publicación

La Foundation ejecuta aún la pantalla inicial de Next.js. No se han implementado las secciones de negocio, iniciado Git, creado el repositorio definitivo ni conectado Vercel. Las fotografías originales y el preview se preservan. Antes del primer Preview Deployment se verificarán CI, assets, configuración y ausencia de secretos; antes de producción, la matriz ERV1, aceptación comercial, QA, seguridad, dominio y HTTPS.

El reporte `audit-report.json` es un artefacto local excluido de Git. La cadena de vulnerabilidad alta en herramientas de desarrollo se sigue en [el registro de riesgo](Docs/Planeacion/RegistroRiesgoDependencias.md); no está aceptada por el arquitecto responsable.
