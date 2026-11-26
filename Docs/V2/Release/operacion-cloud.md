# Operación FREE-01

El despliegue de prueba usa Vercel Hobby para validación privada no comercial, Render Free sin método de pago y la instancia dedicada Supabase Free. El dominio comercial sigue sujeto a las condiciones de uso. Mantener noindex y revisar los límites de transferencia antes de pruebas de video. [Render Free](https://render.com/docs/free) · [Cuota Supabase](https://supabase.com/pricing) · [Condiciones Hobby](https://vercel.com/docs/plans/hobby)

## Configuración por servicio

| Ámbito | Ajustes |
|---|---|
| Backend Render | `APP_ORIGIN` HTTPS exacto del preview autorizado. `DATABASE_URL` del rol de runtime de PostgreSQL con `sslmode=verify-full` y CA oficial mediante `sslrootcert`. `CMS_BFF_SECRET` y `SUPABASE_STORAGE_KEY` en el gestor de secretos. `SUPABASE_PROJECT_URL`, `SUPABASE_MEDIA_BUCKET`, `MEDIA_ROOT=/var/lib/globows/media` y `MEDIA_VIDEO_LIMIT_MIB=45`. Render proporciona `PORT`. |
| Frontend Vercel Preview | `APP_ORIGIN` del preview, `CMS_API_INTERNAL_URL` y `CMS_MEDIA_ORIGIN` con la URL HTTPS de Render, `CMS_BFF_SECRET` igual al del backend y disponible solo en servidor. Aplicar CSP durante el build. |
| Operación local controlada | Credencial separada para migraciones. Inyección efímera a la etapa `migration` para `npm run db:deploy`. Inyectar las credenciales de OWNER/ADMIN solo para la CLI correspondiente. [Cuentas](cuentas.md) |

El puerto directo de Supabase y el pooler de sesión de Ohio usan 5432. Para el pooler, usar el login de PostgreSQL con sufijo del proyecto. Descargar la CA del proyecto y exigir SSL en ambos tramos. Comprobar `pg_stat_ssl` antes de migrar y conectar el rol de runtime. [Supabase SSL](https://supabase.com/docs/guides/platform/ssl-enforcement)

## Multimedia

Los buckets de validación y de la instalación se mantienen privados y separados. Cada uno tiene el tope de `47185920` bytes y admite solamente JPG, PNG, WebP, MP4 y WebM. La API de Globows aplica además el límite de 15 MiB a imágenes. Las rutas públicas verifican que el archivo pertenece a un snapshot publicado vigente. Las rutas de previsualización requieren ticket privado. La CLI de limpieza `node dist/src/media/cleanup-cli.js --dry-run` lista objetos elegibles por antigüedad y existencia de su metadata. El disco de Render se usa para el archivo temporal durante validación. [Buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals)

## Respaldo y recuperación

Durante una ventana sin escritores, generar `pg_dump` y un inventario de objetos del bucket de la instalación. Descargar por API autenticada los objetos, conservar las claves exactas y comparar tamaño y SHA-256 con metadata. Cifrar los dos respaldos en una ubicación local restringida fuera del repositorio. Conservar el manifiesto de hashes y el SHA de software con los archivos cifrados. Ensayar `pg_restore --exit-on-error --no-owner --no-privileges` en PostgreSQL aislado y restaurar los objetos en un bucket privado aislado. Verificar referencias y contenido publicado antes de autorizar cualquier recuperación. Cualquier rollback de código con dos cuentas debe usar una revisión compatible con RBAC y con el esquema existente.
