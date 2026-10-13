# Solicitud de excepción temporal — dependencias de desarrollo

**Corte:** 13/10/2026. **Estado:** propuesta documentada, **NO aceptada**. **Responsable de aceptación:** arquitecto responsable y propietario del repositorio, pendientes de pronunciamiento antes del release. Este registro no sustituye la corrección cuando exista una versión compatible.

| Campo | Evidencia y tratamiento |
|---|---|
| Advisory raíz | [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), severidad alta, recursión sin límite en `braces <=3.0.3`, con posible denegación de servicio al procesar patrones anidados maliciosos. El advisory consultado el 13/10/2026 no lista versión parcheada. |
| Cadena instalada | `eslint-config-next@16.4.0` (directa, dev) → `@next/eslint-plugin-next@16.4.0` → `fast-glob@3.3.1` → `micromatch@4.0.8` → `braces@3.0.3`. Consultada en `package-lock.json`/árbol npm. |
| Reporte local | `audit-report.json`: cinco entradas altas correspondientes a la misma cadena; cero críticas. Evidencia histórica del desarrollador: `npm audit --omit=dev` informa cero; repetir al cerrar Sprint 0 y antes de release. El archivo local está excluido de Git. |
| Contexto de exposición | Cadena utilizada por herramientas ESLint en desarrollo y CI. La Landing no acepta patrones de glob del usuario ni ejecuta ESLint en el runtime de Vercel. Es una inferencia de arquitectura, no prueba de ausencia de toda vía de explotación en CI. |
| Impacto | Fallo de disponibilidad del proceso Node que procese un patrón malicioso. Riesgo residual concentrado en equipos y jobs CI; el reporte completo seguirá marcando alta hasta remediación o cambio del árbol. |
| Remediación evaluada | Revisar releases de `braces`, `micromatch`, `fast-glob`, `@next/eslint-plugin-next` y `eslint-config-next` que eliminen el advisory sin romper Next 16; validar con `npm ci`, lint, typecheck, build y audits. No aplicar `npm audit fix --force`: el reporte sugiere `eslint-config-next@14.2.35`, cambio mayor incompatible con la Foundation Next 16. No forzar un override sin parche verificado. |
| Controles compensatorios propuestos | Ejecutar CI desde dependencias fijadas por lockfile y PRs revisados; evitar globs recibidos de fuentes no confiables; usar permisos mínimos y sin secretos en PRs; comprobar `npm audit --omit=dev` y reporte completo en cada revisión de dependencias y antes de release; actualizar tan pronto exista ruta compatible. |
| Condiciones de revisión | Nuevo parche/upstream compatible; cambio de uso de glob, incorporación de entrada externa o herramientas nuevas; cambio de severidad/advisory; antes del primer Preview público y antes de cada release. Revaluar también si el runtime de producción pasa a incluir esta cadena. |
| Decisión pendiente | El arquitecto responsable debe decidir si acepta temporalmente el riesgo residual de desarrollo/CI con controles, exige una alternativa compatible o detiene la integración. Ninguna de estas opciones está aprobada por este documento. |

La advertencia de fin de soporte de ESLint 9.39.5 se trata por separado: migrar a ESLint 10 u otra versión mayor requiere compatibilidad verificada de `eslint-config-next`, `eslint-plugin-react` y `eslint-plugin-jsx-a11y`, pruebas y aprobación técnica. No se realiza esa migración dentro del hardening acotado.

## Revisión Sprint 4–5 — 13/10/2026

- Audit directo después de incorporar herramientas QA: **0 runtime, 5 altas dev, 0 críticas**. Braces instalado y última versión consultada: 3.0.3; persiste GHSA-vfj7-8cjw-p6xm/CVE-2026-93687. La cadena dev permanece sin cambios; no hay remediación compatible comprobada. La sugerencia eslint-config-next 14.2.35 sigue siendo downgrade mayor incompatible.
- Lighthouse 12.8.2 y 12.6.1 evaluados temporalmente añadían advisories dev. Se sustituyeron por Lighthouse **13.5.0**; esos hallazgos adicionales desaparecieron. Axe 4.13.0 y Lighthouse son dev; Node **22.19.0** del mismo major 22 satisface sus engines. No se conserva ni acepta un nuevo riesgo de esas versiones descartadas.
- Controles ejecutados: lockfile, CI contents:read sin secretos en PR, checkout sin persistir credenciales, timeout, tipos/lint/unitarias/build/E2E/axe y mediciones. No hay entrada pública de glob ni import de ESLint en código productivo. No equivale a demostrar ausencia de toda vía de explotación en CI.
- Headers comprobados localmente y en deployment actual: nosniff, DENY, referrer policy, permissions policy y noindex. CSP restringe recursos a self y bloquea frames/object/form; permite inline para bootstrap Next y estilos generados. **No es una CSP estricta con nonce/hashes**, no se describe como tal; se conserva prerender estático. JSX escapa texto FAQ (prueba real), sin dangerouslySetInnerHTML.
- Revisar antes de release, al publicarse parche compatible o al cambiar exposición/globs/dependencias. Responsable: arquitecto/propietario del repositorio. **Excepción NO aceptada**. Release oficial sigue condicionado a decisión explícita; no hubo fix --force, override ni downgrade de Next/ESLint.

Evidencia compacta: [audit](Evidencias/Sprints4-5/dependency-audit-summary.json). El reporte completo sigue siendo local e ignorado.
