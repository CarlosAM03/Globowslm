# Operación FREE-01

La instalación académica usa Vercel Hobby para validación no comercial, Render Free sin método de pago y la instancia dedicada Supabase Free. Su origen estable es `https://globowslm.vercel.app`. Mantener noindex y revisar los límites de transferencia antes de pruebas de video. [Render Free](https://render.com/docs/free) · [Cuota Supabase](https://supabase.com/pricing) · [Condiciones Hobby](https://vercel.com/docs/plans/hobby)

## Configuración por servicio

| Ámbito | Ajustes |
|---|---|
| Backend Render | `APP_ORIGIN=https://globowslm.vercel.app`. `DATABASE_URL` del rol de runtime de PostgreSQL con `sslmode=verify-full` y CA oficial mediante `sslrootcert`. `CMS_BFF_SECRET` y `SUPABASE_STORAGE_KEY` en el gestor de secretos. `SUPABASE_PROJECT_URL`, `SUPABASE_MEDIA_BUCKET=globows-media`, `MEDIA_ROOT=/var/lib/globows/media` y `MEDIA_VIDEO_LIMIT_MIB=45`. Render proporciona `PORT`. |
| Frontend Vercel | Mismo `APP_ORIGIN`, `CMS_API_INTERNAL_URL` y `CMS_MEDIA_ORIGIN` con la URL HTTPS de Render, `CMS_BFF_SECRET` igual al del backend y disponible solo en servidor. La compilación aplica CSP. |
| Operación local controlada | Credencial separada para migraciones. Inyección efímera a la etapa `migration` para `npm run db:deploy`. Inyectar las credenciales de OWNER/ADMIN solo para la CLI correspondiente. [Cuentas](cuentas.md) |

El puerto directo de Supabase y el pooler de sesión de Ohio usan 5432. Para el pooler, usar el login de PostgreSQL con sufijo del proyecto. Descargar la CA del proyecto y exigir SSL en ambos tramos. Comprobar `pg_stat_ssl` antes de migrar y conectar el rol de runtime. [Supabase SSL](https://supabase.com/docs/guides/platform/ssl-enforcement)

## Recuperar desde un clon de GitHub

1. Seleccionar el SHA aprobado y comprobar los planes gratuitos. `vercel.json` limita los despliegues Git a `main`. Render despliega `main` tras aprobar los checks. Para un ensayo usar un entorno aislado.
2. En el proyecto Supabase `ajguiknpwgkpoelwhsnv`, mantener Enforce SSL y descargar la CA pública. Comprobar la DB y las seis migraciones con los comandos de abajo. A fecha de P21 las seis están aplicadas. Antes de volver a migrar, comprobar el historial y respaldar.
3. En Render, recuperar el web service existente `globowslm-api` según `render.yaml`. Su root es `backend`, con Dockerfile `./Dockerfile` y contexto `.` relativos al root. Conservar la CA pública como Secret File `prod-ca-2021.crt` y las variables en el panel nativo. Usar la credencial del rol `globows_runtime`. [Ejemplo backend](../../../deploy/backend.env.example)
4. En Vercel, usar el proyecto `globowslm` y la configuración del origen exacto para el entorno que se pruebe. Mantener la misma clave aleatoria `CMS_BFF_SECRET` en los dos servicios y conservar la protección de previews. [Ejemplo frontend](../../../deploy/frontend.env.example)
5. Comprobar `/api/v1/health/ready` y `/api/v1/openapi.json`. Registrar el mismo SHA y el ID de cada despliegue. Verificar permisos, contenido y hashes de [P25](evidencias/P25.md). Reservar el aprovisionamiento y la importación de abajo para instalaciones vacías aprobadas. Para la instalación actual, recuperar la cuenta afectada mediante la CLI.

La credencial de migración es `postgres.<project_ref>`. El runtime conecta como `globows_runtime.<project_ref>`. Para rotarlo desde otro equipo, conectar con psql como migrador por el pooler en `verify-full` y usar `\password globows_runtime`. Psql solicita el nuevo valor sin eco. Guardarlo en un gestor privado y actualizar únicamente `DATABASE_URL` en Render. Si el rol no existe en un entorno nuevo, crear `globows_runtime` con LOGIN, NOINHERIT, NOBYPASSRLS y sin roles elevados y aplicar `backend/ops/supabase-acl.sql` después de las migraciones. En el proyecto actual se verificaron RLS y la retirada de permisos de la Data API.

Los comandos siguientes esperan Docker, un archivo de entorno **fuera del clon** con ACL restringida para el operador y el certificado descargado. El archivo de bootstrap parte del ejemplo backend e incorpora `GLOBOWS_OWNER_EMAIL`, `GLOBOWS_OWNER_PASSWORD`, `GLOBOWS_ADMIN_EMAIL` y `GLOBOWS_ADMIN_PASSWORD` con valores de las personas autorizadas. No usar ejemplos ni fixtures. Codificar la contraseña como componente URI, por ejemplo con `[Uri]::EscapeDataString(...)` en PowerShell.

```powershell
$ca = 'C:\ruta-privada\prod-ca-2021.crt'
$migrationEnv = 'C:\ruta-privada\migration.env'
$runtimeEnv = 'C:\ruta-privada\bootstrap.env'
$caMount = "${ca}:/etc/secrets/prod-ca-2021.crt:ro"
$mediaSeed = "$((Resolve-Path public).Path):/seed/public:ro"

docker build --target migration -t globows-release-migration backend
docker build --target runtime -t globows-release-api backend
docker run --rm --env-file $migrationEnv -v $caMount globows-release-migration npm run db:deploy
docker run --rm --env-file $runtimeEnv -v $caMount globows-release-api node dist/src/auth/owner-cli.js provision OWNER
docker run --rm --env-file $runtimeEnv -v $caMount globows-release-api node dist/src/auth/owner-cli.js provision ADMIN
docker run --rm --env-file $runtimeEnv -v $caMount -v $mediaSeed globows-release-api node dist/src/editorial/import-v1-cli.js --dry-run
docker run --rm --env-file $runtimeEnv -v $caMount -v $mediaSeed globows-release-api node dist/src/editorial/import-v1-cli.js --apply
docker run --rm --env-file $runtimeEnv -v $caMount -v $mediaSeed globows-release-api node dist/src/editorial/import-v1-cli.js --dry-run
```

`migration.env` contiene únicamente `DATABASE_URL` del migrador. Usar las opciones comprobadas `sslmode=verify-full&sslrootcert=%2Fetc%2Fsecrets%2Fprod-ca-2021.crt&sslcert=%2Fetc%2Fsecrets%2Fprod-ca-2021.crt&connect_timeout=10`. En el último dry-run, comprobar que no quedan importaciones nuevas ni conflictos. Retirar las credenciales de bootstrap del operador cuando termine la sesión autorizada.

## Multimedia

Los buckets de validación y de la instalación se mantienen privados y separados. Cada uno tiene el tope de `47185920` bytes y admite solamente JPG, PNG, WebP, MP4 y WebM. La API de Globows aplica además el límite de 15 MiB a imágenes. Las rutas públicas verifican que el archivo pertenece a un snapshot publicado vigente. Las rutas de previsualización requieren ticket privado. La CLI de limpieza `node dist/src/media/cleanup-cli.js --dry-run` lista objetos elegibles por antigüedad y existencia de su metadata. El disco de Render se usa para el archivo temporal durante validación. [Buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals)

## Respaldo y recuperación

Durante una ventana sin escritores, generar `pg_dump` y un inventario de objetos del bucket de la instalación. Descargar por API autenticada los objetos, conservar las claves exactas y comparar tamaño y SHA-256 con metadata. Cifrar los dos respaldos en una ubicación local restringida fuera del repositorio. Conservar el manifiesto de hashes y el SHA de software con los archivos cifrados. Ensayar `pg_restore --exit-on-error --no-owner --no-privileges` en PostgreSQL aislado y restaurar los objetos en un bucket privado aislado. Verificar referencias y contenido publicado antes de autorizar cualquier recuperación. Cualquier rollback de código con dos cuentas debe usar una revisión compatible con RBAC y con el esquema existente.

El ensayo de P25 usa PostgreSQL 17.12 y un directorio privado en memoria dentro de Docker aislado. Desde el clon, con PowerShell 7.4+, cliente PostgreSQL, Docker, la CA oficial y los archivos DPAPI `DatabasePassword.dpapi` y `StorageKey.dpapi` del mismo usuario en `%LOCALAPPDATA%/GlobowsLM/FREE-01`:

```powershell
pwsh -NoProfile -File Docs/V2/Release/respaldo-p25.ps1 -Certificate 'C:\ruta-privada\prod-ca-2021.crt' -DeploymentSha (git rev-parse HEAD)
```

Guardar los respaldos bajo custodia del propietario. DPAPI CurrentUser vincula la recuperación a ese perfil de Windows. Para una copia de continuidad, exportar cifrada con una clave recuperable que custodie el operador y ensayar su descifrado por separado.

Para retroceder código, identificar en proveedores el par de deployments comprobado de [P25](evidencias/P25.md), confirmar compatibilidad de las seis migraciones y de ambos roles, y desplegar primero la API compatible. Tras pasar readiness, restaurar el alias Vercel hacia el build correspondiente. Verificar panel, rutas públicas y hashes después del cambio. Mantener PostgreSQL y Storage en su estado actual durante ese rollback.
