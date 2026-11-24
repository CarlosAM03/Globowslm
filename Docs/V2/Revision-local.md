# Revisión local de Globows LM V2

El runner genera `.env.harness.local` con valores aleatorios de uso local. Ejecuta estos comandos desde el worktree V2. El proyecto de revisión tiene volúmenes propios.

```powershell
docker compose -p globows-v2-review -f compose.local.yml --env-file .env.harness.local up -d --build --wait db api web
docker compose -p globows-v2-review -f compose.local.yml --env-file .env.harness.local run --rm --entrypoint node -e HARNESS_OWNER_EMAIL -e HARNESS_OWNER_PASSWORD import-v1 dist/src/auth/owner-cli.js provision
docker compose -p globows-v2-review -f compose.local.yml --env-file .env.harness.local run --rm import-v1 --dry-run
docker compose -p globows-v2-review -f compose.local.yml --env-file .env.harness.local run --rm import-v1 --apply
```

Para el comando de provisión, carga el correo y la contraseña generados en las variables homónimas de la sesión PowerShell. Usa el archivo local del runner como fuente y evita imprimir, compartir o agregar esos valores a Git.

Abre [el sitio](http://127.0.0.1:3100) y [el acceso editorial](http://127.0.0.1:3100/admin/login). La [API de salud](http://127.0.0.1:3101/api/v1/health/ready) comprueba PostgreSQL y almacenamiento persistente.

El simulacro muestra entradas nuevas, actualizaciones, conflictos y elementos ya importados. La aplicación conserva las ediciones del OWNER ante un cambio en la fuente. Si hay conflictos, la importación informa las claves y el lote requiere revisión.

Detén el proyecto con `docker compose -p globows-v2-review -f compose.local.yml --env-file .env.harness.local down` para conservar los datos. El proyecto aislado que usa el runner se puede detener si sus puertos están ocupados por ese proceso.
