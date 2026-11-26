# Informe final FREE-01 · Globows LM v2.0.0

**READY_FOR_HUMAN_PRODUCTION_ACCEPTANCE** para entrega académica y validación inicial no comercial. P25 y P26 cerrados el 26 de noviembre de 2026. La aceptación comercial sigue pendiente por las condiciones de Vercel Hobby. Noindex permanece activo.

## Git y despliegues

| Registro | Resultado verificado |
| --- | --- |
| `main` | `ace77e3caea6b2fa9022536281d0ad96cd660b0d`. PR [#8](https://github.com/CarlosAM03/Globowslm/pull/8) integrado. |
| Tag anotado | `v2.0.0`, objeto `73ba169f3727130b35eea55f3685065a9f40cfdf`, referencia remota resuelta al SHA de `main`. |
| Release | Publicada y consultada en GitHub con ID `459467652`. [Globows LM v2.0.0](https://github.com/CarlosAM03/Globowslm/releases/tag/v2.0.0) |
| Vercel Hobby | `dpl_DGj6GZZKvyuMMPFEHSrgDqEBYoaS`, READY y asociado al SHA final. [Sitio](https://globowslm.vercel.app) · [Panel](https://globowslm.vercel.app/admin/login) |
| Render Free | `dep-dc43cn0ae00c73d4rbtg`, live y asociado al SHA final. Servicio `srv-dc41lprl550s73fu8e6g`, workspace `tea-dc3v285g1s2s73cr1l2g`, región Ohio. [API](https://globowslm-api.onrender.com) · [Readiness](https://globowslm-api.onrender.com/api/v1/health/ready) |
| Supabase Free | `ajguiknpwgkpoelwhsnv`, PostgreSQL 17.12 en Ohio, pooler de sesión con verificación TLS, bucket privado `globows-media`. |
| Costo | 0 USD de presupuesto de infraestructura inicial y recurrente, con los tres servicios en los planes gratuitos aprobados. |

Commits del cierre: `f1427d4` evidencia P25 y recuperación aislada, `d6a8d13` versiones 2.0.0, `ac53ffc` documentación P26. Esta rama conserva los resultados observados después del merge. El tag sigue apuntando al commit que se probó y desplegó.

## Gates

- [CI del PR](https://github.com/CarlosAM03/Globowslm/actions/runs/45830270623) y [CI de main](https://github.com/CarlosAM03/Globowslm/actions/runs/45830715109). Pasaron los tres trabajos de cada ejecución, frontend Node 22.23.5 y 24.x y backend Docker Node 22.23.5. Incluyen builds, pruebas unitarias, suite API con migraciones, pruebas Chromium y Lighthouse.
- Smoke del SHA final. HTTP 200 para portada, blog, login, sitio y posts en API, readiness y OpenAPI. Diagnóstico anónimo devolvió HTTP 401 tanto en la API como en el BFF. Se verificó `noindex`.
- Respuesta [OpenAPI](https://globowslm-api.onrender.com/api/v1/openapi.json) con 27 rutas, contrato 3.0.0 y SHA-256 `03e56deea2d4ebcbceba57ac1a2b30eb55d48881f0a9eceb61a65c5399abc081`, igual a la evidencia anterior.
- Las siete imágenes originales respondieron HTTP 200 y conservaron tamaño y SHA-256 en el SHA final. P25 también verificó 206 y 416 para un objeto WebP, denegación pública en el bucket, seis migraciones, 16 tablas con RLS y cero grants a roles de Data API. Tope privado constatado de 47,185,920 bytes.
- El propietario validó OWNER, ADMIN, contenido y flujo editorial. El inventario restaurado preservó ambos roles y 15 entradas. La importación V1 se mantuvo aplicada y el simulacro acreditado reportó 15 entradas sin cambios y cero conflictos.
- El respaldo poblado DPAPI se restauró en Docker aislado con siete objetos verificados. El detalle de persistencia y hashes está en [P25](evidencias/P25.md).
- Se revocó un enlace temporal de acceso compartido del alias que apareció durante la inspección. La comprobación posterior confirmó el alias estable y la ausencia de enlaces compartidos activos.

## Operación y recuperación

[Operación cloud, TLS, migraciones y rollback](operacion-cloud.md) · [Recuperación OWNER y ADMIN](cuentas.md) · [Validación local en Docker Compose](../Revision-local.md) · [Dependencias congeladas](../Dependencias.md) · [Matriz M01–M12](../Candidata-2.0.0-rc.1.md)

Antes de retroceder, verificar compatibilidad con las seis migraciones y con ambas cuentas. El par anterior comprobado es Vercel `dpl_FmwBu6b7FuDDvDQ3m1Z6z7z2GXfU` y Render `dep-dc4229ui0phs738u3i60`, ambos sobre `f0e30b54c621c3e69e972c0224a00ca5a8b8fd90`. Mantener respaldo y contenidos actuales durante un rollback de código. Para validar datos restaurados usar primero el entorno aislado de P25.

Se conservan los pendientes editoriales de V1. La suspensión por inactividad y los tiempos de arranque de los planes gratuitos siguen vigentes. La resiliencia autónoma del frontend queda reservada para v2.0.1.
