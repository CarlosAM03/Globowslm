# Cuentas de Globows LM

El CMS admite una cuenta OWNER y una ADMIN. Ambas editan, publican y retiran contenido y cambian su propia contraseña desde **Mi cuenta**. ADMIN también puede consultar **Diagnóstico**. La vista muestra disponibilidad y los últimos 25 eventos sanitizados. OWNER conserva el resumen de su actividad editorial en el panel.

La provisión y la recuperación son operaciones de CLI. Desde una imagen API revisada con el esquema actualizado, ejecuta estos comandos con la configuración del entorno de destino inyectada por un gestor de secretos.

```text
node dist/src/auth/owner-cli.js provision OWNER
node dist/src/auth/owner-cli.js provision ADMIN
node dist/src/auth/owner-cli.js recover OWNER
node dist/src/auth/owner-cli.js recover ADMIN
```

Cada rol toma `GLOBOWS_<ROL>_EMAIL` y `GLOBOWS_<ROL>_PASSWORD` únicamente durante la operación. Introduce valores en el canal seguro y limpia las variables efímeras al finalizar. La provisión con el mismo correo normalizado y la misma contraseña devuelve un resultado idempotente. La recuperación conserva el ID y las referencias del rol y revoca todas sus sesiones. El otro rol mantiene sus sesiones. Las contraseñas deben ser distintas. La recuperación se registra mediante un actor técnico reservado.

Durante una actualización, ejecuta primero las migraciones y después cambia al runtime con soporte para ambos roles. Una vez creada ADMIN, el backend de P17 queda fuera de los destinos de rollback porque no distingue roles. Usa un build con RBAC y esquema compatible.
