# Operación FREE-01

El despliegue de prueba usa Vercel Hobby para validación privada no comercial, Render Free sin método de pago y la instancia dedicada Supabase Free. El dominio comercial sigue sujeto a las condiciones de uso. Mantener noindex y revisar los límites de transferencia antes de pruebas de video. [Render Free](https://render.com/docs/free) · [Cuota Supabase](https://supabase.com/pricing) · [Condiciones Hobby](https://vercel.com/docs/plans/hobby)

## Configuración por servicio

| Ámbito | Ajustes |
|---|---|
| Backend Render | `APP_ORIGIN` HTTPS exacto del preview autorizado. `DATABASE_URL` del rol de runtime de PostgreSQL con `sslmode=verify-full` y CA oficial mediante `sslrootcert`. `CMS_BFF_SECRET` y `SUPABASE_STORAGE_KEY` en el gestor de secretos. `SUPABASE_PROJECT_URL`, `SUPABASE_MEDIA_BUCKET`, `MEDIA_ROOT=/var/lib/globows/media` y `MEDIA_VIDEO_LIMIT_MIB=45`. Render proporciona `PORT`. |
| Frontend Vercel Preview | `APP_ORIGIN` del preview, `CMS_API_INTERNAL_URL` y `CMS_MEDIA_ORIGIN` con la URL HTTPS de Render, `CMS_BFF_SECRET` igual al del backend y disponible solo en servidor. Aplicar CSP durante el build. |
| Operación local controlada | Credencial separada para migraciones. Inyección efímera a la etapa `migration` para `npm run db:deploy`. Inyectar las credenciales de OWNER/ADMIN solo para la CLI correspondiente. [Cuentas](cuentas.md) |

El puerto directo de Supabase y el pooler de sesión de Ohio usan 5432. Para el pooler, usar el login de PostgreSQL con sufijo del proyecto. Descargar la CA del proyecto y exigir SSL en ambos tramos. Comprobar `pg_stat_ssl` antes de migrar y conectar el rol de runtime. [Supabase SSL](https://supabase.com/docs/guides/platform/ssl-enforcement)

## Completar desde un clon de GitHub

1. Seleccionar el SHA de integración aprobado. Verificar que `vercel.json` tiene `git.deploymentEnabled=false` y que los proveedores conservan sus planes gratuitos. El preview de Vercel es privado y de uso no comercial.
2. En el proyecto Supabase `ajguiknpwgkpoelwhsnv`, mantener Enforce SSL y descargar la CA pública. Comprobar la DB y las seis migraciones con los comandos de abajo. A fecha de P21 las seis están aplicadas. Antes de volver a migrar, comprobar el historial y respaldar.
3. En Render, crear un web service Docker Free en Ohio según `render.yaml`. Confirmar el plan, el workspace GlobowsLM, el SHA de V2, el estado de auto-deploy y el health path antes de crear. Si se usa el formulario directo, configurar el root `backend`, Dockerfile `./Dockerfile` y contexto `.` relativos a ese root. Añadir la CA pública como Secret File `prod-ca-2021.crt` y las variables en el panel nativo. Usar [ejemplo backend](../../../deploy/backend.env.example) y la credencial del rol `globows_runtime`. El proceso en Render solo usa las variables y el certificado.
4. En el proyecto Vercel `globowslm`, conservar Deployment Protection y preparar Preview con [ejemplo frontend](../../../deploy/frontend.env.example). Usar la misma clave aleatoria `CMS_BFF_SECRET` en Render y Next. Ajustar `APP_ORIGIN` en ambos a la URL HTTPS exacta del preview que se vaya a probar. En caso de nueva URL, usar un alias de preview estable autorizado y verificar que conserve protección. Crear únicamente un preview manual sin `--prod`, desde el SHA verificado.
5. Comprobar que Render responde `/api/v1/health/ready` y `/api/v1/openapi.json`. Registrar SHA, ID y URL de ambos despliegues. Solo después aprovisionar OWNER y ADMIN e importar V1. Ejecutar la matriz remota P25 antes de cualquier publicación elegible.

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
