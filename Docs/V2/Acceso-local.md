# Acceso de la propietaria

La cuenta OWNER se prepara con un comando local después de ejecutar las migraciones. Las credenciales de revisión y los datos del entorno de PostgreSQL se crean para uso local. Guarda la contraseña de revisión en un gestor local de contraseñas y limpia las variables al terminar.

## Provisión y recuperación en Compose

Desde el worktree de V2, con la API del proyecto de revisión iniciada:

```powershell
$compose = @('compose', '-p', 'globows-v2-review', '-f', 'compose.local.yml', '--env-file', '.env.harness.local')
$env:HARNESS_OWNER_EMAIL = 'owner@example.invalid'
$env:HARNESS_OWNER_PASSWORD = Read-Host 'Contraseña local de 12 caracteres o más' -MaskInput
try {
    docker @compose exec -T -e HARNESS_OWNER_EMAIL -e HARNESS_OWNER_PASSWORD api node dist/src/auth/owner-cli.js provision
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo aprovisionar la cuenta local.' }
} finally {
    Remove-Item Env:HARNESS_OWNER_EMAIL, Env:HARNESS_OWNER_PASSWORD
}
```

Para recuperar la cuenta, ingresa el correo local y la nueva contraseña y sustituye `provision` por `recover`. La operación revoca todas las sesiones existentes. Después, inicia sesión con los datos nuevos en `/admin/login`.

## Sesión y navegador

El BFF de Next requiere `APP_ORIGIN` y `CMS_API_INTERNAL_URL` en el servidor. Para una revisión en red Compose sirven `http://127.0.0.1:3100` y `http://api:3101` respectivamente. La configuración productiva requiere HTTPS. El backend y Next validan el mismo `APP_ORIGIN`.

El BFF emite una cookie de sesión HttpOnly y SameSite=Lax, con Secure en HTTPS. El backend almacena el hash del token y expira la sesión tras 30 minutos sin actividad o al alcanzar ocho horas. La API no habilita CORS para autenticación. El ingreso requiere un desafío de un uso y las mutaciones autenticadas exigen el token CSRF y el origen exacto. Cerrar sesión invalida la sesión actual en PostgreSQL y elimina la cookie.

El límite actual usa la dirección del socket de la API y evita confiar en cabeceras de un proxy sin configurar. Detrás del mismo BFF, la IP es compartida. El límite por cuenta e IP aplica cinco intentos por 15 minutos y el límite por IP aplica 30 en la misma ventana.
