# Globows LM — Plan maestro de implementación V1.0.0

**Proyecto:** Plataforma Integral para Globows LM by Licey Márquez  
**Documento:** `Docs/Planeacion/PlanDeImplementacion.md`  
**Versión del plan:** 1.4.0 — hardening y QA de candidata 1.0.0-rc.1
**Fecha:** 13 de octubre de 2026  
**Estado:** Plan maestro vigente; el avance comprobado se distingue de trabajo pendiente y condicionado

## 1. Propósito, objetivo y alcance

Dirigir la **implementación real, verificación, despliegue y estabilización** de Globows LM V1.0.0, una Landing Page institucional productiva en Next.js. El plan abarca desde la Foundation actual hasta el release verificable, sin requerir un nuevo ciclo de modelado o prototipado. El preview existente sirve como **referencia visual y funcional**, no como código de producción ni como entregable final.

**Resultado de producto:** sitio público, responsivo, seguro mediante HTTPS, con identidad visual consistente, presentación institucional, catálogo completo de servicios, portafolio por categorías, formación, certificaciones y contacto por WhatsApp y redes. La solución deberá satisfacer los criterios de aceptación de ERV1 y los cambios aprobados mediante el ADR consolidado.

**Fuera de alcance:** backend de negocio, DB, autenticación, panel administrativo, CMS, CRM, agenda interna, cotizaciones automáticas, pagos, suscripciones, cursos virtuales y registro de alumnos. El formulario de contacto continúa siendo opcional según ERV1; no debe introducirse para completar el alcance obligatorio.

**Límites documentales:** ERP (visión y roadmap); ERV1 (requerimientos y aceptación); Brand Discovery (identidad y comunicación); MID (tokens, UX y sistema visual); UIA + ADR consolidado (arquitectura aplicable). Si aparece una discrepancia, no cambiar silenciosamente requisitos: registrar y validar la decisión antes de implementar.

## 2. Línea de base y punto de partida

- Preview público: `https://carlosam03.github.io/globows-preview/`; fuente: `https://github.com/CarlosAM03/globows-preview`.
- Directorio local definitivo: `C:\Users\Carl0\Desktop\Globows\globowslm`.
- Repositorio oficial verificado: `CarlosAM03/Globowslm`. Base: main, merge PR #1, `f74a7bc098363c7d034e0a3a27d6d0a36d42d09c`.
- `Docs/`, `assets/` y `legacy/index.html` se conservan como documentación, fuente original de fotografías y referencia histórica, respectivamente.
- Foundation generada con Next.js **16.4.0**, TypeScript, App Router, Tailwind y npm; dependencias instaladas; `npm run lint` y `npm run build` correctos; `npm run dev` responde HTTP 200.
- Diagnóstico inicial de `ResumenEjecutivoCodex.md`: los puntos sobre `LayoutProps` y raíz Turbopack describían evidencia previa, pero el estado observado al iniciar esta consolidación ya incluía `next typegen`/typecheck satisfactorios y `turbopack.root` configurado. El seguimiento actualizado de hallazgos se registra en §12. Git y remoto verificados; deployment existente https://globowslm.vercel.app responde HTTP 200 y mantiene noindex. No acredita release V1 ni despliegue de esta rama.
- El cliente confirmó expresamente el preview como fuente comercial aprobada para textos, fotografías, teléfono, WhatsApp y Facebook/Instagram/TikTok. Esta autorización sustituye los pendientes genéricos de cortes anteriores. Siguen ausentes únicamente el correo oficial, las credenciales individualizadas y su imagen representativa; el dominio permanente y release/indexación requieren autorización técnica.
- Corte Sprint 4–5: base actualizada al merge PR #2 `78d707c97fbb4d2d1af0ed19d2a6a36e5da23b48`. Durante el QA, PR #3 fue integrado externamente a main como `30e8330152e4183a7a4b275fa45da42da8badf83`; el agente no hizo merge ni despliegue manual. La rama de cierre es `feature/sprints-4-5-release-hardening`.

## 3. Principios de ejecución

1. **Producto antes que documentación adicional:** los entregables de los sprints son código ejecutable, pruebas, evidencias y despliegues; documentar decisiones solo cuando afectan arquitectura, alcance o aceptación.
2. **Cobertura ERV1:** cada obligación funcional tendrá un componente o interacción implementada y una evidencia de prueba.
3. **Diseño existente:** conservar dirección visual del preview y tokens oficiales del MID; no reconstruir pantallas ficticias ni hacer otro preview.
4. **Estático por defecto:** Server Components por defecto; `use client` solo en las islas interactivas; contenido tipado separado de su representación visual.
5. **Calidad continua:** lint, typecheck, build y pruebas desde los primeros sprints; la fase final no es el primer momento en que se pruebe.
6. **Deploy temprano:** Preview en Vercel desde que el repositorio y los permisos estén listos; producción solo con release candidate aprobado.
7. **Sin sobreingeniería:** no crear capas backend, abstracciones CMS ni infraestructura de datos que V1 no utiliza.
8. **Seguridad de contenido:** no publicar información falsa, no validada ni credenciales; no versionar `.env*` secretos, reportes locales o artefactos temporales.

## 4. Stack y organización de trabajo

**Stack comprometido por MID:** Next.js 16.4.0 (versión instalada al inicio), React, TypeScript, Tailwind CSS, shadcn/ui cuando aporte valor, y Motion/Framer Motion para microinteracciones justificadas. Iconos Lucide. Hosting previsto: Vercel con HTTPS y CDN.

**Herramientas adoptadas y ejecutadas:** ESLint + TypeScript, runner nativo Node para unitarias/SSR, Playwright/Chromium para E2E, axe y Lighthouse 13.5.0, GitHub Actions para CI. Node 22.19.0 y npm según engines; no Vitest/Testing Library redundantes ni dependencias sin uso.

**Estructura de destino orientativa:**

```text
Globowslm/ (directorio local: globowslm/)
├── Docs/                          # Especificaciones y ADR existentes
├── assets/                        # Material gráfico de origen
├── legacy/index.html              # Preview local archivado
├── public/images/                 # Fotografías y branding optimizados
├── src/
│   ├── app/                       # layout, page, metadata, sitemap, robots
│   ├── components/
│   │   ├── ui/                    # Componentes compartidos
│   │   ├── layout/                # Navbar, FloatingContactMenu, Footer
│   │   └── sections/              # Secciones reconciliadas de Landing
│   ├── content/                   # Información institucional tipada
│   ├── config/                    # Enlaces públicos y configuración
│   ├── lib/                       # Utilidades realmente utilizadas
│   └── types/                     # Contratos necesarios
├── tests/                         # Pruebas unitarias y E2E según adopción
├── .github/workflows/             # CI
├── AGENTS.md
├── package.json
└── README.md
```

La estructura vacía autorizada para Sprint 0 se crea con un script idempotente y `.gitkeep`; los componentes y módulos reales se incorporan solo cuando un sprint los necesita. `robots.ts` y `sitemap.ts` esperan el dominio confirmado.

## 5. Arquitectura funcional objetivo y cobertura

| Unidad | Contrato de V1 | Fuente principal |
|---|---|---|
| Layout global | Navbar, menú móvil, menú flotante persistente, footer | UIA + ADR, ERV1 |
| Hero | Fotografía real única, propuesta de valor, CTA primario y secundario apropiado | MID + ADR D03 |
| About | Historia, filosofía, trayectoria, identidad y presentación de Licey | ERV1, Brand Discovery |
| ServicesEvents | Catálogo de servicios + ocasiones de decoración; nombre, descripción, fotografía y CTA de cada servicio | ERV1 + ADR D02 |
| Gallery | Trabajos decorativos por categorías, sin mezcla con certificaciones/cursos | ERV1 + ADR D05 |
| Courses | Cursos, talleres, asesorías y formación con evidencia fotográfica e información de contacto | ERV1 + ADR D05 |
| Certifications | Credenciales verificadas, organismos y evidencias reales; timeline horizontal obligatorio y adaptable | ERV1, UIA §13 |
| TrustSupport | Testimonios y/o FAQ **solo si se dispone de material validado**; sección condicional | ADR D04/D09 |
| Contact | Contacto final y CTA; WhatsApp contextual por tipo de interés | ERV1 + ADR D06 |
| FloatingContactMenu | WhatsApp, Facebook, Instagram, TikTok y correo | ERV1 + ADR D07 |
| No funcionales | Responsive, rendimiento, SEO básico, accesibilidad, optimización y estabilidad en Vercel | ERV1, MID |

La estructura conceptual tiene ocho posiciones; la unidad `TrustSupport` puede omitirse en la publicación si su contenido no ha sido validado. No inventar testimonios, preguntas o certificaciones para completar secciones. La cobertura requisito por requisito, su prueba y su estado se mantienen en [MatrizTrazabilidadV1.md](MatrizTrazabilidadV1.md).

## 6. Estrategia de ramas, cambios y entregables

**Propuesta operativa sujeta a confirmación:** `main` como rama de producción y `feature/<tema>` para cambios cortos; una rama `dev` puede añadirse si el equipo necesita integración prolongada. PR y CI preceden al merge; Preview Deployment de Vercel se verifica en rama/PR y no equivale a aprobación de producción. La protección de ramas depende de permisos del futuro repositorio.

Cada trabajo funcional deberá cerrar con: (a) código en repositorio; (b) `lint`, typecheck y build; (c) pruebas proporcionadas al riesgo; (d) verificación visual mobile/desktop; (e) evidencia o captura de Preview; (f) actualización de estado del sprint. No se aceptan capturas del viejo preview como evidencia del nuevo código.

## 7. Plan por sprints

### Sprint 0 — Foundation, seguridad base y primer repositorio

**Objetivo:** convertir el directorio existente en un proyecto Next.js reproducible con control de versiones, verificaciones y primer despliegue Preview, sin afectar documentación y assets históricos.

**Dependencias:** directorio Foundation existente, documentación aprobada, Node/npm compatibles; creación de GitHub y Vercel requieren permisos del responsable.

**Alcance funcional:** base técnica y control documental; no se implementan secciones comerciales.

**Trabajos:**
1. Confirmar que los archivos Next.js están en `globowslm/` y que `Docs/`, `assets/`, `legacy/` y `README.md` no fueron sobrescritos.
2. Conservar la instalación reproducible con `npm ci` y lockfile; usar identidad `globowslm-v1`, versión prerelease y contrato Node/npm sincronizados.
3. Establecer script `typecheck` reproducible que ejecute `next typegen` antes de TypeScript; conservar `LayoutProps` ya válido.
4. Confirmar `turbopack.root`, Cache Components y Partial Prefetching contra las guías locales de Next.js 16; no modificar configuraciones correctas.
5. Clasificar `npm audit`: producción sin hallazgos reportados; cadena de desarrollo con cinco hallazgos altos. Evaluar actualización compatible; no usar `audit fix --force` a ciegas; registrar decisión si persisten.
6. Revisar `.gitignore`: excluir `.next/`, `node_modules/`, `*.tsbuildinfo`, `audit-report.json`, salidas E2E, cobertura y secretos; conservar documentos y assets deliberadamente.
7. Actualizar README de preview a README de aplicación Next.js; indicar fuentes, comandos, alcance y uso del directorio.
8. Conservar/adaptar `AGENTS.md` para instrucciones específicas, sin borrar el bloque regenerado por Next.js 16.
9. Verificar con la propietaria qué fotografías, fichas de servicios, credenciales, textos, datos de contacto y permisos comerciales faltan; registrar bloqueos sin inventar contenido.
10. Crear la estructura vacía autorizada con script PowerShell idempotente; preparar GitHub Actions con checkout, Node, `npm ci`, typegen/typecheck, ESLint y build, sin secretos.
11. Inicializar Git **solo en `globowslm/`**. Revisar el repositorio oficial `CarlosAM03/Globowslm`, primer commit y push, después de revisar `git status` y tamaño de los archivos.
12. Configurar Vercel a partir del nuevo repositorio, con Preview conectado a PRs/ramas; comprobar URL y build de la Foundation.

**Componentes/archivos afectados:** `package.json`, lockfile, `README.md`, `.gitignore`, `src/app/globals.css`, `scripts/Initialize-ProjectStructure.ps1`, `.github/workflows/`, documentación de riesgo y matriz; `next.config.ts` solo si aparece defecto demostrado.

**Pruebas requeridas:** script dos veces e integridad de `assets/`/`legacy/`/`AGENTS.md`; `npm ci`, `npm run typegen`, `npm run typecheck`, `npm run lint`, `npm run build`; revisión de exclusiones y auditoría de dependencias. Remotamente: ejecución real de CI y Preview cuando existan.

**Entregables:** proyecto Next.js reproducible; README y estructura; registro de riesgo con aceptación pendiente; workflow CI preparado; después de autorización separada, historial Git, repo remoto y primer Preview de Foundation.

**Criterios de aceptación:** instalación y chequeos locales reproducibles; contenido sensible excluido; CI ejecutado satisfactoriamente en GitHub cuando se cree el repositorio; Preview de Foundation accesible cuando Vercel se conecte. El estado limpio de Git se evalúa solo tras el primer commit autorizado.

**Riesgos y bloqueos:** cadena npm alta en herramientas de desarrollo sin parche compatible verificado; aprobación comercial pendiente; permisos para GitHub/Vercel; dominio final desconocido.

**Definition of Done:** evidencia local reproducible + CI y Preview reales + primer commit y remoto revisados, sin secretos ni decisiones de seguridad aceptadas tácitamente.

**Estado real:** Foundation integrada mediante PR #1; fuentes locales y validaciones reproducibles correctas. Repositorio/deployment existentes comprobados. Aprobación del preview vigente; riesgo dev aún no aceptado y datos específicamente ausentes registrados en §13. Historia conservada en §12.

### Sprint 1 — Design System ejecutable, Layout, Hero y About

**Objetivo:** reemplazar la pantalla estándar de Next.js por la identidad real de Globows LM y establecer el esqueleto navegable.

**Dependencias:** Foundation local reproducible, tokens MID y selección comercial de fotografía Hero/portrait/copy/número WhatsApp. Preview temprano facilita revisión, pero no autoriza contenido no validado.

**Alcance funcional:** posiciones 1–2, Layout global inicial y helper transversal de WhatsApp.

**Trabajos:**
1. Implementar tokens MID: `#B3006D`, `#F7B7D8`, `#FADAE9`, `#D4AF37`, neutrales, espaciados, radios, tamaños y tipografías Manrope/Cormorant Garamond con `next/font`.
2. Construir componentes UI compartidos necesarios: Button/Link, SectionContainer, SectionTitle y Logo; integrar shadcn/ui solo donde ayude.
3. Implementar `Navbar`, navegación con anclas y `MobileMenu` accesible (foco, cierre con Escape, etiquetas, navegación con teclado).
4. Implementar `HeroSection` con **una fotografía** de alto impacto, overlay legible, copy validado, CTA WhatsApp/portafolio e indicador de scroll si aporta valor.
5. Implementar `AboutSection` con fotografía real, historia, presentación, trayectoria y filosofía sin inventar contenido.
6. Crear una fuente tipada de contenido estático para textos y URLs que permita futuras sustituciones sin acoplarlas a la composición; no crear CMS simulado.
7. Aplicar estructura semántica, responsive y optimización de fotografía desde el primer componente.
8. Implementar helper de WhatsApp con número validado y `encodeURIComponent`, mensajes por intención; probarlo antes de conectar los CTA de sprints 2–3.
9. Establecer `lang="es"`, título y descripción iniciales aprobados en metadata; reservar canonical, `robots.ts` y `sitemap.ts` hasta confirmar dominio.

**Componentes/archivos afectados:** `src/app/layout.tsx`, `page.tsx`, `globals.css`, `src/components/ui/`, `layout/`, `sections/hero/`, `sections/about/`, `src/content/`, `src/config/`, `src/lib/` y `public/images/` validadas.

**Pruebas requeridas:** helper WhatsApp (codificación y mensajes), navegación/teclado, contraste y `prefers-reduced-motion`, responsive móvil/tablet/escritorio, enlaces, lint/typecheck/build/CI y revisión visual en Preview.

**Entregables:** pantalla inicial real; navegación funcional; identidad MID incorporada; About implementado; componentes base reutilizables.

**Criterios de salida:** no se visualiza la plantilla Next; no desbordamientos en 320–390 px ni escritorio; Hero usa fotografía única; CTA funciona; navegación con teclado; título y contenido institucional aprobado; build y CI sin fallos.

**Riesgos y bloqueos:** fotografía/copy/número ya aprobados e integrados; vigilar LCP móvil. El Preview protegido requiere sesión autorizada para QA remoto de esa URL.

**Definition of Done:** Hero y About aprobados comercialmente, navegación y CTA verificados con teclado y móvil, metadata/idioma correctos, evidencias de Preview y CI verde.

**Estado real:** Implementación y contenido aprobado recuperados. Hero fotográfico con overlay, About editorial y trayectoria del preview, tokens y fuentes locales conservados; ocho destinos reales incluyendo FAQ condicional. WhatsApp contextual activo. QA local correcto; la verificación navegable del Preview protegido requiere acceso del responsable, no sustituye las evidencias locales.

### Sprint 2 — Servicios, Eventos y Galería

**Objetivo:** hacer visible la oferta comercial y exhibir evidencias del trabajo realizado.

**Dependencias:** UI base y helper de Sprint 1; fichas de cinco servicios, derechos de fotos y taxonomía de decoraciones aprobados.

**Alcance funcional:** posición 3 integrada y posición 4 de la arquitectura vigente.

**Trabajos:**
1. Implementar `ServicesEventsSection` respetando la integración aprobada; diferenciar servicio contratado de tipo de evento.
2. Garantizar representación de los cinco servicios mínimos de ERV1: decoraciones, cursos, talleres, certificaciones y asesorías (pueden enlazar a formación cuando corresponda).
3. Cada entrada de servicio contará con nombre, descripción, fotografía y CTA contextual, verificando coherencia de contenido.
4. Implementar `GallerySection` exclusivamente con decoraciones; definir categorías según recursos reales (sin categorías ficticias).
5. Utilizar `next/image` con `sizes`, dimensiones o fill correctamente definido, textos alternativos y carga diferida en imágenes no críticas.
6. Agregar interacción de filtros, carrusel o lightbox solo cuando su valor UX esté justificado; componentes client aislados; permitir teclado y control táctil.
7. Validar responsive, navegación a las secciones y enlaces hacia WhatsApp por contexto.

**Componentes/archivos afectados:** `src/components/sections/services-events/`, `gallery/`, `src/content/`, `public/images/services/`, `public/images/gallery/`; client islands solo si hay filtros u otra interacción necesaria.

**Pruebas requeridas:** cinco fichas × cuatro campos ERV1, asociación categoría-foto, CTA contextual, alt, teclado si existe filtro, responsive, carga de imágenes, lint/typecheck/build/CI y Preview.

**Entregables:** servicios y ocasiones funcionales; galería por categorías; dataset de imágenes reales; evidencia visual mobile/desktop.

**Criterios de salida:** cinco servicios rastreables, cada uno con cuatro elementos ERV1; categorías funcionales sin resultados mezclados; CTAs operativos; sin imágenes rotas; imágenes optimizadas y sin errores críticos de interacción.

**Riesgos y bloqueos:** falta la imagen representativa de acreditación; las demás fotos/categorías están aprobadas. Mantener filtros y un único carrusel manual, sin mecanismos redundantes.

**Definition of Done:** catálogo y galería aprobados, pruebas de categorías/CTA y accesibilidad exitosas, evidencia móvil/escritorio y CI verde.

**Estado real:** Catálogo de cinco servicios y CTA activos; cuatro imágenes representativas aprobadas y una dependencia concreta: imagen de acreditación para el servicio certificaciones. Galería: cuatro fotografías, tres categorías, carrusel manual 1/2/3 tarjetas por viewport, filtros y teclado/táctil probados. No se declara cumplido el criterio de cinco imágenes ni el cierre funcional íntegro de ERV1.

### Sprint 3 — Formación, Certificaciones y Conversión

**Objetivo:** completar la segunda línea de negocio y las salidas comerciales obligatorias.

**Dependencias:** UI y helper Sprint 1; datos de formación, acreditaciones y cinco canales oficiales validados; base de servicios Sprint 2 para revisar CTA cruzados.

**Alcance funcional:** posiciones 5–8, incluida posición 7 solo cuando exista material verificado; completar Layout global.

**Trabajos:**
1. Implementar `CoursesSection` con cursos, talleres, asesorías y evidencias de actividades formativas validadas.
2. Implementar `CertificationsSection` con organismos, credenciales y evidencias reales y **timeline horizontal obligatorio** (UIA §13), adaptable a móvil sin desborde indebido.
3. Implementar `FloatingContactMenu` persistente con WhatsApp, Facebook, Instagram, TikTok y correo; manejar foco, escape, tamaño táctil y superposición.
4. Implementar `ContactSection` y Footer con todos los datos oficiales verificados.
5. Integrar y ampliar, si hace falta, el helper de WhatsApp creado en Sprint 1 para decoraciones, cursos, talleres, certificaciones, asesorías y contacto general; verificar cada destino y texto.
6. Implementar `TrustSupportSection` de forma condicional: publicar testimonios/FAQ únicamente con información validada; omitirla si no existe.
7. Evaluar que cada CTA externo tenga destino verificable y comunicar que abre servicio externo cuando sea pertinente.

**Componentes/archivos afectados:** `src/components/sections/courses/`, `certifications/`, `trust-support/` (solo si procede), `contact/`, `src/components/layout/FloatingContactMenu` y `Footer`, `src/content/`, `src/config/`, `public/images/courses/` y `certifications/`.

**Pruebas requeridas:** timeline horizontal responsive y por teclado, cinco canales del menú, persistencia durante scroll, CTA WhatsApp por contexto, enlaces externos/correo, validez comercial de credenciales, lint/typecheck/build/CI y Preview.

**Entregables:** Landing funcionalmente completa según contenido aprobado; menú flotante; mensajes WhatsApp contextuales; enlaces de redes y correo.

**Criterios de salida:** todos los canales ERV1 accesibles; CTAs correctamente parametrizados y probados; acreditaciones verificadas; cero contenido inventado; cobertura íntegra de secciones obligatorias; código compila y pruebas principales pasan.

**Riesgos y bloqueos:** ausencia de diplomas/evidencia de certificación, datos oficiales incompletos, superposición del menú flotante en móviles; TrustSupport puede omitirse sin afectar aceptación.

**Definition of Done:** secciones obligatorias y canales aceptados, timeline horizontal comprobado, contenido acreditado, pruebas de conversión y accesibilidad aprobadas, CI verde.

**Estado real:** Formación y FAQ del preview aprobadas y publicadas; timeline horizontal preparado sin entradas inventadas. Contacto, Footer y menú flotante compacto comparten cuatro canales activos y teléfono aprobado. Solo correo y catálogo individual de acreditaciones permanecen ausentes. Pruebas con fixtures y estado vacío; no se declara aceptación de credenciales inexistentes.

### Sprint 4 — Hardening transversal, SEO, accesibilidad y rendimiento

**Objetivo:** transformar la Landing completa en un Release Candidate técnicamente apto para preproducción.

**Dependencias:** secciones obligatorias de sprints 1–3 y métricas de referencia, contenido y dominio final para canonical/sitemap.

**Alcance funcional:** consolidación transversal; no incorpora nuevas funciones de negocio.

**Trabajos:**
1. Revisión responsive real en mobile/tablet/desktop, incluyendo 320, 375, 390, 428, 768, 1024, 1280 y 1440 px como referencias del MID.
2. Revisión WCAG AA aplicable: contraste, jerarquía de encabezados, nombre accesible, foco visible, teclado, zonas táctiles ≥44 px, alt y reducción de movimiento.
3. SEO: metadata, títulos/descripciones verificadas, canonical del dominio definitivo, Open Graph, favicon/logo aprobados, `robots.ts`, `sitemap.ts` y semántica estructurada.
4. Optimización de LCP y CLS: Hero prioritario cuando proceda; lazy loading bajo el fold; dimensiones estables; formatos WebP/AVIF adecuados; fuentes con `next/font`.
5. Revisar paquete JS y límites Server/Client Components; eliminar dependencias y estilos sin uso; evitar Tailwind CDN del preview.
6. Revisar encabezados de seguridad adecuados a sitio estático, enlaces externos, exposición de datos de configuración y ausencia de secretos.
7. Preparar pruebas automatizadas de los flujos críticos y checklist de Design QA contra preview/MID/ADR.
8. Ejecutar Lighthouse móvil/escritorio con condiciones repetibles; registrar mediciones y defectos, sin inventar puntuaciones.

**Componentes/archivos afectados:** `src/app/layout.tsx`, `src/app/robots.ts`, `sitemap.ts` solo con dominio confirmado, estilos/componentes existentes, pruebas en `tests/`, configuración de headers únicamente si la evaluación lo exige.

**Pruebas requeridas:** matriz ERV1, teclado/lector y movimiento reducido, contraste, Lighthouse repetible, rutas y enlaces, SEO crawl, tamaño de recursos, lint/typecheck/build/CI y Preview.

**Entregables:** Release Candidate preliminar; resultados de auditoría técnica; lista priorizada de defectos y correcciones; SEO básico y accesibilidad validados.

**Criterios de salida:** sin defectos bloqueantes; comprobación de navegación y conversión; build/lint/typecheck; no desbordamientos ni enlaces rotos; metas Lighthouse propuestas (Performance, Accessibility y SEO ≥90 bajo condiciones documentadas) sujetas a validación como objetivos, no garantías.

**Riesgos y bloqueos:** dominio o metadatos comerciales pendientes, fotos pesadas, métricas variables por entorno; el umbral Lighthouse propuesto requiere ratificación y no sustituye requisitos ERV1.

**Definition of Done:** defectos bloqueantes cerrados, criterios técnicos medidos con condiciones registradas, aceptación de accesibilidad/SEO/performance y RC preliminar reproducible.

**Estado real:** Hardening y QA ejecutados: tipos, lint, build, 27 unitarias y 29 E2E; axe sin violaciones en seis estados móvil/escritorio, nueve anchuras y capturas comparables. Lighthouse 13.5.0: tres corridas optimizadas, mediana Performance 91 móvil/100 desktop, Accessibility/Best Practices 100, SEO 66 por noindex deliberado. LCP móvil mediano 3.21 s: oportunidad de mejora registrada. Metadata, headers y rastreo controlado preparados. No equivale a certificación WCAG completa, medición INP de campo ni aprobación de release.

### Sprint 5 — QA final, release y producción V1.0.0

**Objetivo:** liberar una V1.0.0 pública verificable, no un preview adicional.

**Dependencias:** RC de Sprint 4, CI inicial ya operativo desde Sprint 0, contenido y assets aprobados, dominio y permisos Vercel, decisión explícita sobre riesgo npm pendiente.

**Alcance funcional:** aceptación integral, publicación y verificación productiva; sin ampliar ERV1.

**Trabajos:**
1. Endurecer el CI inicial de Sprint 0 con las pruebas automatizadas ya implementadas, permisos y política de merges; no postergar los controles base hasta el release.
2. Ejecutar pruebas E2E Playwright: navegación interna, filtro de galería si existe, CTA WhatsApp contextual, menú flotante, redes, correo y comportamiento responsive relevante.
3. QA funcional contra la matriz ERV1; comparación visual con preview y MID, considerando divergencias autorizadas por ADR.
4. Ejecutar pruebas de aceptación con contenido final y checklist manual de accesibilidad, enlaces, rendimiento y SEO.
5. Preparar release: revisión de dependencias, auditoría npm, contenido aprobado, dominio y entorno de producción, cambios registrados y plan de rollback.
6. **Solo después de autorización formal de release, fuera de esta ejecución:** integrar el Release Candidate en rama productiva; desplegar mediante Vercel; verificar HTTPS, ruta principal, imágenes, metadata, enlaces y acceso desde redes móviles/escritorio.
7. **Solo después de autorización formal, fuera de esta ejecución:** crear release/tag `v1.0.0` y documentar alcance, limitaciones, pruebas, incidencias conocidas no bloqueantes y procedimiento de rollback.
8. **Solo si se autoriza y sin activar analítica en esta ejecución:** configurar observabilidad pertinente (por ejemplo, Web Analytics/Speed Insights si se aprueban) y verificar recolección sin afirmar estadísticas no observadas.

**Componentes/archivos afectados:** workflow CI, pruebas E2E, matriz de aceptación, configuración Vercel/dominio, metadata y documentos de release; cambios de código solo por defectos encontrados.

**Pruebas requeridas:** E2E de flujos críticos, aceptación comercial/arquitectónica, regresión mobile/tablet/desktop, accesibilidad, SEO y rendimiento finales, auditoría de dependencias, smoke test HTTPS y rollback ensayado.

**Entregables:** CI/CD funcional, evidencias QA, informe de aceptación, URL real en producción, release/tag `v1.0.0`, README de operación y checklist post-release.

**Criterios de salida:** cumplimiento de los criterios ERV1; todos los enlaces y acciones críticas verificados; sitio móvil/escritorio funcional; producción HTTPS estable; pruebas y pipeline verdes; sin vulnerabilidades críticas/altas de producción conocidas sin resolución; aprobación formal del release.

**Riesgos y bloqueos:** correo y acreditaciones concretos ausentes; riesgo dev sin aceptación; dominio/indexación/release pendientes; acceso protegido al Preview. No reabrir aprobación de textos, fotos, teléfono o redes ya confirmados.

**Definition of Done:** aprobación comercial y técnica registrada; matriz obligatoria aceptada; CI/E2E verdes; release tag y producción HTTPS con smoke test, monitoreo mínimo y plan de reversión.

**Estado real:** QA técnico, CI remoto y candidata 1.0.0-rc.1 preparados. CI de 8e577e8, bd5d6d7 y código final 40bd061 verificado exitoso. Deployment público del merge externo 30e8330 revisado realmente a 375/1440 px; Preview de rama protegido por login Vercel, sin afirmar QA de aplicación tras el login. Draft PR #4 creado para el cierre posterior al merge externo. Release oficial, tag final, indexación y aceptación del riesgo no ejecutados ni autorizados. Puerta de salida pendiente de datos obligatorios específicos y autorizaciones; consultar ReleaseCandidateV1.md.

### Sprint 6 — Estabilización post-release y transición hacia ERV2

**Objetivo:** estabilizar el producto liberado mediante evidencia real sin incorporar funcionalidades V2 al alcance V1.

**Dependencias:** V1.0.0 publicada y monitoreo/registro de incidencias disponible.

**Alcance funcional:** operación, corrección de defectos V1 y registro separado de oportunidades ERV2; sin implementación V2.

**Trabajos:**
1. Monitorear errores, disponibilidad y rendimiento; recibir y priorizar incidencias del uso real.
2. Ejecutar evaluación heurística; sesiones de pruebas con usuarios de decoración y formación, registrando tiempo por tarea, éxito, errores, intentos y satisfacción cuando se disponga de participantes.
3. Resolver defectos y ajustes de contenido/visual permitidos; publicar versiones parche `v1.0.x` con regression testing.
4. Consolidar backlog de oportunidades de mejora a partir de datos observados; no presentar como hechos comportamientos inferidos.
5. Diseñar ERV2 de manera paralela **solo una vez publicada V1.0.0** y estabilizados los riesgos críticos; ERV2 no altera retrospectivamente la definición de completitud V1.

**Componentes/archivos afectados:** código y pruebas afectados por defectos reales, registro de incidencias y eventual documento ERV2 separado; no se crean módulos futuros por anticipación.

**Pruebas requeridas:** regresión para cada parche, verificación de producción, accesibilidad y métricas de estabilidad en condiciones observables; pruebas de usuario solo con participantes disponibles.

**Entregables:** registro de incidencias, evidencias de evaluación, parches, informe de estabilización y backlog de ERV2 separado.

**Criterios de salida:** defectos críticos cerrados o mitigados, funcionamiento sostenido validado y transferencia a mantenimiento. La estabilidad se observa durante un periodo acordado; no se declara automáticamente al desplegar.

**Riesgos y bloqueos:** falta de datos/participantes, incidentes externos, confundir mejoras V2 con defectos V1.

**Definition of Done:** periodo de estabilización acordado completado, incidentes críticos resueltos/mitigados con evidencia, parches probados y backlog ERV2 separado.

**Estado real:** pendiente y condicionado a publicación de V1.

## 8. Dependencias entre sprints y paralelización

- Sprint 0 habilita Git, build y Vercel; el preview en la nube no debe esperar al Sprint 5.
- Sprint 1 establece Layout y patrones visuales utilizados por sprints 2 y 3.
- Los sprints 2 y 3 pueden solaparse parcialmente si las bases UI y fuentes de contenido están estables, pero ambos deben completar cobertura antes de Sprint 4.
- SEO básico, accesibilidad, pruebas y responsive se aplican **continuamente**; Sprint 4 consolida y endurece, no inicia estas prácticas.
- Sprint 5 exige Release Candidate aprobado; Sprint 6 comienza después del release, sin ampliar funcionalidad.

## 9. Matriz de pruebas y evidencia mínima

| ID de prueba | Escenario | Evidencia / condición |
|---|---|---|
| AT-01 | Entrar a Landing y entender marca | Hero/identidad visible; sin error de consola crítico |
| AT-02 | Conocer trayectoria de Licey | About y certificaciones accesibles |
| AT-03 | Identificar cinco servicios | Nombre, descripción, imagen y contacto disponibles por cada servicio |
| AT-04 | Explorar galería por categorías | Selección y fotografías correspondientes correctas |
| AT-05 | Conocer cursos y talleres | Información real accesible y CTA relevante |
| AT-06 | Abrir WhatsApp desde servicio | URL y texto prellenado adecuados |
| AT-07 | Abrir menú flotante | Cinco canales incluyendo correo; controles accesibles |
| AT-08 | Navegar vía teclado | Focus visible y ausencia de trampas |
| AT-09 | Navegación mobile y desktop | Sin superposición ni desbordamientos |
| AT-10 | Respetar contenido validado | Sin testimonios, acreditaciones o enlaces inventados |
| AT-11 | Metadata y SEO | Title, description, OG, sitemap/robots acordes al dominio |
| AT-12 | Pipeline y producción | CI verde, build reproducible, HTTPS y URL pública comprobada |

## 10. Control de riesgos

| Riesgo | Tratamiento |
|---|---|
| Falta de fotografías/textos/certificaciones oficiales | Inventariar y solicitar; no publicar información provisional engañosa; mantener marcado pendiente por sección |
| Variaciones preview vs MID/ADR | MID + ADR prevalecen en su ámbito; registrar comparación y diferencia aceptada |
| Peso fotográfico elevado | Optimizar imágenes, dimensiones, lazy load y medición LCP desde Sprint 1 |
| Dependencias npm inseguras | Auditoría, remediación compatible y evaluación de riesgo explícita; no aplicar `--force` sin review |
| Nuevo Next.js 16 y API cambiante | Consultar `node_modules/next/dist/docs/` y `AGENTS.md` generados; verificar typegen/build |
| Publicación prematura | Release Candidate y puerta QA antes de rama productiva |
| Falta de información oficial | Validación con propietaria, sin datos ficticios |
| Alcance V2 invade V1 | Backlog separado y freeze de alcance ERV1 |
| Cronograma académico ajustado | Priorizar obligaciones ERV1 y producto; usar evidencias del desarrollo para la materia |

## 11. Definición de terminado (Definition of Done)

Una tarea solo se considera terminada cuando satisface su contrato funcional, cumple el sistema visual, mantiene accesibilidad y responsive relevantes, supera las verificaciones de proyecto y tiene evidencia de funcionamiento. Un sprint termina con sus criterios de salida verificados; no con una lista de archivos creados.

**La V1.0.0 se libera cuando:** todos los apartados obligatorios de ERV1 están implementados; el sitio funciona en móvil y escritorio; fotografías optimizadas y reales; enlaces y WhatsApp correctos; navegación fluida; despliegue estable en Vercel; la marca se representa profesionalmente; pipeline y pruebas críticas aprobados; no existen incidencias bloqueantes conocidas.

## 12. Estado de ejecución y evidencias

**Registro histórico de consolidación previo a Sprints 1–2 (conservado):** documentación y trazabilidad reconciliadas; `package.json`/lockfile usan `globowslm-v1@1.0.0-alpha.0` y contrato Node/npm; README y exclusiones actualizados; estructura vacía creada dos veces con idempotencia; CI **preparado pero aún no ejecutado remotamente**. `next.config.ts`, `tsconfig.json` y el bloque Next.js de `AGENTS.md` se conservaron. `npm ci` terminó satisfactoriamente tras aislar un `node_modules` anterior bloqueado por Windows; `npm run typegen`, `npm run typecheck` y `npm run lint` pasaron. `npm audit --omit=dev` informó cero vulnerabilidades y el reporte completo cinco altas de la misma cadena dev, pendientes de decisión en [RegistroRiesgoDependencias.md](RegistroRiesgoDependencias.md).

En aquella consolidación, el build **no estaba verificado como satisfactorio**: desde `.next` limpio falla al descargar las fuentes Geist/Geist Mono del layout template por falta de conexión a Google Fonts en este entorno; intentos con caché parcial mostraron además un fallo transitorio de proceso de Turbopack. El build exitoso anterior al cambio es evidencia histórica del desarrollador, no validación posterior a este hardening. Las fuentes oficiales Manrope/Cormorant se incorporan en Sprint 1 con insumos aprobados. El árbol anterior de dependencias quedó preservado como `.node_modules-recovery/` e ignorado por Git; su limpieza no forma parte del primer commit.

**Pendientes registrados entonces (véase actualización siguiente):** validar build exitoso desde checkout limpio en un entorno con acceso a fuentes o resolver su abastecimiento oficial; ejecutar CI real; revisar y autorizar primer commit/remoto; conectar y comprobar Preview de Vercel; decidir tratamiento del riesgo dev. Ninguna de estas operaciones remotas está acreditada por el workflow local. Obtener los datos comerciales faltantes avanza en paralelo y bloquea secciones/release, no obliga a rehacer UX/UI.

### Actualización operativa — ejecución autónoma de Sprints 1–2, 13/10/2026

- Base verificada: `main`/remoto en `2eaf8a01c2df5fc23b835d4367f370ef566e42ca`, working tree limpio al inicio. CI del primer commit comprobado por API pública: [run 38398984730](https://github.com/CarlosAM03/Globowslm/actions/runs/38398984730), resultado **success**. El conector de runs filtra eventos PR y por eso inicialmente devolvió una lista vacía; esa respuesta no demostraba ausencia de CI de push.
- Rama: `feature/sprints-1-2-landing-core`, publicada en el repositorio oficial. Hitos: `8589f63` prerrequisitos; `06b525d` Design System; `77e91f4` Layout/Hero/About; `3c22d0b` servicios/eventos; `26c8b89` galería; `7b119a6` pruebas/CI. No merge, tag, release ni despliegue productivo.
- Reproducibilidad: `npm ci` pasó tras preservar la instalación generada bloqueada por Windows en `.node_modules-recovery/`, ignorada. Manrope y Cormorant Garamond WOFF2 oficiales se incorporaron con licencia OFL, procedencia y SHA-256 en `src/styles/fonts/README.md`; el build no descarga fuentes. Lucide se usa realmente; Playwright y sharp son dev. No se añadieron shadcn/Motion sin necesidad.
- Validación local posterior: typegen/typecheck y ESLint **exit 0**; build Turbopack **exit 0**, rutas `/` y `/_not-found` prerenderizadas. Cache Components, Partial Prefetching y configuración Turbopack preservados. Un intento encontró fallo de inicio del proceso CSS de Turbopack; preservar `.next/build` y caché Turbopack fallidos y regenerarlos permitió build satisfactorio sin desactivar controles. No equivale a un defecto comercial ni se silenció TypeScript.
- Pruebas: `npm test` **9/9**; `npm run test:e2e` **14/14** sobre build productivo y Chromium. Casos reales: anclas, semántica/idioma/fuentes locales, menú con teclado/Escape/foco/cierre, cinco fichas y estados pendientes, filtros por categoría, skip link y movimiento reducido. Siete anchos: 320, 375, 390, 428, 768, 1024 y 1440 px; carga de imágenes y controles ≥44 px, sin desbordamiento horizontal. Una prueba inicial falló por reutilizar un selector cuyo nombre cambia al abrir menú; se corrigió el selector y se repitió con éxito.
- Evidencia visual real: capturas de siete anchos inspeccionadas y capturas específicas de foco del menú a 320 px y filtro móvil. `test-results/` y `playwright-report/` son locales e ignorados; GitHub Actions publica artifacts con esas evidencias. El cierre de los servidores de prueba de Windows requirió detener únicamente los PIDs creados por las pruebas después de completar los casos; el servidor dev preexistente no se detuvo. No se declara Lighthouse, lector de pantalla ni QA WCAG integral ejecutados.
- Assets: cinco WebP derivados sin recortes, nombres normalizados y `next/image`; repetición de `assets:prepare` preserva originales. Hero 852×856/103418 bytes; About 1200×1200/243388; Baby Shower 472×411/28252; XV 825×555/88364; temática 827×531/74970. `legacy/index.html`, originales, AGENTS y fuentes oficiales ERP/ERV1/MID/UIA/ADR sin diff contra main. Foto promocional About conserva logos/textos; retrato y aprobación siguen pendientes.
- Galería: categorías respaldadas por contenido visible, sin afirmar cliente/fecha o evento completado no documentado. `CursoSanValentin.png` se reserva para eventual evidencia formativa de Sprint 3; `8marzo.png` con personas no se incorpora sin contexto/permiso. No se crearon categorías sin material ni carrusel/lightbox ornamental.
- Seguridad actual: `npm audit --omit=dev` **0**; auditoría completa **5 altas**, la misma cadena dev `braces`. Sin hallazgos nuevos reportados al añadir dependencias. La excepción sigue **NO aceptada**; no se ejecutó audit fix ni migración mayor. Lockfile y CI con permisos mínimos/sin secretos en PRs.
- CI: el [run 38405047745](https://github.com/CarlosAM03/Globowslm/actions/runs/38405047745) de la rama terminó **success**: checkout limpio, npm ci, tipos, lint, 9 unitarias, build, instalación Chromium y 14 E2E; evidencia de navegador publicada como artifact. Esta ejecución acredita reproducibilidad desde checkout limpio en Ubuntu/Node 22.16; no implica que el caché npm del runner estuviera vacío. El commit documental 94db3d8 también tiene [CI push exitoso](https://github.com/CarlosAM03/Globowslm/actions/runs/38405564596). [Draft PR #1](https://github.com/CarlosAM03/Globowslm/pull/1) creado contra main; los commits posteriores verifican su propio CI.

**Pendientes comerciales que impiden cerrar aceptación de Sprints 1–2:** número oficial y aprobación de mensajes; fotografías de cursos/talleres/certificaciones/asesorías; aprobación de copy Hero/About/fichas, uso del montaje promocional About y tres fotos/taxonomía de galería. Hero navega a servicios/galería, no a un destinatario ficticio; cinco CTA están preparados pero deshabilitados con explicación. No se declara satisfacción de las cinco fichas × cuatro campos comerciales.

**Preparación para Sprint 3:** bases UI y helper disponibles. Implementar únicamente en una ejecución posterior: formación real, credenciales verificadas/timeline horizontal, contacto/footer completo y menú flotante de cinco canales. Obtener catálogo formativo, diplomas/organismos y canales autorizados. TrustSupport continúa condicional. Vercel Preview, dominio y autorización del riesgo dev siguen pendientes; la V1 no está liberada.

### Actualización operativa — integración visual y Sprint 3, 13/10/2026

Supersede los estados operativos anteriores conservados como historia. Rama feature/sprints-2-3-visual-integration creada desde main actualizado al merge PR #1. Existía una modificación ajena en la auditoría de consistencia documental: se preserva sin incluirla en estos commits. ERP, ERV1, MID, UIA, ADR D01–D09, AGENTS, legacy y originales permanecen intactos.

#### Matriz de paridad visual

Render real del HTML local y build productivo Next.js a 375×812, 768×1024 y 1440×900. Capturas comparables en Evidencias/Sprints2-3/; script scripts/capture-visual-reference.mjs y capturas completas/por sección en .visual-evidence/ (ignorado). Baseline corresponde al merge PR #1.

| Área | Preview / baseline | Resultado y clasificación |
|---|---|---|
| Navbar | Sticky editorial / cuatro destinos | Sticky translúcido, siete destinos y menú móvil. Diferencia por alcance; logo independiente apto pendiente |
| Hero | Fotografía dominante / dos columnas | Corregido a fondo único con overlay, jerarquía editorial y dos CTA. Paridad compositiva con tokens/copy oficiales |
| About | Nombre protagonista e imagen/texto / jerarquía reducida | Título en columna editorial, nombre de gran jerarquía y foto íntegra; paridad razonable |
| Servicios | Tarjetas fotográficas | Cinco tarjetas armonizadas, cabecera centrada; cuatro imágenes pendientes impiden paridad fotográfica completa |
| Eventos | Bloque separado | Ocasiones diferenciadas dentro de ServicesEvents por D02; diferencia intencional |
| Galería | Carrusel | Grid editorial con proporciones reales y filtro categorizado D05; sin exploración redundante |
| Formación | Oscuro, foto y CTA / ausente | CoursesSection oscura con acento oficial y cuatro ofertas. Foto de archivo no acredita docencia |
| Certificaciones | Sin catálogo individual verificable | Timeline técnico y estado editorial sin entradas ficticias; pendiente de insumos |
| Contacto | Destinos candidatos / parcial | Sección completa con cinco canales controlados, enlaces pendientes de aprobación |
| Footer y flotante | Footer editorial y botón / parcial | Footer con marca/navegación/contacto y disclosure accesible de cinco canales |

#### Validación de contenido

| Candidato | Clasificación | Tratamiento |
|---|---|---|
| FAQ legacy: anticipación 1–2 meses / 2–4 semanas | Política no respaldada | Pendiente de aprobación, no publicada |
| FAQ: todos los niveles, clases privadas y mentoría | Formación general respaldada; respuesta específica pendiente | No publicada como política |
| FAQ: Tijuana/cobertura regional y oferta digital | Cobertura no verificada; digital fuera de V1 actual | No publicada; TrustSupport omitida sin ancla inexistente |
| WhatsApp / teléfono del preview | Candidato sin aprobación | Número productivo null y CTA preparado/deshabilitado |
| Facebook, Instagram, TikTok del MID/preview | Candidatos coincidentes sin aprobación registrada | Fuente única site.ts, destinos no activados |
| Correo | No disponible | Sin mailto ficticio |

Cinco servicios conservan nombre, descripción y CTA contextual; solo decoración tiene foto candidata. Cursos, talleres, certificaciones y asesorías esperan fotografía representativa aprobada. Formación muestra montaje de San Valentín como archivo con contexto/autorización pendientes: no acredita docencia ni alumnos. 8marzo no demuestra formación y no se usa. No se inventan temarios, precios, fechas, inscripciones ni Academia acreditada.

Seis derivados WebP: Hero, Licey, Baby Shower, XV, Kermés y San Valentín. Originales preservados. Sin diplomas o catálogo individual verificado, el timeline se prueba mediante render semántico con fixtures aislados y lógica de límites/avance de una tarjeta. QA en navegador del timeline con credenciales reales permanece pendiente.

#### Pruebas y límites

- npm run typecheck (incluye next typegen), npm run lint, npm test y npm run build: satisfactorios. 20 unitarias reales; build Next.js 16.4.0 con Turbopack, Cache Components y Partial Prefetching conserva rutas estáticas / y /_not-found.
- npm run test:e2e: 22 casos Chromium satisfactorios. Nueve anchos: 320, 375, 390, 428, 640, 768, 1024, 1280 y 1440. Anclas, menús/teclado/Escape/foco, cinco servicios, filtros, formación, estado sin credenciales, contacto/footer, noindex, imágenes y movimiento reducido.
- Capturas comparables: cero solicitudes fallidas en preview y aplicación a los tres tamaños. Inspección visual real; no equivale a Lighthouse, auditoría WCAG completa ni lector de pantalla.
- Se corrigió overflow del CTA de Navbar por especificidad CSS. Año dinámico con Date retirado por restricciones de prerender Cache Components. ESLint ignora reportes/evidencia generados, conserva reglas fuente. Ninguna comprobación desactivada.
- npm audit --omit=dev: 0; npm audit: 5 altas dev de la cadena registrada. Sin nuevas dependencias, downgrade, fix --force ni aceptación del riesgo.
- Workflow mantiene npm ci, typecheck, lint, unitarias, build y Chromium/E2E. Resultado remoto se consulta al publicar y se informa en PR/entrega; no se simula por existir el workflow.

**Salida:** Sprints 2 y 3 técnicamente implementados para los insumos disponibles; aceptación funcional/comercial parcial. Noindex permanece. Sprint 4 pendiente: Lighthouse/contraste/lector, credenciales reales, logo/favicon/SEO con dominio aprobado, validación comercial y decisión del responsable sobre riesgo dev. Sin release ni autorización de producción comercial.

## 13. Política de revisiones del plan

Las decisiones D01–D09 de la auditoría se consideran aprobadas. Este plan no introduce nuevas decisiones de negocio. Las propuestas operativas pendientes de ratificación son: metas cuantitativas Lighthouse, herramientas de analítica y dominio definitivo. Registrar cualquier cambio con fecha, responsable, motivo, impacto y versión del plan.


## 13. Corte vigente — Sprints 4–5, 13/10/2026

Los apartados históricos de §12 conservan resultados del momento en que se obtuvieron. Sus referencias a aprobación genérica pendiente, FAQ omitida, canales deshabilitados, tres fotos y 20/22 pruebas fueron superadas por este corte; no deben utilizarse como diagnóstico actual. ERP, ERV1, MID y D01–D09 permanecen intactos.

- **Contenido:** recuperación del preview aprobado (incluidas las afirmaciones de trayectoria allí autorizadas). Cinco nombres ERV1 conservados; cursos/talleres usan copy aprobado con correcciones ortográficas localizadas. FAQ: tres respuestas autorizadas, formación presencial actual y expansión digital expresamente futura. Sin testimonios inventados.
- **Conversión:** teléfono +52 664 484 6470; wa.me/5216644846470 preservado del preview, seis mensajes codificados. Facebook, Instagram y TikTok activos desde site.ts. Cuatro destinos GET 200 en consulta real, sin enviar mensajes ni iniciar sesión; esto acredita alcance HTTP, no entrega comercial. Correo: ausente.
- **UI:** carrusel manual categorizado, teclado/Home/End/filtros/táctil/reduced-motion; sin autoplay ni lightbox redundante. Menú flotante circular compacto, columna de iconos, tooltips, Escape/foco y canal correo inactivo explícito.
- **Assets:** siete derivados WebP, originales y legacy intactos; San Valentín en Formación, 8marzo en decoración según contenido aprobado. La imagen de Licey se mantiene completa, sin extraer un logotipo engañoso. Favicon derivado de fotografía aprobada sustituye el template. No existe acreditación individual inventada.
- **Validación local final:** Node 22.19.0/npm compatible; typegen/typecheck, ESLint, 27 unitarias, build y 29 E2E correctos. Chromium a 320/375/390/428/640/768/1024/1280/1440 px; capturas preview/Next a 375/768/1440; cero imágenes finales rotas, anclas inexistentes o desborde global en los casos ejecutados. Una falla intermedia Home del carrusel se corrigió eliminando padding inline; un smoke intermedio requería esperar la actualización React del filtro, corregido en el script QA. Sin suprimir comprobaciones.
- **Accesibilidad:** axe WCAG 2 A/AA, 2.1 A/AA y 2.2 AA, seis combinaciones de viewport/estado, cero violaciones; teclado/Escape/foco y movimiento reducido comprobados. No hubo ensayo con lector de pantalla ni dispositivos Safari/Firefox; no declarar conformidad WCAG integral.
- **Rendimiento:** Lighthouse 13.5.0/Node 22.19.0, build productivo local; baseline comparable y todas las corridas conservadas. Tres corridas optimizadas del hito bd5d6d7: móvil 89/92/91, desktop 100/100/100; mediana LCP 3208.58/743.33 ms, CLS 0/0, TBT 132/3 ms; SEO 66 intencionalmente por noindex. No son métricas de campo ni se garantiza una puntuación permanente. El corte final posterior solo corrige copy y condición FAQ; CI mide su propio HEAD por separado.
- **Runtime real:** globowslm.vercel.app del merge externo 30e8330: HTTPS 200, menús/galería/FAQ operables, imágenes cargadas, sin errores JS observados a 375 y 1440. Event Timing observado en laboratorio (hasta 16/48 ms) no es INP de campo. Preview de rama: deployment exitoso en GitHub pero acceso redirigido a Login Vercel; no afirmar QA de esa aplicación.
- **Seguridad:** audit runtime 0; árbol completo 5 altas dev y 0 críticas. Lighthouse 13.5.0 elimina advisories adicionales de versiones QA descartadas; no se cambia Next/React de major. Excepción braces no aceptada; ver registro de riesgo. Headers y noindex comprobados. CSP permite inline requerido por esta configuración: no es estricta con nonce.
- **Release:** candidata reproducible, CI con npm ci/tipos/lint/unitarias/build/E2E/axe/Lighthouse y artifacts siete días. Vercel CD existente no se reconfigura. No merge por el agente, tag final, indexación pública, release ni Sprint 6. Rollback documentado, no ejecutado/ensayado en producción.

**Salida:** READY WITH CONDITIONS como candidata técnica; no READY para liberar V1 íntegra. Datos concretos pendientes: correo, credenciales/organismos/evidencias y fotografía representativa de acreditación. Decisiones técnicas: aceptación del riesgo dev, dominio permanente, acceso QA al Preview, autorización formal de release/indexación. Detalle, evidencia y puerta de salida en [ReleaseCandidateV1.md](ReleaseCandidateV1.md) y [Evidencias/Sprints4-5](Evidencias/Sprints4-5/).
