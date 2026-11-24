# Revisión local de Globows LM V2

Ejecuta estos comandos desde el worktree V2. El runner genera `.env.harness.local` con valores aleatorios de uso local. El proyecto `globows-v2-review` tiene sus propios volúmenes.

Si el stack de QA del runner ocupa los puertos, identifica primero sus contenedores con `docker compose ls`. Detén ese proyecto sin borrar volúmenes antes de levantar el de revisión.

```powershell
$localReview = @('compose', '-p', 'globows-v2-review', '-f', 'compose.local.yml', '--env-file', '.env.harness.local')
docker @localReview up -d --build --wait --wait-timeout 120 db api web

$ownerFixture = Get-Content .env.harness.local -Raw | ConvertFrom-StringData
$env:HARNESS_OWNER_EMAIL = $ownerFixture.HARNESS_OWNER_EMAIL
$env:HARNESS_OWNER_PASSWORD = $ownerFixture.HARNESS_OWNER_PASSWORD
try {
    docker @localReview exec -T -e HARNESS_OWNER_EMAIL -e HARNESS_OWNER_PASSWORD api node dist/src/auth/owner-cli.js provision
    if ($LASTEXITCODE -ne 0) { throw 'La provisión del OWNER falló' }
} finally {
    Remove-Item Env:HARNESS_OWNER_EMAIL, Env:HARNESS_OWNER_PASSWORD
    Remove-Variable ownerFixture
}

docker @localReview run --rm --build import-v1 --dry-run
docker @localReview run --rm import-v1 --apply
Invoke-RestMethod http://127.0.0.1:3100/api/health -NoProxy
Invoke-RestMethod http://127.0.0.1:3101/api/v1/health/ready -NoProxy
```

La provisión se hace una vez por instalación. En ejecuciones posteriores omite el bloque OWNER. Puedes repetir la importación con el mismo inventario. El simulacro muestra las entradas nuevas, las actualizaciones, los conflictos y los elementos ya importados. Un conflicto detiene la aplicación del lote y conserva las ediciones del CMS.

Abre [el sitio](http://127.0.0.1:3100), [el acceso editorial](http://127.0.0.1:3100/admin/login) y [OpenAPI](http://127.0.0.1:3101/api/v1/openapi.json). Para un borrador de práctica puedes ejecutar `docker @localReview exec -T api npm run seed:demo -- --apply`. Se crea solo por solicitud explícita en local o test y aparece identificado como demo en el panel.

Detén la revisión con `docker @localReview down`. Los volúmenes de PostgreSQL y multimedia se conservan. [Manual del panel](./Manual-OWNER.md) · [Operación y recuperación](./Operacion-local-y-produccion.md)
