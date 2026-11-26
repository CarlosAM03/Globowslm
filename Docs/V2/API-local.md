# Foundation local de API

P02 habilita NestJS, Prisma y PostgreSQL para los módulos editoriales. La comprobación de vida responde cuando Nest está disponible. La comprobación de disponibilidad exige la fila de inicialización creada por la migración y un directorio de media legible y escribible. Los errores públicos incluyen un ID de solicitud y un mensaje fijo. Los logs omiten rutas, cabeceras, cuerpos y cadenas de conexión.

| Consulta local | Resultado |
|---|---|
| `GET /api/v1/health/live` | 200 cuando la API escucha |
| `GET /api/v1/health/ready` | 200 con PostgreSQL migrado y media disponible, 503 si un recurso falla |
| `GET /api/v1/openapi.json` | Especificación OpenAPI de las rutas implementadas |

El backend valida `APP_ORIGIN`, `DATABASE_URL`, `MEDIA_ROOT` y `PORT` al arrancar. Compose local configura los valores de revisión. El modo por defecto para ejecutar el backend fuera de Compose exige HTTPS en `APP_ORIGIN`. El aprovisionamiento de datos y la conexión de servicios reales se realizan después de la validación.

Desde el worktree V2 y con el entorno que genera el runner:

```powershell
docker compose -p globows-v2-review -f compose.local.yml --env-file .env.harness.local up --build -d --wait api
Invoke-RestMethod http://127.0.0.1:3101/api/v1/health/ready
Invoke-RestMethod http://127.0.0.1:3101/api/v1/openapi.json
docker compose -p globows-v2-review -f compose.local.yml --env-file .env.harness.local down
```

El servicio `migrate` aplica migraciones versionadas una vez antes de arrancar la API local. La aplicación arranca con usuario sin privilegios. Compose preserva los volúmenes de PostgreSQL y media al bajar el entorno. Arranca un solo proyecto de revisión a la vez para que pueda ocupar el puerto 3101. La base de QA corre en otra red con almacenamiento temporal y una credencial de fixture.
