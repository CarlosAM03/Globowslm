# Globows LM — Release Candidate V1

**Corte:** 13/10/2026. **Versión de paquete:** `1.0.0-rc.1`. **Dictamen:** READY WITH CONDITIONS como candidata; **no autoriza release final**. No se creó tag `v1.0.0`, release, apertura de indexación ni Sprint 6.

## 1. Autoridad y contenido vigente

ERP/ERV1 mantienen alcance; MID conserva tokens y fuentes; UIA/ADR D01–D09 conserva arquitectura. El responsable confirmó expresamente el preview aprobado como fuente comercial de textos, fotos, teléfono, WhatsApp y Facebook/Instagram/TikTok. No necesitan otra aprobación genérica.

- Teléfono: **+52 664 484 6470**. WhatsApp: destino aprobado `https://wa.me/5216644846470`, preservado del preview; seis contextos codificados en el helper.
- Facebook, Instagram y TikTok: enlaces aprobados centralizados en `src/config/site.ts`, usados por Contacto, Footer y menú flotante. Cuatro consultas externas GET respondieron 200; no se enviaron mensajes ni se verificó entrega comercial.
- Hero/About/Academia y tres FAQ recuperan copy aprobado. Las correcciones ortográficas no introducen promesas. La expansión digital de FAQ queda explícitamente futura, fuera de V1.
- Siete fotografías derivadas WebP de originales intactos; San Valentín permanece en formación, 8marzo en decoración según contenido aprobado. Cuatro fichas de servicio tienen fotografía pertinente. Certificaciones carece de imagen representativa; no se sustituye por una decoración engañosa.
- Credenciales individualizadas: no constan nombres, organismos, fechas o evidencia que permita poblar el timeline. El dataset vacío y estado editorial son deliberados; fixtures de prueba no son contenido comercial.
- Correo: no se encuentra en documentación ni preview. Quinta posición del menú/contacto inactiva explícita, sin `mailto` inventado.

## 2. Trazabilidad Git y deployments

Base actualizada al merge PR #2: `78d707c97fbb4d2d1af0ed19d2a6a36e5da23b48`. Rama de trabajo: `feature/sprints-4-5-release-hardening`.

| Hito | SHA / evidencia | Estado observado |
|---|---|---|
| Contenido aprobado, carrusel, menú compacto, SEO/headers/QA | `8e577e8df746f4f3a2f4efd98e16b4bf99b320da` | Publicado; CI push y PR correctos |
| Tamaños de imágenes y agrupación de CSS | `bd5d6d781784a11a7b6ae2e3906f34bf82bd0c67` | Publicado; CI push y PR correctos |
| Copy cursos/talleres exacto y FAQ condicional probada | `40bd061f222ed23cafa3e0069a4f4d3392c2c845` | Publicado; CI push exitoso, 27 unitarias/29 E2E en el código actual |
| [PR #3](https://github.com/CarlosAM03/Globowslm/pull/3) | Creado Draft por el agente; posteriormente integrado externamente | Merge externo `30e8330152e4183a7a4b275fa45da42da8badf83`; no fue merge del agente |

El deployment público revisado de `https://globowslm.vercel.app` corresponde al merge externo `30e8330`, cuyo código coincidía con el hito `bd5d6d7`; no acredita los cambios posteriores `40bd061` ni el HEAD documental final. La integración Git de Vercel realizó el deployment; no se configuró ni ejecutó despliegue manual por el agente.

El Preview del primer hito fue reportado exitoso por GitHub, pero al abrirlo devolvió **Login Vercel**. El 200 de esa página no es un smoke satisfactorio de la Landing. No se evade protección ni se afirma QA de una aplicación que no pudo verse. El Preview final y CI de HEAD se registran en el cierre operativo al final de este documento.

## 3. Diseño y funcionalidad

Hero de fotografía única dominante con overlay y editorial superpuesto; About con foto completa. Se mantienen fuentes locales Manrope/Cormorant y colores oficiales. Servicios/eventos integrados D02, cinco servicios; cursos/talleres/mentorías y CTA contextual activos. FAQ nativa `details/summary`, condicional y navegable.

Galería manual: cuatro fotografías, tres categorías, filtros, 1/2/3 tarjetas en móvil/tablet/desktop, controles anteriores/siguientes, teclado y desplazamiento táctil. Sin autoplay ni exploradores redundantes. Menú flotante compacto circular, columna de iconos, tooltips y foco/Escape; cuatro canales activos y correo ausente controlado.

Paridad: intención fotográfica/editorial, carrusel y botón flotante recuperados. Diferencias intencionales: ocho posiciones del ADR, galería categorizada, cinco servicios ERV1, tipografías/tokens MID, estado vacío real de acreditaciones, canales accesibles con click/teclado. No se restaura un botón legal vacío ni se afirma certificación inexistente.

Capturas comparables preview/Next a **375×812, 768×1024 y 1440×900** en [Evidencias/Sprints4-5](Evidencias/Sprints4-5/). Manifest final: seis superficies capturadas, sin solicitudes fallidas ni imágenes finales rotas. El manifest almacena `src` fallback de next/image; el recurso elegido por viewport se comprueba mediante `currentSrc` en el smoke runtime. Originales/legacy/AGENTS y documentos oficiales preservados.

## 4. Validaciones reales

| Comprobación | Resultado y límites |
|---|---|
| `npm run typecheck` | Correcto: `next typegen` + TypeScript |
| `npm run lint` | Correcto, sin desactivar reglas |
| `npm test` | **27/27**; WhatsApp, contactos, carrusel, credenciales/estado vacío, SEO y FAQ/escape |
| `npm run build` | Correcto; `/`, `/_not-found`, `/robots.txt`, `/sitemap.xml` prerenderizados |
| `npm run test:e2e` | **29/29**, sin inesperados, flaky ni omitidos; Chromium |
| Responsive | 320/375/390/428/640/768/1024/1280/1440; anclas, carga de imágenes y overflow global comprobados |
| Axe | Cero violaciones en seis estados: móvil/desktop, cerrado/menú flotante/FAQ, reglas WCAG 2 A/AA, 2.1 A/AA y 2.2 AA |
| Accesibilidad manual/funcional | Teclado, Escape, foco, skip link, movimiento reducido y controles. Sin lector de pantalla ni Safari/Firefox/dispositivos físicos: no conformidad WCAG completa |
| Runtime público `30e8330` | HTTP 200 a 375/1440; imágenes cargadas, anclas reales, galería/FAQ/menús operables, sin errores JS observados, noindex vigente |

Hubo una falla intermedia de Home del carrusel: snap con padding inline de 8px impedía el estado inicial correcto; se corrigió y se reejecutaron las pruebas. Un smoke intermedio comprobaba un filtro antes del commit React; el script espera explícitamente resultado y estado de controles. No se ocultaron fallos.

Node local validado **22.19.0**, npm compatible con contrato engines, también en CI. Runtime portable obtenido del distribuidor oficial, SHA256 comprobado, solo en directorio local ignorado. El workflow verifica checkout limpio con `npm ci`; la validación reproducible remota se obtiene del resultado real de CI, no de afirmar que el working tree local ajeno esté limpio.

## 5. Rendimiento y SEO

Lighthouse **13.5.0**, Node 22.19.0, build productivo local, Chrome de Playwright. Tres corridas optimizadas fijas del hito `bd5d6d7`; se conserva baseline de la misma versión y las corridas intermedias. No seleccionar solo la mejor. Cambios posteriores: copy y condición FAQ; CI mide separadamente su HEAD.

| Mediana de tres | Móvil | Desktop |
|---|---:|---:|
| Performance | **91** (89/92/91) | **100** (100/100/100) |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | **66** | **66** |
| LCP | 3208.58 ms | 743.33 ms |
| CLS | 0 | 0 |
| TBT | 132 ms | 3 ms |
| Transferencia | 431378 bytes | 521082 bytes |

Móvil: emulación 412×823, red simulada Lighthouse slow 4G, RTT 150ms/throughput 1638.4Kbps, CPU ×4. Desktop: 1350×940, RTT 40ms, throughput 10240Kbps, CPU ×1. Configuración completa/datetime/platform en cada JSON. Los reportes completos JSON/HTML se conservan localmente y como artifacts CI, no se versionan binarios de herramientas.

Baseline comparable: Performance 86 móvil/100 desktop, LCP móvil 2.38s y TBT 486ms. El contenido aumentó y LCP no mejoró uniformemente; el objetivo pendiente es optimizar LCP móvil (~3.21s), no prometer todas las métricas mejores. Ajuste de `sizes` evita sobredimensionar recursos y agrupación CSS reduce solicitudes; sin degradar calidad ni eliminar secciones.

SEO 66 se explica por `noindex` deliberado, no se abre indexación para alcanzar 90. Idioma, título/descripción, Open Graph/Twitter y favicon preparados. `robots.txt` permite leer noindex; sitemap vacío y canonical ausente mientras `GLOBOWS_CANONICAL_URL` no tenga un origen HTTPS aprobado. La URL actual de Vercel sirve para imágenes compartidas, no se inventa dominio permanente.

Event Timing observado en smoke público: duración máxima de eventos hasta 16ms móvil/48ms desktop. Son muestras de laboratorio, **no INP de campo** ni estadísticas de usuarios. No se activaron Analytics/Speed Insights ni instrumentación comercial.

**Medición del código final en CI Linux (`40bd061`):** una corrida por dispositivo, Performance 94/100, Accessibility 100/100, Best Practices 100/100, SEO 66/66; LCP 3074.34/666.03 ms, CLS 0/0, TBT 63/0 ms. Es una medición separada de la mediana Windows, con configuración conservada en `lighthouse-ci-40bd061.json`; no mezclar entornos ni sustituir tres corridas por el mejor resultado.

## 6. Seguridad

Audit directamente ejecutado: **0 vulnerabilidades runtime, 5 altas dev, 0 críticas**. Todas las altas pertenecen a la cadena ESLint/Next → fast-glob → micromatch → braces 3.0.3; no una exposición de cinco componentes de negocio. [Registro y advisory](RegistroRiesgoDependencias.md) conserva causa, controles, dueño y revisión. **Excepción no aceptada**: requiere decisión del arquitecto/propietario.

Lighthouse 12 evaluado temporalmente añadía advisories; 13.5.0 los elimina y exige Node 22.19 dentro del major ya usado. No se hace fix --force, override sin parche, downgrade Next/ESLint ni migración mayor arbitraria. No hay entrada de globs en runtime público.

Headers reales: nosniff, DENY, política de referencias/permisos y X-Robots noindex. CSP restringe recursos a self y bloquea object/frames/form; permite inline para Next/estilos generados, **no CSP estricta con nonce/hashes**. Sin dangerouslySetInnerHTML ni secretos en fuente. Workflow contents:read, checkout sin persistir credenciales, PR sin secretos, timeout y artifacts limitados a reportes QA.

## 7. CI, operación y rollback

GitHub Actions ejecuta `npm ci`, tipos/typecheck, lint, unitarias, build, Chromium/E2E/axe, Lighthouse móvil/desktop y artifacts siete días. Las puntuaciones se registran; no se suprime noindex ni se simula un umbral cumplido. Vercel realiza CD mediante integración Git existente, sin workflow de deployment manual.

Evidencias remotas ya verificadas:

- [CI hito 8e577e8 — push](https://github.com/CarlosAM03/Globowslm/actions/runs/38427430840), [PR](https://github.com/CarlosAM03/Globowslm/actions/runs/38427571588): success.
- [CI hito bd5d6d7 — push](https://github.com/CarlosAM03/Globowslm/actions/runs/38429193935), [PR](https://github.com/CarlosAM03/Globowslm/actions/runs/38429201543): success.
- [CI código final 40bd061 — push](https://github.com/CarlosAM03/Globowslm/actions/runs/38433918227): success; etapas y medición propia en Evidencias/Sprints4-5/ci-code-40bd061.json y lighthouse-ci-40bd061.json.

Operación inicial propuesta: responsable consulta disponibilidad HTTPS, logs de build/runtime Vercel y reportes CI ante cambios/incidencias; reproduce smoke y Lighthouse al modificar componentes relevantes. No se afirma monitoreo continuo configurado ni métricas de tráfico no observadas. No se ha ensayado una reversión productiva.

**Procedimiento de rollback — solo tras autorización del propietario:**

1. Identificar incidente, SHA actual y deployment anterior de producción elegible; comprobar que servía la versión correcta con sus variables, dominio y contenido. El rollback recupera un deployment existente; no ejecuta un build nuevo.
2. Guardar evidencia y comunicar alcance. Propietario usa **Instant Rollback** en dashboard Vercel al deployment anterior elegible. No ejecutar comandos de reversión ni reescribir Git como parte de este documento.
3. Comprobar HTTPS, `/`, imágenes, navegación, menús, WhatsApp y noindex; registrar hora/deployment/SHA y resultado. Si falla, escalar con evidencia.
4. La asignación automática de dominios se detiene tras rollback; al preparar corrección, el propietario decide **Undo Rollback** o promoción autorizada. Revisar configuración real del proyecto antes de actuar.

Fuente del procedimiento: [Vercel — Instant Rollback](https://vercel.com/docs/instant-rollback). Es un runbook documentado, no evidencia de reversión ejecutada ni revisión completa del dashboard.

## 8. Puerta de release

- [x] Contenido/fotos/teléfono/redes del preview aprobados e integrados; no reabrir aprobación general.
- [x] WhatsApp contextual y navegación operativos, carrusel manual y menú compacto.
- [x] QA local y CI de hitos reales; candidato versionado y reproducible.
- [x] Noindex conservado, originales intactos, sin backend/V2 ni Sprint 6.
- [ ] Dirección oficial de correo, quinto destino funcional y pruebas actualizadas.
- [ ] Credenciales individuales auténticas/organismos/evidencias e imagen representativa del servicio; poblar timeline y probarlo en navegador con datos reales.
- [ ] Decisión formal del arquitecto sobre riesgo dev, sin aceptación atribuida al agente.
- [ ] Revisión autenticada del Preview de HEAD y confirmación del dominio/permisos Vercel.
- [ ] Autorización explícita para integrar/liberar/indexar; CI del HEAD aprobado correcto.
- [ ] Release/tag y smoke final de ese deployment, fuera de esta ejecución.

LCP móvil, lector de pantalla y revisión de navegadores adicionales se registran como refinamiento/validación final; no se disfrazan de acreditación ni dato comercial pendiente. Sprint 6 solo después de release autorizado y no está iniciado.

## 9. Cierre remoto del HEAD final

[PR #4 — cierre](https://github.com/CarlosAM03/Globowslm/pull/4), creado Draft tras el merge externo de PR #3, base main `30e8330`; integrado externamente por CarlosAM03 el 13/10/2026 a las 17:02:52 UTC, merge `7a1355d7938579b978722c32417f82fe395d6f08`. El agente no hizo merge. Solo añade ajustes/evidencias posteriores, sin presentar el código ya integrado como nuevo diff. No equivale a release final ni apertura de indexación.

**SHA de código/evidencias comprobado:** `862483b8f6225a06aba66616f66efd5ec4dfdd7a`. [CI push](https://github.com/CarlosAM03/Globowslm/actions/runs/38434878406) y [CI PR](https://github.com/CarlosAM03/Globowslm/actions/runs/38434886707): ambos success, todas las etapas. Artifact E2E final leído: total/expected 29; unexpected/flaky/skipped 0. Lighthouse Linux del mismo SHA: Performance 94/100, Accessibility/Best Practices 100, SEO 66, LCP 3134.624/683.02815 ms, CLS 0, TBT 52.5/0 ms; [JSON](Evidencias/Sprints4-5/lighthouse-ci-862483b.json). No se mezcla con la mediana Windows.

Preview exacto: deployment `7044727076`, [URL](https://globowslm-1yot4n0zo-carlos-armentas-projects.vercel.app), GitHub status success. Chromium observó HTTP 200 en **Login – Vercel**, origen vercel.com/login, `landingVisible=false`: [registro sin parámetros de autenticación](Evidencias/Sprints4-5/preview-862483b.json). Requiere acceso autorizado para inspeccionar esa aplicación. El smoke público documentado sigue siendo el corte `30e8330`; no se atribuye a otro SHA sin comprobarlo. Este cierre documental posterior no cambia el código de aplicación; su commit/PR/checks se identifican por resultado real en la entrega.
