# Operación, respaldo y recuperación

## Proyecto local

Usa `globows-v2-review` para la revisión humana y el proyecto propio del runner para QA. Ambos usan PostgreSQL 16 y volúmenes separados para datos y multimedia. La API expone `/api/v1/health/live` y `/api/v1/health/ready`. Un `503` de readiness indica que PostgreSQL o el almacenamiento requieren atención. El frontend distingue una API indisponible de un catálogo vacío.

```powershell
docker @localReview ps
docker @localReview logs --tail 80 web api migrate db
docker @localReview exec -T api node dist/src/media/cleanup-cli.js --dry-run
python scripts/v2-resilience.py --image-project globows-v2-review
```

El ensayo de resiliencia genera dos proyectos desechables, usa imágenes locales ya construidas y compara los archivos y la base de datos que restaura. Puede ejecutarse mientras el proyecto de revisión está arriba porque los proyectos del ensayo usan su red privada y no publican puertos.

## Recuperar la cuenta local

En una sesión PowerShell asigna a `HARNESS_OWNER_EMAIL` el correo local autorizado y a `HARNESS_OWNER_PASSWORD` una contraseña aleatoria nueva. Ejecuta la recuperación y limpia las variables de sesión.

```powershell
try {
    docker @localReview exec -T -e HARNESS_OWNER_EMAIL -e HARNESS_OWNER_PASSWORD api node dist/src/auth/owner-cli.js recover
} finally {
    Remove-Item Env:HARNESS_OWNER_EMAIL, Env:HARNESS_OWNER_PASSWORD
}
```

La recuperación exige acceso al entorno local y revoca todas las sesiones anteriores. Conserva el historial editorial. Entrega el nuevo secreto únicamente por el canal privado autorizado.

## Respaldos y rollback

1. Programa una ventana de mantenimiento. Detén los escritores y confirma que las cargas de multimedia hayan terminado.
2. Genera un `pg_dump -Fc` de PostgreSQL y un archivo `tar` del volumen de multimedia de la misma ventana. Conserva un manifiesto con SHA-256 de ambos archivos, fecha e identificador del build.
3. Guarda ambos archivos fuera del repositorio, en almacenamiento cifrado con acceso restringido. Valida los hashes antes de copiar el respaldo al entorno aislado.
4. Restaura PostgreSQL con `pg_restore --exit-on-error --no-owner --single-transaction` en una base aislada. Extrae multimedia al directorio dedicado. Comprueba propietario, permisos, readiness, consultas públicas y el hash de una imagen conocida. El ensayo automatizado aplica esos pasos sobre PostgreSQL real.
5. Para rollback, confirma la compatibilidad del código anterior con el esquema actual. Si necesitas revertir datos, usa una base y un volumen recién restaurados desde el par de respaldos previo. Verifica antes de cambiar el destino en el proxy. Conserva el entorno posterior a la incidencia para diagnóstico.

## Conexión productiva posterior

| Ajuste privado | Uso |
|---|---|
| `APP_ORIGIN` | Origen HTTPS exacto del sitio. Usa el mismo para Next y Nest. |
| `CMS_API_INTERNAL_URL` | Origen HTTPS privado que Next usa para el BFF y la lectura pública. |
| `CMS_MEDIA_ORIGIN` | Origen HTTPS alcanzable por el navegador para uploads y preview. Configúralo con `APP_ORIGIN` al compilar el frontend y al arrancarlo. |
| `DATABASE_URL` | PostgreSQL 16 privado. Inyecta la URL desde el gestor de secretos y valida TLS, CA y reglas de red con el proveedor. |
| `MEDIA_ROOT` | Directorio persistente dedicado y escribible por el UID del runtime. Inclúyelo en el respaldo. |
| `GLOBOWS_OWNER_EMAIL`, `GLOBOWS_OWNER_PASSWORD` | Variables efímeras para CLI manual de provisión o recuperación. |

El `Dockerfile` web admite los argumentos públicos `APP_ORIGIN` y `CMS_MEDIA_ORIGIN`. El destino de backend y los secretos se configuran en runtime. Nest usa modo de producción por defecto y exige HTTPS para `APP_ORIGIN`. La cookie del BFF en HTTPS aplica `Secure`, `HttpOnly` y `SameSite=Lax`. CORS de media admite el origen exacto. Configura el proxy TLS para permitir el tamaño aprobado y revisa rate limits, tiempos y cabeceras antes de exponerlo.

Ejecuta migraciones como paso explícito con acceso privado a PostgreSQL. Antes de cada cambio conserva un respaldo de base y multimedia y ensaya la restauración. El API runtime arranca con `node dist/src/main.js` y la migración se ejecuta mediante `npm run db:deploy` en la imagen de migración. Mantén la base de datos en la red privada. El titular de la instalación controla indexación y canonical después de la validación comercial.
