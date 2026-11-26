# Changelog

## 2.0.0 · 2026-11-26

Entrega académica y validación inicial no comercial de Globows LM.

- Sitio público y blog respaldados por el CMS, con revisiones publicadas y previsualización editorial.
- Panel editorial con una cuenta OWNER y una ADMIN. ADMIN incluye auditoría técnica y diagnóstico sanitizado.
- Importación idempotente de 15 entradas y siete originales WebP de V1. Se conservan los pendientes editoriales aprobados.
- Persistencia de PostgreSQL y de multimedia en Supabase privado. El límite en cloud es de 15 MiB para imágenes y 45 MiB para video.
- Frontend Next.js en Vercel Hobby, API NestJS en Render Free y seis migraciones Prisma. El cierre conserva las versiones de las dependencias de la candidata.

La restricción de Vercel Hobby mantiene la captación comercial fuera de esta entrega. La autonomía del frontend queda reservada para v2.0.1. [Informe, evidencias y operación](Docs/V2/Release/informe.md)
