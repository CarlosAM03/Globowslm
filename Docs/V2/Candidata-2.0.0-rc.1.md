# Globows LM 2.0.0-rc.1

Candidata local para revisión de la propietaria en `develop/v2.0.0`. Base contractual `88a43ab41718edcb99cee9aed685f2b4c6afcc16`. Los checks de esta candidata se ejecutan con Docker Compose y quedan registrados por el runner. [Revisión local](./Revision-local.md) · [Manual OWNER](./Manual-OWNER.md) · [Operación y recuperación](./Operacion-local-y-produccion.md)

## Trazabilidad

| Módulo | Requisito | Implementación y pruebas |
|---|---|---|
| M01 | R01 | Cuenta OWNER, sesión y CSRF. Login, rate limit, recuperación y revocación. [P04](Evidencias/P04.md) · [P16](Evidencias/P16.md) |
| M02 | R02 | Panel con actividad, estados, carga y navegación responsive. [P05](Evidencias/P05.md) · [P15](Evidencias/P15.md) |
| M03 | R03 | Institucional, preview y revisión vigente. Concurrencia, URLs y contactos. [P06](Evidencias/P06.md) · [P14](Evidencias/P14.md) |
| M04 | R04 | Servicios y tipos de evento, referencias, orden y cinco servicios aprobados. [P07](Evidencias/P07.md) |
| M05 | R05 | Galerías de decoración, categorías, fotos reutilizables y carrusel. [P09](Evidencias/P09.md) · [P14](Evidencias/P14.md) |
| M06 | R06 | Carga binaria, previsualización, persistencia, rangos, limpieza y protección de referencias. [P08](Evidencias/P08.md) · [P15](Evidencias/P15.md) |
| M07 | R07 | Blog por slug, paginación, categorías y bloques tipados. Publicación y retiro comprobados en Chromium. [P12](Evidencias/P12.md) · [P15](Evidencias/P15.md) |
| M08 | R08 | Oferta presencial, CTA por interés y medios opcionales. [P10](Evidencias/P10.md) · [P14](Evidencias/P14.md) |
| M09 | R09 | Confirmación del organismo y evidencia de credenciales. Estado vacío comercial vigente. [P11](Evidencias/P11.md) |
| M10 | R10 | Snapshots atómicos, historial, rollback de borrador y auditoría. [P03](Evidencias/P03.md) · [P13](Evidencias/P13.md) |
| M11 | R11 | CORS, CSP, validación, sesión, límites, pruebas de regresión y restauración de DB y media. [P04](Evidencias/P04.md) · [P08](Evidencias/P08.md) · [P15](Evidencias/P15.md) · [P16](Evidencias/P16.md) |
| M12 | R12 | Importación idempotente de 15 entradas y siete WebP, stack real y guía de revisión. [P14](Evidencias/P14.md) · [P17](Evidencias/P17.md) |

El directorio [Evidencias](./Evidencias/) conserva el Markdown y el manifiesto verificable de cada patch. [Baseline](Evidencias/P00.md) · [Versiones](Evidencias/P01.md) · [Infraestructura](Evidencias/P02.md)

## Verificación local

Ejecuta desde el worktree V2 con Docker Desktop en el contexto local, Python y el archivo `.env.harness.local` generado por el runner. Detén primero el proyecto que ocupe los puertos 3100 y 3101. El proyecto QA guarda su inventario separado del proyecto usado para revisión.

```powershell
python scripts/v2-verify-local.py --project globows-v2-2c0de20001
```

La secuencia corre tipos, lint, pruebas y build web, tipos, lint, migraciones y pruebas API, arranque web/API/DB, Chromium externo, resiliencia y auditorías npm de runtime y árbol completo. Detiene sus servicios al terminar y conserva volúmenes. Usa [Revisión local](./Revision-local.md) para el arranque independiente con provisión e importación explícitas.

[OpenAPI JSON local](http://127.0.0.1:3101/api/v1/openapi.json) · [Inventario de dependencias](./Dependencias.md)

## Riesgos y decisiones pendientes

- La validación comercial y el cierre de V1 quedan en manos de la propietaria. El inventario vigente tiene correo ausente y cero credenciales individuales verificadas. [P14](Evidencias/P14.md)
- La configuración admite backend HTTPS, PostgreSQL privado y almacenamiento persistente. El aprovisionamiento, la indexación, la conexión real y el despliegue se harán posteriormente. [Operación y recuperación](./Operacion-local-y-produccion.md)
- La persistencia multimedia requiere respaldar el volumen en la misma ventana que PostgreSQL, comprobar espacio y ensayar la restauración. [P16](Evidencias/P16.md)
- ESLint 9.39.5 permanece en el frontend de QA con seguimiento por fin de soporte. El registro de V1 conserva su excepción histórica de desarrollo. Los avisos de paquetes de SO se revisan al actualizar las imágenes. [Dependencias](./Dependencias.md)
- Las pruebas con axe y Lighthouse son de laboratorio. El origen HTTP interno de Compose condiciona buenas prácticas. El primer arranque móvil y la transferencia de escritorio se conservan en evidencia. [P15](Evidencias/P15.md)
- Las respuestas de blog que ya comenzaron a transmitirse pueden renderizar la vista de no encontrado con estado 200 en Next. La API devuelve 404 para borradores, retirados y slugs inexistentes. [P12](Evidencias/P12.md)
