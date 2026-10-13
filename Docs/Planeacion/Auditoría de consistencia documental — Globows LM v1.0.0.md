# Auditoría de consistencia documental — Globows LM v1.0.0

Informe técnico | 11 de octubre de 2026 | Segundo avance académico

Documentos auditados: ERP, ERV1, Brand Discovery, MID y UIA.

Objetivo: identificar contradicciones, omisiones, ambigüedades y decisiones pendientes que puedan comprometer la elaboración de los wireframes de alta fidelidad, la implementación en Next.js o la aceptación de la versión 1.0.0.

## 1. Dictamen ejecutivo

Conflictos críticos

# 5

Conflictos relevantes

# 7

Observaciones menores

# 5

Congelamiento condicionado

La V1 tiene una base coherente, pero no debe congelarse todavía.

Las contradicciones encontradas no justifican rediseñar todo el proyecto. Sí requieren consolidar una única especificación funcional y estructural antes de producir los wireframes definitivos.

Los 17 hallazgos de esta auditoría son una clasificación de revisión, no defectos de software comprobados.

### Fortalezas documentales confirmadas

Los cinco documentos mantienen una dirección estratégica consistente:

- Producto: presencia digital institucional antes de construir funcionalidades administrativas.
- Marca: decoración profesional y formación especializada como dos líneas de negocio complementarias.
- Experiencia: fotografía real, elegancia, confianza, navegación sencilla y contacto directo.
- Tecnología: Next.js, componentes reutilizables, desarrollo mobile-first y crecimiento modular.
- Evolución: desarrollo incremental hacia una plataforma integral, sin introducir anticipadamente las funcionalidades de las siguientes versiones.

El principal problema no es una falta de visión, sino la existencia de diferentes definiciones de una misma interfaz y algunos compromisos funcionales que desaparecen al pasar de requerimientos a arquitectura.

## 2. Jerarquía de autoridad documental

Antes de resolver conflictos debemos establecer qué documento gobierna cada decisión. La secuencia de elaboración no significa que el último documento pueda modificar silenciosamente los requisitos anteriores.

| Documento       | Autoridad principal                                 | No debería modificar unilateralmente |
| --------------- | --------------------------------------------------- | ------------------------------------ |
| ERP             | Visión del negocio, límites y evolución             | Identidad visual específica          |
| ERV1            | Funcionalidades obligatorias y aceptación V1        | Alcance de futuras versiones         |
| Brand Discovery | Identidad, públicos, posicionamiento y comunicación | Arquitectura técnica                 |
| MID             | Tokens, identidad visual, UX y componentes          | Requerimientos funcionales ERV1      |
| UIA             | Estructura, navegación y composición de componentes | Reglas de marca o alcance aprobado   |

Regla de resolución propuesta: cuando dos documentos discrepen, se conserva provisionalmente el requerimiento aprobado de mayor autoridad en esa materia. Cualquier cambio de alcance deberá aprobarse explícitamente y reflejarse en todos los documentos afectados.

Esto es particularmente importante porque tanto el MID como la UIA contienen decisiones estructurales que no coinciden completamente con ERV1.

## 3. Hallazgos críticos

Son los hallazgos que pueden provocar implementar una plataforma funcionalmente incompleta o diseñar una interfaz incompatible con su especificación.

### H-01. Tres definiciones diferentes de la arquitectura de la Landing

Crítico · Decisión obligatoria

Evidencia documental

ERV1, apartado 4: requiere Hero, presentación del negocio, historia, filosofía, trayectoria, certificaciones, CTA, catálogo de servicios, galería por categorías y contacto.

MID, apartado 18: propone:

Hero

Sobre Licey

Servicios

Galería destacada

Cursos y formación

Certificaciones

Testimonios

Galería por categorías

FAQ

CTA

Footer

UIA, apartados 4, 5 y 7: define Hero, About, Events, Gallery, Courses, Certifications y Contact, con Navbar y Footer en el Layout.

Diagnóstico

La UIA introduce `EventsSection`, elimina la sección explícita de servicios y concentra la presentación en siete secciones. También omite Testimonios y FAQ respecto al MID.

No es simplemente una diferencia de nombres: puede cambiar el recorrido de usuario y dejar sin representación algunas obligaciones de ERV1.

Resolución propuesta

Adoptar una arquitectura consolidada que integre las dos líneas de negocio y cumpla ERV1. Mantener como criterio que cada sección tenga una responsabilidad clara y que algunas funciones puedan resolverse dentro de otras secciones sin exigir una sección independiente.

Requiere aprobación: sí. Es la principal decisión de composición de toda la Landing.

### H-02. El catálogo de servicios pierde trazabilidad en UIA

Crítico · Decisión obligatoria

Evidencia

ERV1, apartado Servicios, exige al menos:

- Decoraciones profesionales.
- Cursos presenciales.
- Talleres intensivos.
- Certificaciones.
- Asesorías.

Además, cada servicio debe presentar nombre, descripción, imagen representativa y botón de contacto.

La UIA sustituye el concepto por `EventsSection`, `GallerySection` y `CoursesSection`, sin describir cómo quedarían cubiertos los cinco servicios.

Diagnóstico

Una cuadrícula de tipos de eventos no necesariamente equivale a un catálogo de servicios. Además, la galería demuestra trabajos realizados, pero no sustituye la explicación comercial de cada servicio.

Resolución propuesta

Separar conceptualmente:

- Servicios: qué puede contratar o solicitar el visitante.
- Eventos: para qué ocasiones se realizan decoraciones.
- Galería: evidencia visual de trabajos realizados.
- Formación: capacitación, talleres y certificaciones.

Estas responsabilidades podrían materializarse en secciones independientes o agruparse mediante una composición aprobada.

Requiere aprobación: sí. Debemos decidir si `EventsSection` permanece independiente o se integra a Servicios y Galería.

### H-03. Conflicto sobre el comportamiento del Hero

Crítico · Decisión obligatoria

Evidencia

MID, apartado 20: una única fotografía de alto impacto para el Hero.

UIA, apartados 5 y 9: `HeroCarousel` automático, con múltiples fotografías, overlay, logotipo, título, subtítulo e indicador de desplazamiento.

Diagnóstico

Ambas implementaciones representan comportamientos distintos, con consecuencias directas para rendimiento, accesibilidad, diseño responsive y producción de assets.

Resolución propuesta

Mi preferencia técnica sería un Hero estático con una fotografía protagonista, porque responde literalmente a la estrategia fotográfica del MID y simplifica el rendimiento inicial.

Sin embargo, no recomendaría eliminar el carrusel de la UIA sin tu autorización, porque se trata de una decisión de diseño previamente documentada.

Requiere aprobación: sí.

### H-04. Testimonios, preguntas frecuentes y CTA no tienen implementación estructural explícita

Crítico · Decisión obligatoria

Evidencia

MID, apartados 12 y 18: identifica `TestimonialCard`, FAQ y secciones específicas de testimonios, preguntas frecuentes y llamado final a la acción.

La UIA no representa esos componentes en su arquitectura principal.

ERV1 no exige explícitamente testimonios ni FAQ como apartados independientes, aunque sí contempla llamadas a la acción.

Diagnóstico

Aquí existen dos tipos de conflicto:

- CTA: su presencia está respaldada por ERV1, por lo que debe mantenerse, aunque no necesariamente como sección separada.
- Testimonios y FAQ: aparecen en el MID como parte de la experiencia propuesta, pero no como obligaciones expresas del ERV1.

Resolución propuesta

Mantener un CTA final de conversión. Clasificar FAQ y Testimonios como componentes sujetos a disponibilidad de contenido real y a una decisión de alcance.

Requiere aprobación: sí, principalmente para FAQ y testimonios.

### H-05. El roadmap de versiones no es consistente

Crítico para planificación · No bloquea por sí solo la composición visual V1

Evidencia

| Versión | ERP                                  | MID, apartado 23      |
| ------- | ------------------------------------ | --------------------- |
| V1      | Landing institucional                | Landing institucional |
| V2      | CMS y administración de contenido    | CMS administrativo    |
| V3      | Agenda, clientes, CRM, cotizaciones  | Campus digital        |
| V4      | Formación digital                    | Portal de alumnos     |
| V5      | Ecosistema integral y automatización | ERP Globows LM        |

Diagnóstico

El roadmap del MID adelanta capacidades educativas respecto al ERP y desplaza las funcionalidades operativas. La UIA reproduce la evolución CMS → Campus → Portal → ERP.

Esto afectaría las decisiones de extensibilidad y la planificación de V2.

Resolución propuesta

Mantener el ERP como referencia provisional del roadmap funcional, porque es el documento de visión de negocio. No obstante, reconozco que el MID podría reflejar una decisión estratégica posterior que no fue incorporada al ERP.

Requiere aprobación: sí, antes de formalizar el roadmap futuro. Para congelar la V1 basta con acordar que el siguiente incremento es un CMS administrativo, sin resolver todavía toda la evolución V3–V5.

## 4. Hallazgos relevantes

Estos hallazgos no implican necesariamente incumplimiento funcional, pero podrían producir ambigüedad durante el Design Handoff, desarrollo o validación.

### H-06. Clasificación de galerías no consolidada

Evidencia: ERV1 propone categorías como Bodas, XV años, Baby Shower, Graduaciones, Eventos corporativos, Cursos, Talleres y Certificaciones. El MID, apartado 20, propone Bodas, XV años, Cumpleaños, Baby Shower y Temáticos, con cuatro a seis fotografías por categoría. La UIA no establece taxonomía.

Riesgo: mezclar fotografías de servicios, ocasiones y formación bajo categorías inconsistentes.

Propuesta: definir una taxonomía inicial de galería de trabajos, diferenciándola de la galería de formación y certificaciones cuando sea necesario.

Decisión: aprobar categorías iniciales y determinar si la galería contiene exclusivamente decoraciones o todas las actividades profesionales.

### H-07. Los canales del menú flotante no coinciden completamente

Evidencia: ERV1, apartado Redes Sociales, exige WhatsApp, Facebook, Instagram, TikTok y correo electrónico. MID, apartado 19, y UIA, apartado 10, contemplan solo los primeros cuatro.

Riesgo: incumplimiento directo de un requerimiento de ERV1.

Propuesta: incorporar correo electrónico al menú flotante y mantener la información de contacto correspondiente en el Footer, salvo que se apruebe formalmente modificar ERV1.

Decisión: confirmar el correo oficial y validar la inclusión del acceso `mailto:`.

### H-08. Modelo de conversión insuficientemente especificado

Evidencia: el Brand Discovery establece dos públicos objetivo: clientes de decoraciones y personas interesadas en formación. El MID propone WhatsApp como CTA principal, mientras ERV1 habla de contacto y presentación del catálogo.

Riesgo: que todas las acciones de la Landing terminen en una conversación genérica sin contexto.

Propuesta: mantener WhatsApp como canal principal, pero utilizar mensajes predefinidos según el origen: decoración, curso, taller, asesoría o certificación.

Esto no exige backend ni sistemas de reserva.

Decisión: aprobar los tipos de CTA y sus mensajes, sin asumir que se permiten reservas automáticas.

### H-09. Contenido institucional incompleto para la composición final

Evidencia: Brand Discovery mantiene pendiente el origen del nombre. ERV1 solicita historia, filosofía, trayectoria y certificaciones. MID exige fotografía real y presentación profesional.

Riesgo: producir wireframes visualmente completos que dependan de contenido ficticio o que todavía no esté validado por la propietaria.

Propuesta: elaborar un inventario de contenido con estado de disponibilidad y aprobación de cada elemento. No inventar testimonios, certificaciones, fechas ni reconocimientos.

Decisión: validar qué contenido estará disponible para el lanzamiento. El origen del nombre puede mantenerse pendiente si no se necesita publicarlo, pero deberá quedar identificado.

### H-10. Reglas de responsive sin comportamiento de componentes

Evidencia: MID define enfoque mobile-first y breakpoints concretos. UIA describe un `MobileMenu`, carrusel, galerías y timeline, pero no especifica cómo cambian entre dispositivos.

Riesgo: decisiones improvisadas durante la implementación, especialmente en el menú flotante, la galería y el timeline horizontal de certificaciones.

Propuesta: formalizar estados mobile, tablet y desktop para cada componente importante, conservando los tokens del MID.

Decisión: aceptar una especificación responsive por componente como parte obligatoria del Design Handoff.

### H-11. Movimiento y accesibilidad requieren contratos de interacción

Evidencia: MID permite Fade, Slide, Scale y Scroll Reveal, con transiciones generalmente de 200–300 ms. También requiere navegación por teclado, foco visible, contraste AA y controles táctiles de 44 px. UIA introduce un carrusel automático.

Riesgo: implementar interacciones visuales que obstaculicen navegación o accesibilidad.

Propuesta: documentar estados de hover, focus, active, controles de reproducción cuando correspondan y comportamiento ante `prefers-reduced-motion`.

Decisión: confirmar que la adaptación al movimiento reducido es un criterio obligatorio de implementación y no solo una recomendación.

### H-12. Especificación incompleta de SEO y distribución técnica

Evidencia: ERV1 exige SEO básico, carga rápida y despliegue en Vercel. MID requiere WebP, lazy loading, `next/image` y `next/font`. La UIA no describe contratos SEO, metadata ni estrategia de generación de páginas.

Riesgo: dar por completado el diseño mientras faltan elementos importantes para una Landing productiva.

Propuesta técnica: definir metadata, Open Graph, sitemap, robots, contenido semántico, estrategias de imágenes y generación estática donde corresponda.

Estos elementos son una ampliación técnica propuesta para satisfacer objetivos ya existentes, no funcionalidades de negocio adicionales.

Decisión: aprobar criterios verificables para SEO, rendimiento y accesibilidad.

## 5. Observaciones menores y deuda documental

| ID   | Observación                                                                                                                         | Resolución propuesta                                                         |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| H-13 | ERV1 conserva fechas de julio y agosto de 2026 ya vencidas.                                                                         | Crear un cronograma del segundo avance sin alterar el historial.             |
| H-14 | MID se declara cerrado, pero contiene un bloque de redacción conversacional antes del apartado 18.                                  | Normalizar su presentación editorial, conservando las decisiones vigentes.   |
| H-15 | UIA figura como «En construcción» aunque concluye que su arquitectura está completa.                                                | Mantenerla en revisión hasta resolver los hallazgos.                         |
| H-16 | UIA depende de `DocITyET`, pero ese documento no forma parte de los cinco archivos recibidos.                                       | Auditarlo antes de cerrar convenciones técnicas y estructura de repositorio. |
| H-17 | UIA enumera componentes futuros como `BlogCard`, `Calendar`, `DashboardCard`, `NotificationCard` y otros sin contratos funcionales. | Mantenerlos como proyección, sin implementaciones anticipadas en V1.         |

Es importante destacar que H-16 es una limitación de cobertura de esta auditoría. No podemos asegurar que las convenciones técnicas de UIA sean plenamente consistentes con `DocITyET` sin examinar ese documento.

También conviene conservar íntegros los valores oficiales del MID: colores, tipografías, escala de espaciado, radios, iconografía, composición y reglas de uso del logotipo. No encontré un motivo documental suficiente para rediseñar esa identidad.

## 6. Matriz de trazabilidad de requerimientos

El siguiente cruce permite observar qué requerimientos tienen una representación inequívoca en la UIA actual y cuáles necesitan reconciliación.

| Requerimiento ERV1      | Representación UIA                 | Resultado                                      |
| ----------------------- | ---------------------------------- | ---------------------------------------------- |
| Hero principal          | `HeroSection`                      | Cubierto; comportamiento en conflicto          |
| Presentación e historia | `AboutSection`                     | Cubierto                                       |
| Filosofía y trayectoria | `AboutSection`                     | Cobertura implícita, validar contenido         |
| Servicios               | `EventsSection` y `CoursesSection` | Cobertura incompleta                           |
| Galería por categorías  | `GallerySection`                   | Cubierto estructuralmente; taxonomía pendiente |
| Certificaciones         | `CertificationsSection`            | Cubierto                                       |
| Contacto                | `ContactSection`                   | Cubierto                                       |
| Menú flotante           | `FloatingContactMenu`              | Falta correo electrónico                       |
| Redes oficiales         | Componentes de redes               | Cobertura parcial                              |
| CTA                     | `ContactCTA`                       | Cubierto, pendiente de definir comportamiento  |
| Diseño responsive       | `MobileMenu` y estructura          | Pendiente de especificación detallada          |
| SEO básico              | Sin representación explícita       | Requiere contrato técnico                      |
| Accesibilidad           | Reglas MID                         | Requiere verificación de implementación        |

Conclusión de trazabilidad: la UIA es una base técnicamente utilizable, pero no debería tratarse todavía como la especificación estructural definitiva. El déficit más importante es la pérdida de trazabilidad del catálogo de servicios.

## 7. Arquitectura consolidada propuesta para aprobación

Para no diseñar tres versiones distintas de la misma Landing, recomiendo establecer una sola estructura objetivo.

La siguiente propuesta conserva el recorrido comercial del MID, la organización modular de la UIA y los requerimientos de ERV1. Todavía no es una arquitectura aprobada.

PROPUESTA DE COMPOSICIÓN V1.0.0

Navbar

Navegación principal y móvil

01 · Hero

Fotografía protagonista, identidad y CTA

02 · Sobre Licey Márquez

Historia, trayectoria y filosofía

03 · Servicios y Eventos

Decoraciones, ocasiones y oferta profesional

04 · Galería de Decoraciones

Portafolio fotográfico por categorías

05 · Formación Profesional

Cursos, talleres, asesorías y formación

06 · Certificaciones

Credenciales, organismos y evidencias

07 · Confianza y Orientación

Testimonios y/o FAQ, sujetos a aprobación

08 · Contacto y CTA Final

Conversión hacia WhatsApp y canales oficiales

Footer

Información institucional y enlaces

FloatingContactMenu

Componente global, accesible durante todo el recorrido

### Justificación estructural

Esta distribución organiza la experiencia en tres momentos:

1. Descubrimiento y confianza: Hero y Sobre Licey.
2. Exploración de la oferta: Servicios, Galería, Formación y Certificaciones.
3. Resolución de dudas y conversión: Testimonios/FAQ y Contacto.

No significa que cada servicio necesite una ruta independiente. ERV1 y UIA permiten mantener una navegación tipo Landing de una sola página.

Además, la propuesta conserva una separación útil para la futura V2: los componentes de presentación podrán recibir contenido administrado sin necesidad de reemplazar por completo su estructura.

## 8. Registro de decisiones arquitectónicas y de negocio

Esta es la parte que necesitamos resolver juntos antes del congelamiento.

He separado las decisiones que modifican o definen la experiencia de negocio de las que puedo resolver técnicamente bajo los requisitos existentes.

Cuestionario de aprobación

Las recomendaciones no se consideran aprobadas hasta que las selecciones.

0 de 9

D01

Arquitectura principal de la Landing

Define la composición y orden de las secciones.

Adoptar las 8 secciones consolidadas (recomendado)

Conservar las 7 secciones de UIA y corregir cobertura

Usar la secuencia completa del MID

D02

Servicios y tipos de eventos

ERV1 exige servicios, mientras UIA destaca EventsSection.

Integrar Servicios y Eventos en una sección (recomendado)

Crear secciones independientes

Redefinir la distribución posteriormente

D03

Hero de la página

MID especifica una fotografía; UIA especifica un carrusel automático.

Fotografía única de alto impacto (recomendado)

Carrusel automático de fotografías

Carrusel controlado manualmente

D04

Testimonios y FAQ

Son parte del MID, pero no requisitos obligatorios explícitos de ERV1.

Conservar ambos y completar el contenido real

Implementar solo lo que tenga contenido validado (recomendado)

Excluir ambos de V1 mediante control de cambios

D05

Galerías fotográficas

Es necesario diferenciar los trabajos decorativos de las evidencias de formación.

Galería de decoraciones y evidencias dentro de Formación/Certificaciones (recomendado)

Una sola galería con todas las categorías

Galería global más galerías secundarias

D06

Conversión mediante WhatsApp

Define qué sucede cuando el usuario solicita información.

Enlace con mensaje específico por servicio (recomendado)

Un único mensaje general para todos los CTA

D07

Correo electrónico en menú flotante

ERV1 lo exige; MID y UIA lo omiten.

Incluir correo y respetar ERV1 (recomendado)

Solo en Footer, modificando ERV1 formalmente

D08

Roadmap posterior a V2

ERP y MID presentan evoluciones diferentes.

Conservar roadmap ERP como referencia (recomendado)

Adoptar roadmap MID

Congelar solo V1 → V2 y revisar V3–V5 después

D09

Contenido faltante

Debe existir una política sobre fotografías, testimonios y credenciales aún no disponibles.

Publicar solo contenido real y validado (recomendado)

No cerrar V1 hasta recibir todos los assets previstos

Observaciones o decisiones alternativas

&#x20;Enviar decisiones para consolidaciónAdmite respuestas parciales. Las decisiones no seleccionadas permanecerán pendientes.

### Decisiones técnicas que recomiendo delegar a la especificación de implementación

Las siguientes no deberían requerir una nueva aprobación de negocio mientras se mantengan los requisitos existentes:

| Área          | Resolución técnica propuesta                                         |
| ------------- | -------------------------------------------------------------------- |
| Framework     | Next.js con TypeScript, según MID                                    |
| Estilos       | Tailwind CSS y tokens centralizados                                  |
| Componentes   | Reutilización mediante composición y separación de responsabilidades |
| Imágenes      | `next/image`, formatos optimizados y tamaños responsivos             |
| Navegación    | Anclas semánticas y desplazamiento entre secciones                   |
| Animaciones   | Preferencias de movimiento reducido y respeto al MID                 |
| SEO           | Metadata, semántica y configuración de indexación                    |
| Responsive    | Especificación mobile-first por componente                           |
| Accesibilidad | Criterios WCAG AA aplicables y pruebas                               |
| Documentación | Contratos de componentes, estados y evidencia de Design QA           |

La elección concreta de patrones de implementación se validará durante la arquitectura técnica si surge un trade-off relevante.

## 9. Documentos y artefactos que deben actualizarse

No recomiendo reescribir completamente los cinco documentos. La corrección debe ser controlada y trazable.

| Documento              | Acción requerida                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `00-ERP.md`            | Mantener como registro histórico. Si cambia el roadmap, registrar una decisión complementaria. |
| `01-ERV1.md`           | Modificar solo los requerimientos cuyo alcance se apruebe cambiar.                             |
| `02-BrandDiscovery.md` | Completar información pendiente con validación de Licey.                                       |
| `03-MID.md`            | Corregir contradicciones del Hero, arquitectura y roadmap; normalizar formato editorial.       |
| `04-UIArquitecture.md` | Consolidar secciones, navegación, componentes y contratos responsive.                          |

Adicionalmente propongo producir cuatro artefactos de trabajo nuevos.

01 — Registro de Decisiones y Reconciliación Documental

Hallazgos, decisiones aprobadas, justificaciones, documentos afectados y estado de resolución.

02 — Matriz de Trazabilidad V1.0.0

Requerimientos → secciones → componentes → criterios de aceptación → pruebas.

03 — Especificación Consolidada de UI V1.0.0

Estructura final de la Landing, jerarquía de componentes, navegación, variantes y estados.

04 — Inventario de Contenido y Assets

Fotografías, textos, logotipo, certificaciones, testimonios y enlaces, con responsables y disponibilidad.

Estos artefactos complementan la documentación oficial; no sustituyen sus responsabilidades.

## 10. Condiciones de congelamiento del diseño

Para declarar la arquitectura y el diseño de V1.0.0 congelados, propongo exigir:

- Los hallazgos H-01 a H-05 resueltos y aprobados.
- Los hallazgos H-06 a H-12 resueltos o registrados como decisiones explícitas y verificables.
- Matriz de trazabilidad sin requerimientos obligatorios sin cobertura.
- Inventario de contenido completo respecto a los elementos necesarios para el diseño, identificando pendientes de producción.
- Contratos de interacción para componentes críticos.
- Especificación responsive y accesibilidad incorporadas al Design Handoff.
- Wireframes de alta fidelidad validados contra la arquitectura aprobada.
- Estado documental y versiones normalizados.

Una precisión importante: debemos distinguir el congelamiento de la arquitectura de UI del congelamiento del diseño visual Hi-Fi. Primero aprobamos la organización, los comportamientos y el contenido requerido; después construimos y validamos los wireframes. Solo entonces congelamos el diseño completo.

## 11. Dictamen final de la auditoría

Identidad y dirección de producto: consistentes.

Alcance V1: suficientemente especificado en ERV1.

Arquitectura UI: requiere reconciliación.

Inventario de contenido: incompleto o no verificado.

Roadmap posterior: presenta contradicciones.

Mi evaluación es que no necesitamos replantear Globows LM v1.0.0, sino cerrar correctamente la transición entre requerimientos, sistema de diseño y arquitectura de interfaz.

Los documentos ya proporcionan una base considerable para desarrollar una Landing profesional con Next.js. El riesgo principal sería comenzar a codificar antes de determinar qué versión de la estructura de secciones es la oficial.



# Globows LM v1.0.0 — Inicio de implementación

## 1. Nuevo objetivo de ejecución

Construir, desplegar y entregar Globows LM v1.0.0 como una aplicación Next.js productiva, utilizando como referencia el preview existente y como contratos funcionales el ERP y ERV1.

La secuencia queda así:

Etapa anterior — Completada

Requerimientos, Brand Discovery, MID, UIA y preview visual

Etapa actual — Desarrollo V1.0.0

Nuevo repositorio · Next.js · Implementación integral · Vercel

Etapa posterior — Evolución

Estabilización V1.0.0 + diseño de ERV2 en paralelo

La V1 será una aplicación real en producción, no un prototipo académico. El segundo avance de la materia se documentará a partir del trabajo de implementación, pruebas y despliegue efectivamente realizado.

## 2. Decisiones que damos por establecidas

| Elemento          | Decisión                                         |
| ----------------- | ------------------------------------------------ |
| Producto          | Globows LM v1.0.0                                |
| Repositorio       | `GlobowslmV1.0.0` (nuevo)                        |
| Framework         | Next.js                                          |
| Lenguaje          | TypeScript                                       |
| Estilos           | Tailwind CSS                                     |
| Componentes UI    | shadcn/ui                                        |
| Animaciones       | Framer Motion / Motion                           |
| Hosting           | Vercel                                           |
| Diseño visual     | Preview existente + MID                          |
| Alcance funcional | ERP + ERV1                                       |
| Arquitectura      | UIA reconciliada                                 |
| Desarrollo        | Mobile-first, modular y basado en componentes    |
| Versiones futuras | ERV2 se diseñará durante la estabilización de V1 |

No incorporaremos backend, base de datos, autenticación ni CMS en esta versión. Eso no impide que el sitio sea completamente productivo: la V1 es una Landing institucional cuya funcionalidad se centra en presentar el negocio, exhibir sus servicios y facilitar contacto comercial.

## 3. Arquitectura de código inicial

Para el repositorio `GlobowslmV1.0.0`, propongo organizar Next.js por responsabilidades, reutilizando el trabajo de diseño existente sin copiar las limitaciones técnicas del preview.

```
GlobowslmV1.0.0/
├── public/
│   ├── images/
│   │   ├── brand/
│   │   ├── hero/
│   │   ├── events/
│   │   ├── gallery/
│   │   ├── courses/
│   │   └── certifications/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── sections/
│   │       ├── hero/
│   │       ├── about/
│   │       ├── services-events/
│   │       ├── gallery/
│   │       ├── courses/
│   │       ├── certifications/
│   │       ├── trust-support/
│   │       └── contact/
│   │
│   ├── config/
│   ├── content/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── types/
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── .github/
│   └── workflows/
│
├── package.json
├── tsconfig.json
└── README.md
```

Esta estructura es un punto de partida de implementación, no una invitación a construir todos los directorios o abstraer componentes antes de necesitarlos.

### Decisiones técnicas de implementación

1\. Server Components por defecto. Reservaremos los Client Components para elementos que realmente necesitan interacción, como el menú móvil, el menú flotante o filtros de galería.

2\. Contenido estático desacoplado. Textos, servicios, enlaces y referencias de imágenes podrán organizarse en archivos tipados de `src/content/` y `src/config/`. No crearemos una capa de repositorios, servicios o interfaces de backend ficticias.

3\. Optimización desde el inicio. Utilizaremos `next/image`, `next/font`, metadata y carga diferida donde corresponda. Next.js permite prerenderizar contenido y Vercel admite despliegues conectados a Git.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://nextjs.org\&sz=32)

Next.js

+1



4\. Design System implementado, no rediseñado. Traduciremos los tokens existentes del MID a CSS/Tailwind, conservando identidad, tipografías, espaciado, colores y reglas de composición.

## 4. Orden de implementación

| Sprint | Objetivo                                      | Resultado                                      |
| ------ | --------------------------------------------- | ---------------------------------------------- |
| 0      | Crear repositorio y Foundation Next.js        | Proyecto compilable, estructura base y tokens  |
| 1      | Layout, Hero, About                           | Identidad institucional y navegación funcional |
| 2      | Servicios, Eventos y Galería                  | Oferta comercial y portafolio                  |
| 3      | Cursos, Certificaciones y Contacto            | Segunda línea de negocio y conversión          |
| 4      | Responsive, SEO, accesibilidad y optimización | V1 funcionalmente completa                     |
| 5      | QA, CI/CD y Vercel                            | V1.0.0 productiva                              |

No esperaremos al Sprint 5 para desplegar. Recomiendo conectar Vercel desde el Sprint 0 y utilizar Preview Deployments durante el desarrollo.

### Primeros comandos del proyecto

Para evitar posibles discrepancias entre el nombre de GitHub y el nombre del paquete npm, usaría el directorio local en minúsculas y renombraría el repositorio remoto como acordamos.

```
npx create-next-app@latest globowslm-v1 \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm
```

En Windows PowerShell podemos ejecutarlo en una sola línea. La CLI oficial admite estas opciones y requiere Node.js 20.9 o superior.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://nextjs.org\&sz=32)

Next.js

+1



Después estableceremos el repositorio GitHub `GlobowslmV1.0.0`, las ramas de trabajo y la conexión con Vercel. No he creado todavía ese repositorio remoto.

## 5. Lo que necesitamos del preview

El preview ahora deja de ser un entregable de diseño y pasa a ser nuestra referencia de implementación.

La estrategia es conservar su dirección visual y experiencia, pero desarrollar componentes Next.js mantenibles y optimizados. No asumiré que su código generado es adecuado para producción sin revisarlo.

La única dependencia inmediata que necesito identificar es el repositorio o directorio donde está el preview actual. Con eso podremos auditar su estructura, recursos y estilos, determinar qué se puede reutilizar y empezar la Foundation real.

Una pregunta para comenzar directamente el Sprint 0: ¿me compartes el enlace del repositorio GitHub donde está el preview de Globows LM?

A partir de él trabajaremos sobre código real y el nuevo repositorio `GlobowslmV1.0.0`, sin volver a abrir una fase de modelado UX/UI.

# Globows LM v1.0.0 — Cierre de auditoría y preparación de la implementación

El resultado de Codex confirma que podemos continuar con el proyecto sin reconstruir la Foundation. También respalda tu propuesta de realizar una consolidación documental antes de inicializar Git y crear la estructura definitiva de Next.js.

La secuencia que recomiendo ahora es:

Consolidación documental → Hardening de Foundation → Creación de estructura base → Validación → Primer commit → Desarrollo por sprints.

No regresaremos al prototipado. La consolidación servirá para eliminar contradicciones de los documentos existentes y asegurar que el código que comencemos a escribir responda a una única especificación vigente.

## 1. Evaluación del informe de Codex

READY WITH CONDITIONS

Dictamen técnicamente razonable

La aplicación compila, el typecheck y ESLint pasan, y Next.js está configurado correctamente. No se detectó un defecto arquitectónico que obligue a reiniciar el proyecto.

Foundation

## Operativa

Documentación

## Por consolidar

Repositorio Git

## No inicializado

Producto V1

## Sin implementar

### Hallazgos que sí debemos atender

| Prioridad | Hallazgo                                                | Acción                                                |
| --------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Alta      | Dependencia vulnerable `braces` en herramientas de lint | Documentar tratamiento y revisar opciones compatibles |
| Alta      | Assets incompletos para una V1 comercial                | Solicitar recursos y validación a Licey               |
| Media     | MID y UIA conservan decisiones anteriores al ADR        | Consolidar documentación                              |
| Media     | Plan maestro con estados desactualizados                | Actualizar sprints, dependencias y criterios          |
| Media     | README aún describe el preview                          | Sustituir por README de V1                            |
| Media     | Typecheck depende de tipos generados                    | Automatizar `next typegen` antes de `tsc`             |
| Media     | `legacy/` participa en el escaneo de Tailwind           | Excluirlo del escaneo de clases                       |
| Media     | CI todavía no existe                                    | Implementar validaciones desde Sprint 0               |

El informe también corrige algo importante: los cinco avisos de `npm audit` derivan de una misma vulnerabilidad raíz de `braces`, que afecta al árbol de herramientas de desarrollo. No debemos confundir cinco avisos con cinco vulnerabilidades independientes ni asumir que `npm audit --omit=dev` garantiza ausencia completa de riesgo.

Además, Codex verificó que los recursos disponibles no cubren todavía todas las necesidades fotográficas y de certificaciones. Esto no bloquea la creación del repositorio, pero sí debe bloquear la publicación comercial de contenido incompleto o no aprobado.

## 2. Consolidación documental: qué propongo hacer

No recomiendo fusionar todos los documentos en uno. Eso eliminaría la separación de responsabilidades que ya tenemos.

Lo correcto es consolidar la autoridad, vigencia, trazabilidad y consistencia, conservando los documentos especializados.

Estructura documental objetivo

```
Docs/
├── Index.md
├── 00-ERP.md
├── 01-ERV1.md
│
├── 05-DiseñoUI_UX/
│   ├── Investigacion/
│   │   └── DocITyET.md
│   ├── 02-BrandDiscovery.md
│   ├── 03-MID.md
│   ├── 04-UIArquitecture.md
│   └── 05-ADR-Arquitectura-UI-Consolidada.md
│
└── Planeacion/
    ├── Auditoría de consistencia documental...
    ├── PlanAvance2.md
    ├── PlanDeImplementacion.md
    └── MatrizTrazabilidadV1.md  [nuevo]
```

Propongo cinco trabajos concretos:

C-01. Consolidar las fuentes funcionales. Mantener ERP y ERV1 como autoridad del negocio y requerimientos, respectivamente. No modificar su alcance sin aprobación.

C-02. Normalizar MID y UIA. Incorporar las nueve decisiones aprobadas, corregir referencias obsoletas y resolver la atribución incorrecta a DocITyET, manteniendo el ADR como registro de decisiones.

C-03. Actualizar el Plan de Implementación. Convertirlo en un instrumento operativo que registre los siete sprints, dependencias, estado real, entregables, pruebas y condiciones para avanzar. CI comienza desde Sprint 0, no desde Sprint 5.

C-04. Crear la matriz de trazabilidad V1. Vincular cada requerimiento de ERV1 con sus componentes, sprint, pruebas y evidencia. Esto permitirá medir cobertura real y evitar que una funcionalidad quede fuera.

C-05. Actualizar `Docs/Index.md`. Identificar fuentes vigentes, documentos históricos y módulos futuros para que tanto tú como Codex puedan determinar cuál documento gobierna cada decisión.

La auditoría original permanecería como registro histórico; no hace falta reescribirla para eliminar preguntas que posteriormente fueron resueltas.

## 3. Sobre crear toda la estructura Next.js desde el principio

Aquí sí comparto tu intención, con una precisión arquitectónica importante.

Es conveniente preparar desde Sprint 0 los directorios principales de la plataforma, pero no crear componentes vacíos para todas las funcionalidades futuras.

Hay una diferencia entre establecer la organización del código y simular que los módulos ya existen.

Para Globows propongo la siguiente estructura base:

```
globowslm/
├── Docs/
├── assets/
├── legacy/
├── public/
│   └── images/
│       ├── brand/
│       ├── hero/
│       ├── about/
│       ├── services/
│       ├── gallery/
│       ├── courses/
│       └── certifications/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── sections/
│   │   │   ├── hero/
│   │   │   ├── about/
│   │   │   ├── services-events/
│   │   │   ├── gallery/
│   │   │   ├── courses/
│   │   │   ├── certifications/
│   │   │   ├── trust-support/
│   │   │   └── contact/
│   │   └── shared/
│   │
│   ├── config/
│   ├── content/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── types/
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── .github/
│   └── workflows/
│
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── AGENTS.md
└── README.md
```

Esta organización conserva espacio para la evolución, especialmente mediante la separación entre componentes visuales, contenido y configuración.

No crearíamos todavía módulos como `admin/`, `auth/`, `database/`, `crm/` o `cms/`, porque pertenecen a versiones posteriores cuyo diseño técnico todavía no está aprobado. Cuando diseñemos ERV2 podremos incorporarlos sin necesidad de rehacer la Landing.

Tampoco crearíamos un componente distinto para cada tarjeta antes de conocer cuáles requieren reutilización real.

Una advertencia práctica: Git no versiona directorios vacíos. Cuando preparemos los comandos PowerShell, definiremos qué directorios necesitan archivos iniciales reales y cuáles pueden utilizar temporalmente `.gitkeep`, sin llenar el proyecto de componentes ficticios.

## 4. Secuencia definitiva de trabajo

Paso 1 — Consolidación documental

Actualizar fuentes vigentes, planes y matriz de trazabilidad, sin cambiar D01–D09.

Siguiente

Paso 2 — Hardening de Foundation

Resolver README, metadatos, scripts, `.gitignore`, reproducibilidad y tratamiento de dependencias.

Paso 3 — Preparación de estructura

Ejecutar los comandos PowerShell para crear los directorios y archivos base aprobados.

Paso 4 — Repositorio

Validar desde un estado limpio, revisar archivos a versionar, configurar Git, CI y primer commit.

Paso 5 — Desarrollo de producto

Implementar las secciones y funcionalidades ERV1 siguiendo el plan maestro hasta el release V1.0.0.

## 5. Dos precisiones antes de continuar

Primero, el informe de Codex no aporta razones para reemplazar Next.js 16.4.0 ni modificar ahora `cacheComponents`, `partialPrefetching` o Turbopack. La configuración actual es válida y el build fue satisfactorio.

Segundo, el inventario de contenido debe gestionarse en paralelo con el desarrollo, especialmente las fotografías, certificaciones y logotipo oficial. Esperar hasta Sprint 3 para solicitar esos recursos podría impedir la publicación de V1 aunque el código esté completo.

Mi recomendación es comenzar ahora con la consolidación documental, usando el informe de Codex como registro de hallazgos técnicos y manteniendo el alcance de ERV1 como contrato de producto.

Después prepararemos el script PowerShell de inicialización de estructura con operaciones idempotentes: que pueda ejecutarse sobre tu directorio existente sin sobrescribir documentos, código o fotografías.

Así llegaremos al primer commit con una Foundation reproducible, una estructura deliberada y un plan completo de ejecución, sin introducir todavía funcionalidades ajenas a V1.