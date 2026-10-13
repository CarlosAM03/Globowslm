### A. Resumen ejecutivo

**Dictamen: READY WITH CONDITIONS.**

El directorio es adecuado como raíz del futuro repositorio `CarlosAM03/GlobowslmV1.0.0`. La Foundation tiene una configuración coherente con las dependencias instaladas y supera las comprobaciones de ESLint y TypeScript ejecutadas durante esta auditoría.

Antes de cerrar Sprint 0 deben resolverse cuatro condiciones principales:

1. Corregir la identidad del README y completar las exclusiones del repositorio.
2. Establecer un typecheck reproducible desde un checkout limpio.
3. Registrar el tratamiento de la vulnerabilidad transitiva y de ESLint 9 fuera de soporte.
4. Actualizar el estado operativo del plan y definir las puertas de CI y despliegue.

La principal dependencia para completar el producto es **el contenido validado**: faltan logotipo oficial local, credenciales verificadas, fotografías de enseñanza y material suficiente para las categorías previstas. Esto condiciona los sprints funcionales y la publicación, pero no exige reconstruir la Foundation ni abrir otra fase de prototipado.

**D01–D09 continúan vigentes.** Los conflictos todavía presentes en MID y UIA están reconciliados por el ADR; falta normalizar sus fuentes mediante control de cambios.

**Alcance y evidencia de la auditoría, al 13 de octubre de 2026:**

| Tipo de evidencia | Resultado |
|---|---|
| Verificación directa | Lectura íntegra de los 11 documentos de `Docs/`; inspección del código, configuraciones, lockfile, paquetes instalados, preview y recursos gráficos |
| Verificación directa | ESLint ejecutado mediante `node node_modules/eslint/bin/eslint.js . --no-cache`: código de salida **0** |
| Verificación directa | TypeScript ejecutado mediante `node node_modules/typescript/bin/tsc --noEmit --incremental false`: código de salida **0** |
| Verificación directa | Hashes SHA-256 de archivos de raíz, documentación, código, assets, public y legacy: **sin cambios** entre inicio y cierre |
| Evidencia histórica suministrada | `npm ci`, scripts de lint/build/dev, `npx tsc --noEmit`, HTTP 200 y auditoría de producción sin vulnerabilidades |
| Evidencia histórica inspeccionada | Artefactos existentes en `.next/`, incluido manifiesto de prerenderizado |
| No ejecutado | Instalación, build, typegen, servidor Next.js, auditoría npm, comandos Git o despliegues |
| No comprobado | Reproducción desde checkout limpio, interfaz en navegador, Lighthouse, accesibilidad real, CI, Vercel y aceptación comercial |

La consulta del repositorio remoto del preview y de su GitHub Pages no pudo completarse con la herramienta web. El diagnóstico del preview se fundamenta en su copia local.

### B. Inventario real del directorio

Existen **39 archivos fuera de `node_modules/` y `.next/`**, incluyendo archivos generados y el reporte local.

| Clasificación | Contenido real | Evaluación |
|---|---|---|
| Documentación | 11 archivos Markdown en `Docs/` | Base amplia; requiere normalización y seguimiento |
| Aplicación | `src/app/layout.tsx`, `page.tsx`, `globals.css`, `favicon.ico` | Foundation del template; producto todavía no implementado |
| Referencia histórica | `legacy/index.html`, 565 líneas | Útil para composición; contiene limitaciones técnicas y funcionales |
| Material gráfico original | Dos imágenes en `assets/` y cinco en `assets/galeria/` | Siete recursos; aproximadamente **4,83 MB** |
| Recursos públicos | `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Los cinco pertenecen al template inicial |
| Configuración | Package/lockfile, Next.js, TypeScript, ESLint, `.gitignore`, `AGENTS.md` | Estructura adecuada |
| Dependencias instaladas | `node_modules/` | Disponibles; no deben versionarse |
| Build y desarrollo | `.next/` | Artefactos históricos; correctamente ignorados |
| Tipos generados | `next-env.d.ts` | Correctamente ignorado según las guías locales |
| Caché TypeScript | `tsconfig.tsbuildinfo` | Correctamente ignorada |
| Reporte local | `audit-report.json` | **No está excluido** |
| README | Documento del preview y GitHub Pages | No describe la aplicación V1 |

No encontré marcador `.git` en la raíz ni en sus directorios ascendentes inspeccionados. No se realizaron operaciones Git.

No existen todavía componentes modulares, datasets tipados, pruebas ni workflows. **Su ausencia es normal en esta Foundation** y no justifica crear carpetas vacías.

### C. Auditoría documental

**Autoridad y propósito**

| Documento | Autoridad aplicable | Diagnóstico |
|---|---|---|
| [ERP](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/00-ERP.md:101) | Contexto, visión y roadmap funcional | V1 está claramente delimitada; D08 conserva su autoridad |
| [ERV1](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/01-ERV1.md:53) | Alcance obligatorio y aceptación | Define servicios, galerías, credenciales y cinco canales de contacto |
| [Index](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Index.md:5) | Organización documental orientativa | Describe una estructura prevista; no inventaría los archivos realmente existentes |
| [DocITyET](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/05-DiseñoUI_UX/Investigacion/DocITyET.md:16) | Investigación y propuestas preliminares | Justifica stack y enfoque; no especifica convenciones técnicas completas |
| [Brand Discovery](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/05-DiseñoUI_UX/02-BrandDiscovery.md:13) | Identidad, públicos y comunicación | Coherente; origen del nombre pendiente |
| [MID](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/05-DiseñoUI_UX/03-MID.md:100) | Tokens, identidad visual y reglas UX | Tokens definidos; estructura y roadmap necesitan normalización |
| [UIA](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/05-DiseñoUI_UX/04-UIArquitecture.md:107) | Organización y composición | Debe leerse con las correcciones vinculantes del ADR |
| [ADR consolidado](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/05-DiseñoUI_UX/05-ADR-Arquitectura-UI-Consolidada.md:25) | D01–D09 y estructura reconciliada | Referencia estructural aplicable; conserva pendientes de detalle y contenido |
| [Auditoría documental anterior](<C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/Auditoría de consistencia documental — Globows LM v1.0.0.md:395>) | Registro histórico de hallazgos | Mezcla diagnóstico inicial, cuestionario pendiente y posterior inicio de implementación |
| [PlanAvance2](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/PlanAvance2.md:5) | Evidencias y objetivos académicos | No debe gobernar el alcance productivo ni reabrir decisiones aprobadas |
| [PlanDeImplementacion](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/PlanDeImplementacion.md:9) | Ejecución, QA, despliegue y estabilización | Buen plan maestro; contiene estados antiguos y propuestas operativas pendientes |

**Consistencia principal**

ERP, ERV1 y Brand Discovery coinciden en una Landing institucional con dos líneas de negocio: decoración y formación. El alcance excluye backend de negocio, DB, autenticación, administración y CMS.

El ADR resuelve correctamente:

- D01: ocho posiciones conceptuales.
- D02: Servicios y Eventos integrados.
- D03: Hero con fotografía única.
- D04: Testimonios/FAQ condicionados a contenido validado.
- D05: separación de decoraciones y evidencias formativas.
- D06: WhatsApp contextual.
- D07: correo en menú flotante.
- D08: roadmap del ERP.
- D09: publicación de contenido real y validado.

No existe motivo técnico comprobado para sustituir estas decisiones.

**Contradicciones y deuda pendientes**

1. **Fuentes anteriores sin normalizar.**  
   UIA conserva `HeroCarousel`, siete secciones, ausencia de correo y evolución CMS → Campus → Portal → ERP. MID conserva dos galerías, testimonios/FAQ independientes y un roadmap diferente. Son discrepancias textuales resueltas por el ADR, no decisiones pendientes de aprobación nuevamente.

2. **Estados documentales incompatibles.**  
   MID se declara cerrado, UIA “En construcción”, la auditoría anterior muestra “0 de 9” decisiones y el ADR declara las nueve aprobadas. Debe identificarse claramente la vigencia de cada registro.

3. **Referencia técnica inexistente en la fuente citada.**  
   UIA, líneas 490–505, atribuye la organización del frontend a DocITyET. La lectura íntegra de DocITyET confirma que **no contiene ese contrato de directorios**. El plan maestro ofrece una estructura orientativa suficiente para avanzar, pero la atribución necesita corregirse.

4. **Calendario desactualizado.**  
   ERV1 conserva fechas de junio–agosto de 2026. El plan maestro de octubre no fija duración, responsables, hitos ni periodo de estabilización. Debe añadirse planificación vigente preservando el historial.

5. **Inventario documental incompleto.**  
   `Index.md` presenta ERS, API y DB como organización general, pero no distingue artefactos existentes, futuros o fuera de V1. Su ausencia no obliga a crear documentación de backend.

6. **Especificaciones parciales.**  
   MID define sombras y colores de estados de forma cualitativa; la escala tipográfica no concreta toda su adaptación móvil. Pueden cerrarse durante la implementación de tokens y componentes, sin otro prototipo.

**Trazabilidad funcional**

| Obligación | Implementación prevista | Evidencia de aceptación del plan |
|---|---|---|
| Marca y Hero | HeroSection, D03 | AT-01 |
| Historia, filosofía y trayectoria | AboutSection | AT-02; conviene explicitar filosofía e historia |
| Cinco servicios con nombre, descripción, imagen y contacto | ServicesEvents + Courses | AT-03 |
| Galería organizada | GallerySection, D05 | AT-04 |
| Cursos y talleres | CoursesSection | AT-05 |
| Credenciales profesionales | CertificationsSection | AT-02 y AT-10 |
| WhatsApp contextual | CTAs y helper de enlaces | AT-06 |
| Cinco canales persistentes, incluido correo | FloatingContactMenu | AT-07 |
| Teclado y responsive | Layout e interacciones | AT-08 y AT-09 |
| Contenido validado | Todas las fuentes de contenido | AT-10 |
| SEO | Metadata, robots y sitemap | AT-11 |
| Despliegue estable | CI y Vercel | AT-12 |

La cobertura conceptual es buena. La matriz todavía no asigna a cada requisito **estado, responsable, componente concreto y evidencia obtenida**. Tampoco verifica explícitamente el teléfono visible, el timeline horizontal, movimiento reducido y la aprobación de cada asset.

**Separación académica/productiva**

`PlanAvance2.md` solicita mapas de empatía, wireframes y diapositivas como evidencias académicas. El plan maestro establece implementación real sin otro ciclo de modelado. La interpretación correcta es utilizar evidencias existentes y del desarrollo, y registrar por separado cualquier ausencia académica.

El origen del nombre y la sección TrustSupport pueden permanecer fuera de publicación si no hay contenido aprobado. Las certificaciones obligatorias, los servicios y los canales de contacto sí requieren cierre antes de aceptar V1.

### D. Auditoría del preview

**Recursos visuales reales**

Las dimensiones y tamaños se verificaron leyendo las imágenes; también inspeccioné visualmente los siete recursos.

| Imagen | Dimensiones | Tamaño aproximado | Reutilización posible |
|---|---:|---:|---|
| HeroImagen.PNG | 852 × 856 | 994 kB | Decoración protagonista; comprobar nitidez y recorte en escritorio |
| ImagenLicey.jpg | 1600 × 1600 | 311 kB | Composición promocional con Licey; no es retrato institucional limpio |
| 8marzo.png | 692 × 749 | 821 kB | Evidencia de evento; incluye personas y elementos de una captura |
| BabyShower.png | 472 × 411 | 285 kB | Portafolio en tamaño contenido; limitada para ampliaciones |
| CursoSanValentin.png | 706 × 707 | 889 kB | Decoración terminada; no demuestra visualmente enseñanza |
| KermesDiaCosecha.png | 827 × 531 | 749 kB | Portafolio de decoración temática |
| XVs.png | 825 × 555 | 782 kB | Portafolio de XV años |

**No hay duplicados binarios entre los siete archivos**, según SHA-256. Esto no equivale a una búsqueda exhaustiva de duplicados perceptuales.

Las fotografías PNG tienen un peso elevado para sus dimensiones. Su conversión y entrega optimizada deben evaluarse durante los sprints; no se efectuó ninguna transformación.

Los nombres son comprensibles, pero mezclan mayúsculas y convenciones. Para los derivados productivos conviene usar nombres estables en minúsculas y respetar exactamente el casing, especialmente en CI/Linux.

**Limitaciones visuales comprobadas**

- El Hero es casi cuadrado; no puede asumirse que funcionará como fondo panorámico sin perder detalle.
- `ImagenLicey.jpg` incorpora textos, logos de terceros y una imagen infantil. Su composición resulta problemática para el recorte 4:5 del preview. Debe obtenerse una fotografía apropiada y confirmar autorización de uso.
- `8marzo.png` conserva un control lateral y texto inferior recortado propios de una captura. Conviene obtener el original.
- `CursoSanValentin.png` muestra un montaje decorativo, no una clase. El nombre del archivo no sustituye la validación del contexto.

**Assets faltantes**

No encontré archivos locales para:

- Logotipo oficial de Globows LM.
- Fotografías de enseñanza, talleres o asesorías.
- Evidencias de certificaciones y organismos.
- Material suficiente para cubrir las categorías inicialmente enumeradas con cuatro a seis imágenes por categoría.
- Branding productivo para favicon y Open Graph.

Los enlaces del anexo del MID son referencias; no acreditan disponibilidad local, licencia, estabilidad ni certificaciones de Licey.

Las categorías de ERV1 son ejemplos y D05 permite validarlas contra el material real. Por tanto, **no es obligatorio crear categorías vacías**, pero sí resolver la taxonomía y la suficiencia fotográfica frente al MID.

**Elementos aprovechables**

El preview aporta referencias útiles de:

- Fotografía protagonista y overlay.
- Composición de About en dos columnas.
- Separación narrativa entre decoración y formación.
- Tarjetas, CTA, anclas y distribución de contenido.
- Galería e interacción de FAQ, si se valida su necesidad y contenido.

**Adaptaciones necesarias**

| Elemento | Limitación comprobada | Adaptación productiva |
|---|---|---|
| Estilos | Configuración Tailwind en navegador, paleta y escala diferentes del MID | Tokens oficiales compilados con Tailwind 4 |
| Navbar | Navegación oculta en móvil sin menú alternativo | MobileMenu accesible |
| Menú flotante | Apertura por hover; botón sin lógica de clic; sin correo | Estado explícito, teclado, toque, Escape y cinco canales |
| FAQ | Manipulación de DOM; sin estado ARIA; altura máxima fija | Interacción accesible y contenido validado |
| Carrusel | Medición manual, sin swipe implementado ni ajuste del índice al cambiar viewport | Interacción aislada, si está justificada |
| Imágenes | Hero como fondo sin alternativa semántica; `data-alt` no es `alt` | Tratamiento decorativo o informativo explícito |
| Movimiento | Transiciones de 500–700 ms y ausencia de reducción de movimiento | Reglas MID y preferencia del usuario |
| Contacto | Un mismo mensaje WhatsApp para contextos diferentes | D06 |
| Galería | Carrusel mezclado, sin categorías | D05 y categorías verificadas |
| Credenciales | No existe sección efectiva de certificaciones | CertificationsSection obligatoria |

A 768 px hay una discrepancia entre CSS del carrusel (`max-width: 768px`) y su cálculo JavaScript (`< 768`). También falta limitar el índice al redimensionar. Son defectos del preview que no deben trasladarse.

**Contenido sin respaldo documental explícito**

En [legacy/index.html](C:/Users/Carl0/Desktop/Globows/globowslm/legacy/index.html:217) aparecen:

- “Más de 5 años”.
- Talleres “semanales”.
- Temario y denominación “Academia GlobowsLM”.
- Anticipación de reservas de 1–2 meses y 2–4 semanas.
- Cobertura regional, sede y expansión hacia México/Latam.
- Lemas comerciales y copyright 2019.

No afirmo que sean falsos; **su validación no está acreditada en los documentos inspeccionados**.

Además, “Leer Historia Completa” y “Ver Horarios” apuntan a sus propios bloques; Privacidad y Términos apuntan a `#`. No representan funcionalidades completas.

**Referencia local rota**

Las siete referencias `assets/...` se resuelven desde `legacy/`, donde esos archivos no existen. El HTML archivado no es autocontenido al abrirlo desde su ubicación actual. Puede conservarse intacto como evidencia histórica; no debe presentarse como preview local funcional.

**Dependencias externas**

Utiliza Tailwind CDN, Google Fonts y Material Symbols. Tailwind declara su Play CDN para desarrollo, no producción. [Documentación oficial](https://tailwindcss.com/docs/installation/play-cdn).

No encontré en el HTML formularios de envío, `eval` ni una integración activa con backend de negocio.

### E. Auditoría técnica Next.js

**Versiones verificadas**

| Paquete | Instalado y lockfile | Evaluación |
|---|---:|---|
| Next.js | 16.4.0 | Coincide con eslint-config-next |
| React / React DOM | 19.3.0 / 19.3.0 | Compatibles con los peers declarados |
| TypeScript | 5.9.3 | Supera el mínimo 5.1 documentado localmente |
| ESLint | 9.39.5 | Funciona; fuera de soporte |
| eslint-config-next | 16.4.0 | Alineado con Next.js |
| Tailwind CSS | 4.3.3 | Alineado con su loader |
| @tailwindcss/turbopack | 4.3.3 | Integración documentada por el paquete instalado |
| @types/node | 20.19.43 | No determina la versión real del runtime |
| @types/react / react-dom | 19.3.0 / 19.3.0 | Alineados |

Runtime observado: **Node.js 22.16.0**, npm **10.9.2**. Cumple el mínimo Node 20.9 de Next.js instalado.

El lockfile es versión 3, contiene **437 entradas de paquetes**, todas con integridad y URLs de `registry.npmjs.org`. No encontré diferencias de versión con los paquetes presentes ni dependencias no opcionales ausentes. Las 74 entradas opcionales no instaladas no constituyen por sí mismas un defecto.

**Scripts**

`dev`, `build`, `start` y `lint` son apropiados. Faltan un script de typecheck reproducible y, cuando se adopten, scripts de pruebas. No se requieren scripts de tests ficticios para cerrar una Foundation.

**App Router y estructura**

`src/app` es válido. Las configuraciones y `public/` están correctamente en raíz. No existe otro `app/` raíz que eclipse `src/app`.

Layout y Page son Server Components por defecto. No hay una frontera Client innecesaria. La modularización propuesta en el plan es proporcional si se crean componentes al necesitarlos.

**Turbopack y Tailwind**

[La configuración actual](C:/Users/Carl0/Desktop/Globows/globowslm/next.config.ts:5) contiene:

- `cacheComponents: true`.
- `partialPrefetching: true`.
- `turbopack.root: process.cwd()`.
- Loader `@tailwindcss/turbopack` para CSS.

La guía local confirma Turbopack por defecto en `dev` y `build`. No necesita flags adicionales.

La ausencia de `postcss.config.mjs` **no es un defecto**: el README del loader instalado documenta exactamente la integración existente con `as: "*.css"`.

`process.cwd()` proporciona una ruta absoluta cuando se ejecuta desde la raíz mediante los scripts habituales. Su dependencia del directorio de ejecución debe contemplarse en CI; no hay evidencia suficiente para declararlo incorrecto.

**Cache Components y Partial Prefetching**

Las guías locales de esta versión confirman:

- Ambas opciones son de primer nivel.
- Partial Prefetching requiere Cache Components.
- Cache Components integra PPR.
- No corresponde añadir `experimental.ppr`.
- Cache Components requiere runtime Node.js.

La pareja actual está correctamente configurada. Para una Landing de anclas, el beneficio de prefetch entre rutas es limitado, pero no es una incompatibilidad ni requiere desactivación.

**TypeScript**

[tsconfig.json](C:/Users/Carl0/Desktop/Globows/globowslm/tsconfig.json:7) mantiene `strict`, `noEmit`, resolución `bundler`, plugin Next y alias `@/*`.

`LayoutProps<"/">` es válido y se genera mediante `next dev`, `next build` o `next typegen`. No es un error arquitectónico.

El riesgo es otro: `next-env.d.ts` y `.next/` se excluyen del repositorio, por lo que el checkout limpio necesita generar tipos antes del typecheck. El éxito actual utiliza los tipos ya presentes.

Recomendación para Sprint 0: script que ejecute **typegen seguido de tsc**, sin sustituir `LayoutProps` únicamente para evitar esa preparación.

**ESLint**

[eslint.config.mjs](C:/Users/Carl0/Desktop/Globows/globowslm/eslint.config.mjs:1) utiliza Flat Config, Core Web Vitals y TypeScript. La comprobación directa pasó.

La guía local confirma que **`next build` no ejecuta lint automáticamente**. CI debe mantener ambas comprobaciones separadas.

**Sistema de estilos**

[globals.css](C:/Users/Carl0/Desktop/Globows/globowslm/src/app/globals.css:1) permite incorporar tokens mediante `@theme`, pero actualmente conserva colores, dark mode y fuentes del template.

Faltan todavía los tokens MID, Manrope y Cormorant Garamond. Esto pertenece a Sprint 1, no implica que Tailwind esté averiado.

**Escaneo de legacy**

El loader usa el directorio de trabajo como base de escaneo. El CSS histórico contiene:

```css
.min-h-\[921px\]{min-height:921px}
```

La clase existe exclusivamente en `legacy/index.html:175` entre las fuentes propias inspeccionadas. Es evidencia de que el preview está aportando utilidades al CSS generado.

Conviene delimitar las fuentes de Tailwind o excluir `legacy/` y documentación del escaneo **sin excluirlos de Git**. Tailwind documenta estos controles. [Detección de clases](https://tailwindcss.com/docs/detecting-classes-in-source-files).

**Template pendiente**

[layout.tsx](C:/Users/Carl0/Desktop/Globows/globowslm/src/app/layout.tsx:15) conserva metadata “Create Next App”, `lang="en"` y Geist. El favicon inspeccionado muestra la “N” de Next.js.

[page.tsx](C:/Users/Carl0/Desktop/Globows/globowslm/src/app/page.tsx:7) utiliza `priority`, cuya deprecación está documentada en la guía local de `next/image`. Al construir el Hero debe seleccionarse conscientemente `preload`, `fetchPriority` o carga eager según su función; no trasladar automáticamente esa prop.

shadcn/ui, Motion y Lucide aún no están integrados. Es un pendiente funcional esperado, no una incompatibilidad comprobada.

**Artefactos históricos**

El manifiesto existente registra `/`, `/_not-found`, `/_global-error` y `/favicon.ico`, sin rutas dinámicas. Las entradas internas y de favicon no amplían el alcance comercial. Su lectura no equivale a un build nuevo.

### F. Auditoría de seguridad

**Causa raíz**

La cadena instalada es:

```text
eslint-config-next 16.4.0                   directa, desarrollo
└─ @next/eslint-plugin-next 16.4.0          transitiva, desarrollo
   └─ fast-glob 3.3.1                      transitiva, desarrollo
      └─ micromatch 4.0.8                  transitiva, desarrollo
         └─ braces 3.0.3                  transitiva, desarrollo
```

El [reporte local](C:/Users/Carl0/Desktop/Globows/globowslm/audit-report.json:23) identifica una vulnerabilidad de agotamiento de pila por patrones de llaves profundamente anidados.

**Los cinco registros altos corresponden a un advisory raíz y cuatro dependencias afectadas transitivamente.** npm denomina a estas propagaciones metavulnerabilidades. [Documentación de npm](https://docs.npmjs.com/cli/v10/commands/npm-audit/).

El aviso consultado afecta `braces <=3.0.3` y no registra versiones corregidas. **No corresponde recomendar `braces 3.0.3` como solución**, porque es precisamente la versión instalada afectada. [Advisory oficial](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

**Exposición contextual**

| Entorno | Evaluación |
|---|---|
| Runtime público | No identifiqué una ruta de aplicación que procese patrones mediante esta cadena |
| Herramientas locales | La dependencia está presente en el lint |
| CI | Puede afectar disponibilidad del job si recibe patrones maliciosos |
| Build de Vercel | Las herramientas de desarrollo necesarias para compilar siguen siendo parte de la cadena de construcción |
| Confidencialidad/integridad | Este advisory describe DoS; no acredita robo de secretos ni ejecución remota |

El código instalado del plugin obtiene los patrones de `settings.next.rootDir`; la configuración del proyecto no define ese valor y utiliza el directorio de trabajo. Esto reduce la exposición identificada frente a un servicio que aceptara patrones arbitrarios del público.

La severidad del advisory es alta; **el riesgo práctico observado se concentra en herramientas y disponibilidad del pipeline**.

Los cero hallazgos de `npm audit --omit=dev` son evidencia histórica aportada y coherente con las marcas `dev` del lockfile. No constituyen una auditoría nueva ni una garantía general de seguridad.

**Remediaciones evaluadas**

| Alternativa | Compatibilidad e impacto |
|---|---|
| Actualización upstream compatible | Preferible cuando exista una versión que elimine o corrija la cadena; todavía no verificada |
| Mantener temporalmente con excepción documentada | Viable con responsable, revisión y controles de CI; no equivale a resolver el advisory |
| Override a versión corregida | Solo cuando exista parche comprobado y validación de compatibilidad; no hay objetivo confirmado |
| Parche mantenido | Posible, pero introduce mantenimiento y verificación adicionales |
| Reemplazar el sistema de lint | Cambio de alcance técnico que debe preservar las reglas relevantes; no es la primera opción |
| `audit fix --force` | **Desaconsejado para este estado** |

El reporte propone `eslint-config-next 14.2.35` con `isSemVerMajor: true`. Eso supondría bajar de la línea 16 a 14 mientras Next.js continúa en 16.4.0 y podría romper la configuración actual basada en exports de Flat Config. La propuesta automática no acredita compatibilidad.

**ESLint 9.39.5**

El lockfile contiene explícitamente la deprecación por falta de soporte. ESLint confirma que la línea 9 alcanzó EOL el 6 de agosto de 2026. [Estado oficial](https://eslint.org/version-support/).

Migrar solo ESLint a 10 no es una actualización segura del conjunto instalado:

- `eslint-config-next` declara `eslint >=9`.
- `eslint-plugin-react 7.37.5` no declara soporte para ESLint 10.
- `eslint-plugin-jsx-a11y 6.10.2` tampoco lo declara.

La migración requiere revisar el conjunto de plugins, peers y cambios mayores. Node 22.16.0 cumple el mínimo de la línea 22 documentado para ESLint 10. [Guía de migración](https://eslint.org/docs/latest/use/migrate-to-10.0.0).

**Otros riesgos**

- Tailwind CDN del legacy: ejecución remota y disponibilidad externa; no migrarlo a producción.
- Fuentes del preview: solicitudes externas en navegador; `next/font` permite servirlas desde el deployment.
- URLs de miniaturas y Facebook CDN del MID: no son un origen productivo estable ni evidencia de derechos de uso.
- HTML heredado: no insertarlo mediante `dangerouslySetInnerHTML`; implementar composición React y contenido validado.
- Dependencias futuras: verificar peers de React 19.3, Tailwind 4 y Next.js antes de incorporarlas.

No encontré archivos de entorno o claves con los nombres inspeccionados ni coincidencias de un conjunto limitado de patrones de secretos. **La revisión no es una certificación exhaustiva de ausencia de secretos.** No se reprodujeron valores sensibles.

### G. Auditoría Git y DevOps

**Raíz del repositorio**

La raíz actual es correcta. No hace falta otra carpeta Next.js anidada ni renombrar el directorio local para hacerlo coincidir con GitHub.

**`.gitignore`**

[Las exclusiones actuales](C:/Users/Carl0/Desktop/Globows/globowslm/.gitignore:3) cubren correctamente dependencias, `.next/`, `out/`, `build/`, cobertura, logs npm, `.env*`, `.vercel`, `.pem`, `*.tsbuildinfo` y `next-env.d.ts`.

Pendientes:

- `audit-report.json`.
- Reportes y resultados de Playwright al adoptarlo.
- Caché ESLint si se habilita.
- Archivos locales de editor, backups o claves adicionales si aparecen.

No conviene ignorar indiscriminadamente todos los JSON ni todos los reportes: algunos pueden ser fuentes o evidencia deliberadamente versionada.

`Docs/`, assets originales, `legacy/`, configuraciones, package/lockfile y `AGENTS.md` deben conservarse de forma intencional.

**README y AGENTS**

El [README](C:/Users/Carl0/Desktop/Globows/globowslm/README.md:15) afirma que este es únicamente el preview y que se publica en GitHub Pages. Es incorrecto para el repositorio definitivo.

Debe explicar producto V1, alcance, stack, requisitos, comandos, contenido estático, relación con legacy, validaciones y operación en Vercel.

[AGENTS.md](C:/Users/Carl0/Desktop/Globows/globowslm/AGENTS.md:1) corresponde al bloque generado por Next.js. Verifiqué sus marcadores y texto en `generate-agent-files.js`. Debe conservarse.

**Ramas**

La propuesta `main` → producción, `dev` → integración y `feature/*` es técnicamente válida. Un flujo `main` protegido con ramas cortas también es proporcional a una Landing.

Es una propuesta operativa pendiente de ratificación; esta auditoría no impone una alternativa ni crea ramas.

**CI mínimo desde Sprint 0**

1. Runtime Node/npm acordado.
2. Instalación con lockfile mediante `npm ci`.
3. Generación de tipos.
4. Typecheck.
5. ESLint separado del build.
6. Build productivo.
7. Auditoría de producción y reporte del árbol completo con tratamiento explícito de excepciones.
8. Pruebas de interacciones críticas desde que existan.

Los jobs de PR no deben recibir secretos de despliegue innecesarios. Vercel puede gestionar despliegues mediante su integración Git; no hace falta duplicar esa responsabilidad en Actions.

**Vercel y publicación temprana**

Vercel despliega cambios de ramas y de la rama configurada como productiva. Por ello, una importación de la Foundation y un push a `main` deben coordinarse para evitar publicar el template como producto oficial. [Integración Git de Vercel](https://vercel.com/docs/git).

Antes del primer Preview:

- Root Directory apuntando a la raíz de este proyecto.
- Framework Next.js y bundler previsto.
- Instalación con devDependencies necesarias para build.
- Runtime y comandos coherentes con CI.
- Sin variables secretas innecesarias.
- Política de acceso e indexación de Preview.
- Verificación de build limpio, `/`, CSS, fuentes e imágenes.

Antes de producción:

- Contenido y assets aprobados.
- Cobertura completa de ERV1 y D01–D09.
- CI y pruebas críticas aprobados.
- QA responsive y accesibilidad.
- Metadata, dominio, canonical, OG, favicon, robots y sitemap finales.
- Revisión actualizada de dependencias y riesgo.
- HTTPS, enlaces y WhatsApp verificados.
- Aprobación del release, rollback y periodo de estabilización definidos.

La ausencia actual de `vercel.json` no es un defecto por sí sola.

### H. Evaluación del Plan de Implementación

El [plan maestro](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/PlanDeImplementacion.md:97) tiene un orden viable y mantiene el alcance V1.

| Sprint | Objetivo y dependencias | Entregables y aceptación | Evaluación y ajuste necesario |
|---|---|---|---|
| **0 — Foundation** | Reproducibilidad, seguridad, repositorio y Preview | Instalación, lint, tipos, build y primer entorno verificables | Correcto. Typecheck actual pasa y raíz Turbopack ya existe: actualizar estado. Añadir tarea explícita de CI básico, runtime y política de Preview |
| **1 — Sistema visual, Layout, Hero, About** | Depende de Foundation y branding/copy aprobado | Identidad MID, navegación, Hero único y About | Correcto. Incorporar desde aquí helper WhatsApp, idioma y metadata mínima. Resolver logotipo y retrato antes de aceptación |
| **2 — Servicios y Galería** | Tokens, componentes y taxonomía validada | Cinco servicios con cuatro elementos; categorías correctas | Correcto. La falta de fotografías limita cumplimiento. Un enlace hacia formación no sustituye los cuatro elementos de cada servicio |
| **3 — Formación, Credenciales, Conversión** | Base UI, datos oficiales y evidencias reales | Landing obligatoria completa, menú con cinco canales | Correcto. Certificaciones son dependencia crítica. Explicitar que el timeline horizontal sigue siendo obligatorio según ADR/UIA |
| **4 — Hardening** | Sprints 2 y 3 funcionalmente completos | SEO, rendimiento, accesibilidad y RC preliminar | Correcto como consolidación. Pruebas, semántica y optimización deben empezar antes; no esperar aquí para diseñar los flujos críticos |
| **5 — QA y Release** | RC aprobado, CI y contenido final | Aceptación, producción, tag y rollback | Correcto. CI no debe comenzar aquí. Definir quién aprueba RC/release y qué evidencia permite promoverlo |
| **6 — Estabilización** | V1 publicada | Incidencias, parches y mantenimiento | Correcto. Falta duración acordada y responsable. ERV2 permanece separado y condicionado |

**Tareas adelantadas o atrasadas**

- Helper WhatsApp: está en Sprint 3, pero Sprint 1 ya requiere CTA operativo. Adelantar su base a Sprint 1.
- CI: Sprint 1 exige CI verde, pero la formalización aparece en Sprint 5 y Sprint 0 admite comprobaciones solo locales. El mínimo debe existir en Sprint 0.
- Pruebas críticas: comenzar con cada interacción; Sprint 4 amplía cobertura y Sprint 5 verifica formalmente.
- Idioma y metadata básica: Sprint 1; canonical, OG y metadatos definitivos se completan en Sprint 4.
- Inventario y validación de contenido: debe arrancar durante el cierre de Sprint 0, aunque su producción continúe después.

**Duplicaciones**

Servicios formativos en Sprints 2 y 3 no implican duplicación obligatoria: el ADR admite distribución. Deben compartir contenido y destinos coherentes.

Optimización y responsive repetidos son calidad continua. Las dos menciones de CI sí necesitan distinguir creación inicial y endurecimiento final.

**Aceptación y decisiones pendientes**

Las metas Lighthouse ≥90 están correctamente presentadas como propuestas, no requisitos aprobados ni garantía de accesibilidad.

Faltan criterios explícitos para teléfono visible, timeline, movimiento reducido, consentimiento/uso de fotografías y separación Preview/producción.

El plan no fija una cadencia ni fecha de release. La viabilidad técnica es buena; la viabilidad temporal no puede determinarse sin disponibilidad de contenido, capacidad y calendario.

### I. Registro de hallazgos

La severidad considera el impacto en este proyecto. Ningún hallazgo crítico fue confirmado. Los pendientes normales del template se distinguen de los riesgos de publicación.

| ID | Severidad / categoría | Archivo o componente y evidencia | Impacto | Recomendación | Sprint | Aprobación del arquitecto |
|---|---|---|---|---|---|---|
| **PR-01** | Alta · Seguridad | [audit-report.json](C:/Users/Carl0/Desktop/Globows/globowslm/audit-report.json:23): braces afectado; lockfile confirma cadena dev | DoS potencial en herramientas/CI | Remediación upstream comprobada o excepción temporal controlada | 0; revisar en 5 | **Sí**, si acepta riesgo o adopta parche |
| **PR-02** | Media · Mantenimiento | [Lockfile](C:/Users/Carl0/Desktop/Globows/globowslm/package-lock.json:3219): ESLint 9.39.5 deprecado; plugins sin peers para 10 | Toolchain fuera de soporte; migración mayor no trivial | Evaluar actualización conjunta y registrar tratamiento temporal | 0 | **Sí** para cambio mayor o excepción |
| **PR-03** | Media · Reproducibilidad | [Layout](C:/Users/Carl0/Desktop/Globows/globowslm/src/app/layout.tsx:20) usa LayoutProps; package no tiene typecheck | Checkout limpio puede carecer de tipos | Script typegen → tsc y comprobación limpia | 0 | No |
| **PR-04** | Media · Git | [.gitignore](C:/Users/Carl0/Desktop/Globows/globowslm/.gitignore:27) no excluye reporte local ni futuras salidas E2E | Primer commit con artefactos; ruido posterior | Completar exclusiones específicas | 0 | No |
| **PR-05** | Media · Documentación | [README](C:/Users/Carl0/Desktop/Globows/globowslm/README.md:17): declara preview y GitHub Pages | Identidad y operación del repo incorrectas | README de aplicación V1 | 0 | No |
| **PR-06** | Baja · Metadatos | [Package](C:/Users/Carl0/Desktop/Globows/globowslm/package.json:2): foundation/0.1.0 | Identidad provisional | Nombre acordado y lockfile sincronizado; reservar versión final al release | 0 | No, salvo cambio de política |
| **PR-07** | Media · Consistencia | [UIA](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/05-DiseñoUI_UX/04-UIArquitecture.md:164) y [MID](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/05-DiseñoUI_UX/03-MID.md:688) conservan definiciones anteriores al ADR | Riesgo de implementar una fuente obsoleta | Normalización trazable a D01–D09 | 0–1 | **Sí**, para editar documentos oficiales |
| **PR-08** | Media · Arquitectura documental | [UIA](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/05-DiseñoUI_UX/04-UIArquitecture.md:490) atribuye convenciones ausentes en DocITyET | Falsa trazabilidad técnica | Reconocer estructura orientativa del plan y corregir atribución | 0 | **Sí**, por fuente oficial |
| **PR-09** | Media · Planificación | [PlanAvance2](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/PlanAvance2.md:184) reabre arquitectura; ERV1 conserva calendario vencido | Retrabajo y ejecución sin hitos vigentes | Separar evidencias académicas y actualizar cronograma operativo | 0 | **Sí**, para cambios documentales |
| **PR-10** | Media · Trazabilidad | [Matriz AT](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/PlanDeImplementacion.md:229) sin estados ni evidencias obtenidas | Aceptación incompleta o difícil de acreditar | Añadir responsabilidad y evidencia, incluyendo teléfono/timeline/movimiento | 0–5 | **Sí** si cambia criterios |
| **PR-11** | Alta · Contenido | [Pendientes ADR](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/05-DiseñoUI_UX/05-ADR-Arquitectura-UI-Consolidada.md:420) y assets sin logos/credenciales/enseñanza | Bloquea completar y publicar secciones obligatorias | Obtener material y validación comercial; no inventar contenido | 0–3 | **Sí**, más propietaria |
| **PR-12** | Media · Assets | [Hero](C:/Users/Carl0/Desktop/Globows/globowslm/assets/HeroImagen.PNG), retrato promocional y PNG pesados | Nitidez, recorte, identidad y rendimiento | Seleccionar originales adecuados y generar derivados optimizados | 1–3 | No técnico; **sí** selección comercial |
| **PR-13** | Media · Contenido heredado | [Preview](C:/Users/Carl0/Desktop/Globows/globowslm/legacy/index.html:379): FAQ, horarios, cobertura y mensajes no acreditados | Publicación contraria a D09 | Validar afirmaciones y sustituir enlaces sin función | 1–3 | **Sí**, más propietaria |
| **PR-14** | Media · Accesibilidad | [Menú flotante](C:/Users/Carl0/Desktop/Globows/globowslm/legacy/index.html:464), Navbar y FAQ | Uso móvil/teclado incompleto si se copia | Implementar interacciones React accesibles | 1–3; QA 4 | No |
| **PR-15** | Baja · Referencia histórica | [Legacy](C:/Users/Carl0/Desktop/Globows/globowslm/legacy/index.html:118): siete rutas relativas inexistentes desde legacy | Preview local archivado sin imágenes | Registrar limitación y preservar original; decidir después cómo visualizarlo | 0 | Solo si se altera el archivo |
| **PR-16** | Media · Estilos | [globals.css](C:/Users/Carl0/Desktop/Globows/globowslm/src/app/globals.css:1); CSS histórico incluye clase exclusiva de legacy | Utilidades ajenas al producto y crecimiento innecesario | Delimitar escaneo Tailwind conservando legacy en Git | 1 | No |
| **PR-17** | Media · CI | [Plan](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/PlanDeImplementacion.md:193): formalización en Sprint 5, exigencia anterior | Cambios iniciales sin validación automática obligatoria | CI mínimo en Sprint 0; ampliar posteriormente | 0 | **Sí**, política operativa pendiente |
| **PR-18** | Media · Despliegue | [Sprint 0](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/PlanDeImplementacion.md:112) conecta Vercel sin detallar promoción/indexación | Publicación prematura del template | Separar Preview y release comercial; acordar acceso y promoción | 0 y 5 | **Sí** |
| **PR-19** | Media · Contrato UI | [Sprint 3](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/PlanDeImplementacion.md:159) suaviza timeline con “cuando corresponda” | Omisión posible de una decisión estructural vigente | Criterio explícito de timeline horizontal y adaptación responsive | 3 | No para cumplir; **sí** para cambiar |
| **PR-20** | Baja · Estado documental | [Plan](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/PlanDeImplementacion.md:268): typecheck y raíz como pendientes | Diagnóstico operativo desactualizado | Actualizar estado con evidencia; mantener pendiente checkout limpio | 0 | **Sí**, para editar plan |
| **PR-21** | Baja · Reproducibilidad | [Package](C:/Users/Carl0/Desktop/Globows/globowslm/package.json:1) sin contrato Node/npm | Diferencias local/CI/Vercel | Acordar runtime y gestor; alinearlos en entornos | 0 | No, salvo política |
| **PR-22** | Baja · Foundation | [Layout](C:/Users/Carl0/Desktop/Globows/globowslm/src/app/layout.tsx:15), favicon y Page con `priority` | Template visible; idioma e identidad incorrectos para producto | Sustituir durante Sprint 1; metadata completa en Sprint 4 | 1 y 4 | No; branding requiere propietaria |
| **PR-23** | Media · Secuencia | [Sprint 3](C:/Users/Carl0/Desktop/Globows/globowslm/Docs/Planeacion/PlanDeImplementacion.md:162) sitúa helper requerido por CTA de Sprint 1 | Enlaces duplicados o provisionales | Adelantar helper y configuración pública a Sprint 1 | 1 | No |

### J. Plan de remediación priorizado

**Prioridad 1 — Cierre pre-repositorio de Sprint 0**

1. Actualizar README, identidad del paquete y exclusiones.
2. Definir runtime y typecheck con generación de tipos.
3. Resolver PR-01/PR-02 mediante remediación comprobada o aceptación temporal documentada.
4. Actualizar estado del plan, vigencia documental y cronograma.
5. Acordar política de ramas, CI mínimo y Preview/producción.
6. Revisar íntegramente la selección del primer commit.

Estas acciones requieren autorización posterior para editar o ejecutar validaciones generadoras.

**Prioridad 2 — Dependencias de contenido**

1. Logotipo, fotografía institucional y Hero apto.
2. Datos de contacto y mensajes contextualizados.
3. Fotografías por servicio y categorías disponibles.
4. Credenciales, organismos y evidencia.
5. Decisión de publicación u omisión de TrustSupport.

La solicitud y validación de contenido debe comenzar pronto. Su resolución continúa durante Sprints 1–3.

**Prioridad 3 — Implementación conforme al plan**

1. Tokens MID y escaneo Tailwind delimitado.
2. Layout e interacciones accesibles.
3. Helper WhatsApp desde Sprint 1.
4. Servicios completos y galería decorativa.
5. Formación, timeline de credenciales y cinco canales.
6. Evidencia y pruebas proporcionadas a cada interacción.

**Prioridad 4 — Release**

Hardening, QA formal, auditoría actualizada, contenido aprobado, dominio, promoción controlada y rollback. La estabilización tiene duración y responsable acordados.

### K. Dictamen de preparación

**READY WITH CONDITIONS.**

La Foundation es utilizable y la estructura no requiere reestructuración general. ESLint y TypeScript pasan, package/lockfile/instalación están alineados y la arquitectura reconciliada ofrece cobertura suficiente para iniciar desarrollo modular.

Las condiciones para cerrar Sprint 0 son:

- README e identidad correctos.
- Exclusiones revisadas.
- Typecheck preparado para checkout limpio.
- Tratamiento explícito de seguridad y soporte.
- CI y despliegue temprano coherentes.
- Estado documental actualizado o señalado claramente.

La disponibilidad incompleta de contenido **no impide preparar Git**, pero sí impide declarar V1 lista para producción. Antes de cerrar Sprint 1 deben estar resueltos sus assets y textos; antes de liberar V1 deben existir las evidencias obligatorias de servicios y credenciales.

No se justifica `NOT READY`: no se comprobó un fallo fundamental de arquitectura o compilación. Tampoco corresponde `READY` sin condiciones, porque el primer repositorio conservaría información operativa incorrecta y una preparación incompleta para reproducibilidad y seguridad.

### L. Checklist previo al primer commit

Lista pendiente para una fase posterior autorizada:

1. [ ] Confirmar esta raíz como único directorio del repositorio definitivo.
2. [ ] Actualizar README para Globows LM V1.0.0.
3. [ ] Acordar nombre del paquete y sincronizar package/lockfile.
4. [ ] Definir Node/npm para desarrollo, CI y Vercel.
5. [ ] Añadir typecheck con generación previa de tipos.
6. [ ] Revisar exclusiones de reporte local, cachés y futuras salidas E2E.
7. [ ] Conservar el bloque generado de `AGENTS.md`.
8. [ ] Identificar ADR como referencia estructural vigente y documentos anteriores como fuentes pendientes de normalización.
9. [ ] Registrar tratamiento de `braces` y ESLint fuera de soporte.
10. [ ] Revisar secretos, autorizaciones de assets y contenido que se hará público.
11. [ ] Confirmar inclusión deliberada de Docs, originales y legacy.
12. [ ] Configurar o dejar preparado CI mínimo con lint separado del build.
13. [ ] Validar instalación, typegen, typecheck y build desde un entorno limpio.
14. [ ] Revisar la selección exacta del primer commit después de autorizar Git.
15. [ ] Acordar ramas, protección y política de promoción a producción.
16. [ ] Preparar Vercel Preview sin presentar la Foundation como release comercial.

**Todos los archivos auditados permanecen intactos. No se implementaron correcciones ni se realizaron operaciones Git o despliegues.**

---

### Actualización de clasificación posterior al hardening — 13/10/2026

El texto anterior conserva el diagnóstico **histórico pre-corrección**. Esta actualización registra el estado observado tras las fases A–C; las referencias actuales de alcance y ejecución son [ERV1](../01-ERV1.md), [ADR D01–D09](../05-DiseñoUI_UX/05-ADR-Arquitectura-UI-Consolidada.md), [matriz](MatrizTrazabilidadV1.md) y [plan maestro](PlanDeImplementacion.md). «Resuelto» se refiere a la condición concreta del hallazgo, no a la V1 implementada.

| Hallazgo original | Clasificación actual | Evidencia / límite |
|---|---|---|
| PR-01 | **Alta abierta; aceptación pendiente** | `npm audit` sigue mostrando cinco altas de la cadena dev; [registro de riesgo](RegistroRiesgoDependencias.md) sin aprobación. `npm audit --omit=dev`: cero. |
| PR-02 | **Media abierta** | ESLint 9.39.5 continúa deprecado; migración mayor separada y sin compatibilidad aprobada. |
| PR-03, PR-04, PR-05, PR-06 | **Resueltos en Foundation local** | `typecheck` ejecuta `next typegen`; `.gitignore` excluye reportes/artefactos; README describe producto; package/lock sincronizados. `npm ci`, typegen, typecheck y lint se verificaron tras instalar en árbol nuevo. Build posterior sigue bloqueado por fuentes remotas del template. |
| PR-07, PR-08, PR-09 | **Resueltos documentalmente** | MID/UIA reconciliados con ADR; DocITyET ya no se cita como fuente de directorios; PlanAvance2 distingue objetivos académicos y plan productivo. |
| PR-10 | **Resuelto como planificación; aceptación futura** | Matriz local de 36 filas con responsables, pruebas, estado y evidencia; ninguna fila se marca implementada. |
| PR-11, PR-12, PR-13 | **Abiertos; contenido comercial condicionado** | Fotos, acreditaciones, fichas y enlaces del preview necesitan selección, permiso y aprobación. No se publicaron datos heredados. |
| PR-14 | **Abierto para sprints 1–4** | Aún no hay componentes interactivos reales que verificar por teclado/móvil. |
| PR-15 | **Limitación histórica conservada** | `legacy/index.html` permanece intacto y explícitamente separado de la app. No se repararon sus rutas relativas. |
| PR-16 | **Cambio aplicado, build pendiente** | Tailwind 4 escanea `src/` mediante `source("..")`; falta verificar CSS de producción cuando el build pueda completar la descarga de fuentes. |
| PR-17, PR-18 | **Preparados, no acreditados remotamente** | Workflow CI mínimo existe; plan separa Preview y producción. No hay GitHub Actions ni Vercel ejecutados. |
| PR-19, PR-20, PR-21, PR-23 | **Resueltos en contrato/plan local** | Timeline horizontal explícito en Sprint 3; estado Foundation actualizado; Node/npm declarados; helper WhatsApp previsto desde Sprint 1. |
| PR-22 | **Pendiente Sprint 1** | Layout, página y favicon del template se preservaron; idioma, metadata y branding oficiales siguen por implementar. |

**Dictamen actualizado:** **READY WITH CONDITIONS para preparar el primer commit**, condicionado a build reproducible en entorno conectado o abastecimiento oficial de fuentes, revisión de archivos a versionar y decisión responsable sobre riesgo dev antes de la integración. **Sprint 0 no está cerrado**: faltan Git, CI remoto y Preview; ningún despliegue ni contenido comercial se declara aprobado.
