# Globows LM — Registro de Decisiones y Arquitectura UI Reconciliada

**Proyecto:** Plataforma Integral para Globows LM by Licey Márquez  
**Versión del documento:** 1.0.0-RC1  
**Fecha:** 13 de octubre de 2026  
**Estado:** Decisiones de arquitectura aprobadas; especificación de detalle pendiente  
**Alcance:** Landing institucional v1.0.0

**Vigencia operativa:** D01–D09 gobiernan las discrepancias estructurales de MID y UIA. ERP conserva la visión y roadmap; ERV1 conserva el alcance obligatorio y la aceptación. La [matriz de trazabilidad V1](../Planeacion/MatrizTrazabilidadV1.md) registra la cobertura prevista y su evidencia, sin ampliar estas decisiones.

---

# 1. Propósito

El presente documento consolida las decisiones tomadas durante la auditoría de consistencia entre las cinco fuentes documentales oficiales del proyecto:

- `00-ERP.md`
- `01-ERV1.md`
- `02-BrandDiscovery.md`
- `03-MID.md`
- `04-UIArquitecture.md`

Su finalidad es resolver los conflictos detectados entre requerimientos funcionales, identidad visual, experiencia de usuario y arquitectura de interfaz antes de elaborar los wireframes de alta fidelidad e implementar la plataforma en Next.js.

Este documento constituye una especificación reconciliada de trabajo y no sustituye automáticamente las fuentes documentales originales.

# 2. Registro formal de decisiones aprobadas

| ID | Decisión aprobada | Hallazgo resuelto | Estado |
|---|---|---|---|
| D01 | Adoptar arquitectura consolidada de ocho secciones conceptuales | H-01 | Aprobada |
| D02 | Integrar Servicios y Eventos en una sola sección | H-02 | Aprobada |
| D03 | Utilizar fotografía única de alto impacto en el Hero | H-03 | Aprobada |
| D04 | Implementar Testimonios y/o FAQ únicamente con contenido real y validado | H-04 | Aprobada |
| D05 | Separar galería de decoraciones de evidencias de formación y certificaciones | H-06 | Aprobada |
| D06 | Utilizar mensajes contextuales de WhatsApp según el servicio | H-08 | Aprobada |
| D07 | Incorporar correo electrónico al menú flotante | H-07 | Aprobada |
| D08 | Conservar el roadmap funcional del ERP como referencia oficial | H-05 | Aprobada |
| D09 | Publicar exclusivamente contenido real y validado | H-09 | Aprobada |

Todas las decisiones tienen carácter vinculante para la reconciliación de la arquitectura V1.0.0.

Cualquier modificación posterior deberá registrarse y justificarse antes de actualizar la documentación correspondiente.

# 3. Arquitectura general reconciliada

La plataforma V1.0.0 consistirá en una Landing Page institucional de navegación predominantemente vertical.

La interfaz se dividirá en tres grandes responsabilidades:

1. Layout global.
2. Secciones funcionales de la Landing.
3. Componentes reutilizables del sistema UI.

## 3.1 Layout global

El Layout tendrá los siguientes elementos:

**Navbar**

- Logotipo oficial.
- Navegación mediante anclas.
- Navegación adaptada para dispositivos móviles.
- Acceso a la sección de contacto.

**FloatingContactMenu**

- WhatsApp.
- Facebook.
- Instagram.
- TikTok.
- Correo electrónico.

El menú deberá permanecer accesible durante la navegación, respetando las reglas de accesibilidad y adaptación responsive del MID.

**Footer**

- Logotipo.
- Información de contacto.
- Redes oficiales.
- Área de cobertura, cuando esté validada.
- Información institucional y copyright.

## 3.2 Secciones de la Landing

La arquitectura se organiza en ocho posiciones conceptuales:

### 01. HeroSection

**Responsabilidad:** generar impacto visual y comunicar la identidad profesional de Globows LM.

Componentes previstos:

- HeroImage.
- HeroOverlay.
- HeroLogo.
- HeroTitle.
- HeroSubtitle.
- PrimaryCTA.
- ScrollIndicator.

**Decisión D03:** una fotografía única reemplaza al carrusel automático definido anteriormente en UIA.

La fotografía deberá ser real, representar profesionalmente a Globows LM y cumplir los criterios fotográficos del MID.

### 02. AboutSection

**Responsabilidad:** presentar a Licey Márquez y establecer confianza.

Contenido:

- Historia de la fundadora.
- Trayectoria profesional.
- Filosofía de trabajo.
- Valores y diferenciadores relevantes.

Componentes previstos:

- SectionTitle.
- PortraitImage.
- AboutText.
- ValuesPreview.

La composición deberá privilegiar la legibilidad y la fotografía real.

### 03. ServicesEventsSection

**Responsabilidad:** explicar qué ofrece Globows LM y para qué tipos de eventos proporciona servicios.

**Decisión D02:** se unifican los conceptos anteriores de Servicios y Eventos.

La cobertura funcional deberá contemplar los cinco servicios establecidos en ERV1:

- Decoraciones profesionales.
- Cursos presenciales.
- Talleres intensivos.
- Certificaciones.
- Asesorías.

La presentación de los servicios podrá distribuirse entre esta sección y Formación Profesional, siempre que todos los servicios sean identificables y que cada uno cuente con los elementos requeridos por ERV1: nombre, descripción, imagen y botón de contacto.

Los tipos de eventos podrán presentarse como categorías o tarjetas asociadas a las decoraciones profesionales.

Componentes previstos:

- SectionTitle.
- ServicesGrid.
- ServiceCard.
- EventCategoryCard.

### 04. GallerySection

**Responsabilidad:** demostrar la calidad del trabajo realizado mediante fotografías de decoraciones.

**Decisión D05:** la galería principal se enfocará en decoraciones profesionales.

Sus categorías definitivas deberán validarse conforme al material fotográfico disponible.

Componentes previstos:

- SectionTitle.
- GalleryGrid.
- GalleryCard.
- CategoryFilter, si se confirma como necesario.

La navegación de categorías deberá mostrar únicamente imágenes correspondientes a la selección activa.

### 05. CoursesSection

**Responsabilidad:** representar la línea de formación profesional de Globows LM.

Contenido previsto:

- Cursos presenciales.
- Talleres intensivos.
- Certificaciones como oferta formativa, cuando corresponda.
- Asesorías.
- Fotografías reales de actividades educativas.

Componentes previstos:

- SectionTitle.
- CourseDescription.
- CourseGallery.
- CourseCard.
- ContextualCTA.

Esta sección no implementará inscripciones automatizadas, pagos, streaming ni administración de alumnos.

La conversión continuará mediante canales externos de contacto.

### 06. CertificationsSection

**Responsabilidad:** demostrar preparación, trayectoria y credenciales profesionales de Licey Márquez.

Componentes previstos:

- SectionTitle.
- HorizontalTimeline.
- CertificationCard.
- CertificationLogo.
- CertificationGallery.

Únicamente podrán publicarse certificaciones y organismos cuya información se encuentre validada.

El Timeline horizontal permanece como decisión estructural de la UIA; su comportamiento responsive deberá definirse en el Design Handoff.

### 07. TrustSupportSection — Condicional

**Responsabilidad:** resolver dudas y reforzar la confianza antes del contacto.

**Decisión D04:** la sección solamente se materializará con contenido validado.

Podrá incluir:

- Testimonios reales.
- Preguntas frecuentes verificadas.
- Ambos tipos de contenido.

Si no existe contenido suficiente y aprobado, la sección se omitirá de la publicación inicial sin incorporar información ficticia.

Esta regla no modifica la arquitectura conceptual de ocho posiciones, pero permite que la página publicada tenga siete secciones cuando corresponda.

### 08. ContactSection

**Responsabilidad:** convertir el interés del visitante en una oportunidad de contacto.

Contenido:

- Mensaje final de contacto.
- WhatsApp.
- Correo electrónico.
- Redes sociales oficiales.
- Información comercial validada.

Componentes previstos:

- SectionTitle.
- ContactDescription.
- ContactCTA.
- SocialLinks.

La sección tendrá una llamada a la acción primaria claramente identificable.

# 4. Arquitectura de componentes

La organización lógica propuesta es:

```text
App
│
├── Layout
│   ├── Navbar
│   │   ├── Logo
│   │   ├── NavigationMenu
│   │   └── MobileMenu
│   │
│   ├── FloatingContactMenu
│   │   ├── FloatingButton
│   │   ├── WhatsAppButton
│   │   ├── FacebookButton
│   │   ├── InstagramButton
│   │   ├── TikTokButton
│   │   └── EmailButton
│   │
│   └── Footer
│
└── LandingPage
    ├── HeroSection
    ├── AboutSection
    ├── ServicesEventsSection
    ├── GallerySection
    ├── CoursesSection
    ├── CertificationsSection
    ├── TrustSupportSection [Condicional]
    └── ContactSection
```

Esta representación describe responsabilidades de interfaz, no una estructura definitiva de directorios o archivos de Next.js.

Los componentes de uso compartido permanecerán desacoplados de las secciones cuando su reutilización esté justificada.

# 5. Arquitectura de navegación

La V1 mantendrá navegación dentro de la Landing mediante anclas.

Flujo conceptual:

```text
Visitante
    │
    ▼
Hero
    │
    ▼
Sobre Licey
    │
    ▼
Servicios y Eventos
    │
    ▼
Galería
    │
    ▼
Cursos y Formación
    │
    ▼
Certificaciones
    │
    ▼
Testimonios / FAQ [Opcional]
    │
    ▼
Contacto
    │
    ▼
Footer
```

El Navbar ofrecerá acceso directo a las principales áreas del contenido.

No se incorporarán rutas de autenticación, administración o áreas privadas durante la V1.

La selección y denominación definitiva de los elementos visibles del Navbar se cerrarán en la especificación de navegación previa al Hi-Fi.

# 6. Modelo de conversión

**Decisión D06:** WhatsApp será el principal canal de conversión.

Los CTA contextualizados deberán identificar el servicio desde el cual se originó la interacción.

Contextos mínimos considerados:

- Cotización de decoración.
- Información sobre cursos.
- Información sobre talleres.
- Información sobre certificaciones.
- Información sobre asesorías.
- Contacto general.

Los mensajes comerciales exactos, números telefónicos y enlaces oficiales estarán sujetos a validación de la propietaria.

No se introducirá un sistema de cotizaciones automatizadas ni un mecanismo interno de reservas.

# 7. Sistema visual

El diseño respetará íntegramente el MID v1.0.0 mientras no exista una modificación formalmente aprobada.

Se mantienen:

**Paleta oficial**

- Primary: `#B3006D`.
- Secondary: `#F7B7D8`.
- Surface: `#FADAE9`.
- Accent: `#D4AF37`.
- Colores neutrales definidos en MID.

**Tipografía**

- Manrope para interfaz y contenido general.
- Cormorant Garamond para composición editorial y encabezados.

**Principios visuales**

- Mobile First.
- Fotografía como protagonista.
- Espaciado consistente.
- Componentes reutilizables.
- Elegancia y simplicidad.
- Accesibilidad.
- Animaciones discretas.
- Navegación orientada al contacto.

La resolución de conflictos arquitectónicos no autoriza cambios sobre el sistema de identidad visual.

# 8. Alcance técnico V1.0.0

Se conserva el stack definido en el MID:

- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Framer Motion.

La V1 no incorporará:

- Backend de negocio.
- Base de datos.
- Autenticación.
- Panel administrativo.
- CMS.
- Pagos.
- Gestión de alumnos.
- Administración de agenda.
- CRM.
- Cotizaciones automatizadas.

La organización física del proyecto y las estrategias de renderizado, despliegue, integración continua y pruebas deberán especificarse en la arquitectura técnica de implementación.

# 9. Roadmap de evolución

**Decisión D08:** el ERP conservará autoridad sobre la evolución funcional.

| Versión | Objetivo |
|---|---|
| V1 | Presencia digital institucional |
| V2 | Administración de contenido, galerías, servicios y blog |
| V3 | Digitalización de operaciones, clientes, agenda y cotizaciones |
| V4 | Formación profesional digital |
| V5 | Ecosistema integral del negocio |

La nomenclatura concreta de módulos y sus contratos serán definidos cuando se planifique cada versión.

Ninguna funcionalidad futura deberá implementarse anticipadamente sin justificación y aprobación de su alcance.

# 10. Pendientes identificados

Las nueve decisiones estructurales fueron aprobadas. Permanecen pendientes de especificación o validación los siguientes asuntos.

| ID | Pendiente | Naturaleza | Bloqueo |
|---|---|---|---|
| P-01 | Determinar taxonomía definitiva de la galería | Contenido y UX | Antes de Hi-Fi |
| P-02 | Validar contenido y disponibilidad de fotografías | Contenido | Antes de Hi-Fi definitivo |
| P-03 | Validar certificaciones, organismos y evidencia | Contenido | Antes de publicación |
| P-04 | Confirmar existencia de testimonios reales y FAQ validada | Contenido y alcance condicional | Antes de cerrar sección 07 |
| P-05 | Validar números, correo y enlaces sociales oficiales | Negocio | Antes de QA funcional |
| P-06 | Aprobar textos exactos de CTA y mensajes de WhatsApp | Negocio | Antes de publicación |
| P-07 | Definir distribución final de navegación del Navbar | UX/UI | Antes de Hi-Fi |
| P-08 | Especificar comportamiento responsive y estados interactivos | UX/UI | Durante Design Handoff |
| P-09 | Establecer criterios técnicos verificables de rendimiento, SEO y accesibilidad | Ingeniería | Antes de QA |
| P-10 | Revisar DocITyET para verificar convenciones técnicas | Arquitectura | Antes de cerrar Foundation |
| P-11 | Actualizar cronograma de ejecución del segundo avance | Gestión | Antes de ejecución planificada |
| P-12 | Normalizar las fuentes oficiales mediante control de cambios | Documentación | Antes de declarar documentación congelada |

Los asuntos pendientes no invalidan las decisiones estructurales aprobadas.

# 11. Impacto documental

Una vez autorizada la actualización de las fuentes:

**ERP:** conservar la visión y roadmap funcional aprobado.

**ERV1:** mantener las obligaciones funcionales, incluida la cobertura completa de servicios y el correo electrónico.

**Brand Discovery:** utilizar como fuente estratégica de identidad y contenido; completar exclusivamente información validada.

**MID:** reconciliar Hero, arquitectura de secciones y roadmap sin alterar los tokens ni la identidad oficial.

**UIA:** actualizar árbol de componentes, flujo de navegación, menú flotante y estructura de las secciones conforme a las decisiones D01–D09.

Las modificaciones deberán realizarse con trazabilidad respecto a las decisiones aprobadas.

# 12. Criterios para avanzar a los wireframes Hi-Fi

Se autoriza continuar hacia la especificación de diseño de alta fidelidad cuando:

1. La arquitectura reconciliada sea aceptada como referencia estructural.
2. Las responsabilidades de las secciones estén definidas.
3. Los componentes críticos tengan contratos funcionales.
4. La navegación y los CTA estén especificados.
5. Los assets disponibles y faltantes estén identificados.
6. Se disponga de una estrategia para representar contenido aún pendiente sin presentarlo como información verificada.

El congelamiento definitivo de los wireframes requerirá una revisión posterior de fidelidad visual, responsive, consistencia y cumplimiento de requerimientos.

---

# 13. Resultado

La auditoría de consistencia documental concluye con nueve decisiones aprobadas y una arquitectura UI reconciliada para Globows LM v1.0.0.

La solución mantiene los objetivos originales de la Landing institucional, preserva la identidad oficial y corrige las principales discrepancias entre ERV1, MID y UIA.

**Estado final:** arquitectura conceptual reconciliada y aprobada; Design Handoff y especificaciones complementarias pendientes.

**Siguiente actividad:** definición detallada de los contratos UX/UI y preparación de los wireframes de alta fidelidad.

