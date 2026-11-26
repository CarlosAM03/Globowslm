# Informe de liberación FREE-01 · Globows LM 2.0.0

El cierre remoto, los IDs de despliegue y el SHA congelado constan en el [informe final](informe-final.md).

Estado actual y operaciones persistentes en [estado.json](estado.json). [Decisiones](decisiones.md) · [Preflight P18](evidencias/P18.md) · [Roles P19](evidencias/P19.md) · [Seguridad P20](evidencias/P20.md) · [Candidata 2.0.0-rc.1](../Candidata-2.0.0-rc.1.md)

[Persistencia P21](evidencias/P21.md) · [Configuración y recuperación cloud](operacion-cloud.md) · [Diagnóstico histórico P23](evidencias/P23.md) · [Aceptación cloud P25](evidencias/P25.md) · [Cierre P26](evidencias/P26.md)

## Checkpoint

P19 integrado como `04f67d5c90e2dcf539944578cc7b4ef6b0717858`. P20 integrado como `b1bf4cc545b95a180bf4817a3d4eaf49160ec82b`. P21 publicado como `7fa0b44c25eacf70882e68651ee9364032c98445`. Supabase tiene seis migraciones, TLS en ambos tramos del pooler, RLS sobre 16 tablas y Storage privado verificado. El preview automático de P20 falló por alcance TypeScript. La corrección excluye el backend del proyecto TypeScript de Next.

OpenAPI local del stack P21, 27 rutas, SHA-256 `03e56deea2d4ebcbceba57ac1a2b30eb55d48881f0a9eceb61a65c5399abc081`. Archivo local `.visual-evidence/release/openapi-local-free01.json`.

## Instalación académica

| Servicio | Entorno | Dirección u operación |
| --- | --- | --- |
| Frontend | Vercel Hobby, Node 24.x administrado | [Sitio](https://globowslm.vercel.app) · [Panel editorial](https://globowslm.vercel.app/admin/login) |
| Backend | Render Free, contenedor Node 22.23.5, servicio `srv-dc41lprl550s73fu8e6g` | [API](https://globowslm-api.onrender.com) · [Readiness](https://globowslm-api.onrender.com/api/v1/health/ready) · [OpenAPI](https://globowslm-api.onrender.com/api/v1/openapi.json) |
| Datos | Supabase Free, PostgreSQL 17.12, Prisma 7.10.1, proyecto `ajguiknpwgkpoelwhsnv` | Pooler de sesión con TLS verificado y bucket privado `globows-media` |

Los proveedores se mantuvieron en los planes gratuitos aprobados y el presupuesto de infraestructura es de 0 USD. Render puede suspender la instancia por inactividad y el siguiente acceso puede tardar. Supabase Free también puede pausar el proyecto. La publicación comercial y la captación de clientes están condicionadas por Vercel Hobby. El sitio conserva `noindex`. [Planes y operación](operacion-cloud.md)

La matriz M01–M12 de la candidata mantiene la trazabilidad del producto. P19 añade la verificación de ambos roles en M01, M02 y M11. P21 y P25 amplían la evidencia de persistencia, seguridad, importación y recuperación en M06, M10, M11 y M12. El inventario directo congelado se conserva en los dos manifiestos y lockfiles. [Matriz](../Candidata-2.0.0-rc.1.md) · [Dependencias](../Dependencias.md) · [Changelog](../../../CHANGELOG.md)

La aceptación humana de OWNER, ADMIN, contenido público y flujo editorial se registró en P25. Los procedimientos de recuperación mantienen la identidad y el historial de ambas cuentas. [Cuentas](cuentas.md) · [Manual OWNER](../Manual-OWNER.md) · [Validación local](../Revision-local.md)
