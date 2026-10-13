# Evidencia QA — Sprints 4–5

**Corte:** 13/10/2026. Capturas reales Chromium del preview local intacto y del build productivo Next. Comparación a 375×812, 768×1024 y 1440×900, incluyendo menú flotante abierto. El full-page/galería amplía el recorrido. `capture-manifest.json` corresponde a la última captura tras copy final: seis superficies, solicitudes fallidas vacías, imágenes cargadas.

## Comparación por área

| Área | Referencia aprobada | Candidata y evaluación |
|---|---|---|
| Navbar | Marca tipográfica, sticky y navegación | Tokens/fuentes conservados, ocho destinos reales; menú accesible. Sin extraer logo de foto |
| Hero | Fondo fotográfico, overlay/editorial y CTA magenta/claro | Recupera composición y textos aprobados; fotografía única D03, WhatsApp activo |
| About | Foto/presentación y trayectoria | Foto completa y párrafos autorizados; historia documental conservada |
| Servicios/eventos | Tarjetas fotográficas y oferta educativa | Cinco nombres ERV1 en sección D02, cuatro imágenes reales; acreditación pendiente explícita |
| Galería | Carrusel con controles | Carrusel manual, 1/2/3 tarjetas, tres categorías/cuatro fotos; filtros y controles reales |
| Formación | Academia, cursos, talleres, mentoría | Copy/temas/foto aprobados; San Valentín conserva contexto de formación |
| Certificaciones | Sin catálogo individual acreditado | Timeline preparado y vacío honesto; diferencia por dato ausente, no por preferencia visual |
| FAQ | Tres respuestas del preview | Details semánticos condicionales; digital futuro explícito |
| Contacto/Footer | WhatsApp/redes y copy | Cuatro destinos y teléfono aprobados; correo ausente controlado |
| Flotante | Círculo + columna de iconos | Recuperado compacto, tooltips/foco/Escape; click accesible en vez de depender de hover |

## Resultados y método

- Typegen/typecheck, lint y build correctos. **27/27 unitarias, 29/29 E2E**, sin flaky/omitidos. Playwright HTML stats verificadas directamente: total=29, expected=29, unexpected=0, flaky=0, skipped=0, ok=true.
- Nueve anchos: 320/375/390/428/640/768/1024/1280/1440. Menús, anclas, WhatsApp contextual, cinco servicios, imágenes, filtros/Home/End/táctil, FAQ, SEO/headers, reduced-motion y Footer.
- Axe: seis estados (375/1440, cerrado/flotante/FAQ), cero violaciones en reglas WCAG 2 A/AA, 2.1 A/AA y 2.2 AA. Reportes completos en artifacts CI; no certificación WCAG ni ensayo lector de pantalla.
- `lighthouse-baseline-current.json`: baseline con Lighthouse 13.5.0. `lighthouse-final-1/2`: corridas intermedias, preservadas. `lighthouse-optimized-1/2/3` y mediana: tres corridas fijas del hito bd5d6d7; móvil 89/92/91, desktop 100. Configuraciones completas en JSON. El HEAD posterior de copy/FAQ se mide separadamente en CI.
- `ci-code-40bd061.json` verifica success de todas las etapas sobre el código final. `lighthouse-ci-40bd061.json`: Linux/Node 22.19.0, una corrida, Performance 94/100; A/BP 100, SEO 66, LCP 3074.34/666.03 ms, CLS 0, TBT 63/0 ms. No se mezcla esta muestra con la mediana Windows.
- `runtime-production-30e8330.json`: revisión real del deployment público correspondiente al merge externo, no del Preview protegido ni del HEAD final. Event Timing de laboratorio no equivale a INP de campo.
- `external-links.json`: cuatro consultas HTTP, sin enviar mensajes. `dependency-audit-summary.json`: runtime 0, dev 5 altas, 0 críticas; no aceptación del riesgo.

No versionar reportes completos, browser/Node portable, cachés ni URLs con tokens. Los originales y el HTML histórico permanecen intactos. Véase [Release Candidate](../../ReleaseCandidateV1.md) para gates, limitaciones y resultados remotos.
