
# Arquitectura de Interfaz de Usuario (UIA)

Versión 1.0.0

## Plataforma Integral para Globows LM by Licey Márquez

Versión: 1.0.0

Estado: Arquitectura conceptual reconciliada por ADR v1.0.0-RC1; contratos de detalle y contenido pendientes

**Vigencia:** esta UIA conserva decisiones históricas de composición que fueron reemplazadas por D01–D09 del [ADR consolidado](05-ADR-Arquitectura-UI-Consolidada.md). Las propuestas anteriores de carrusel Hero, `EventsSection` aislada, cuatro canales y secuencia de versiones futuras ya no rigen V1. Los requisitos obligatorios siguen en [ERV1](../01-ERV1.md).

Fecha: Agosto 2026

Documento derivado del ERP, ERV1, DocITyET, Brand Discovery y MID.

---

# 1. Propósito del documento

La Arquitectura de Interfaz de Usuario (UIA) define la organización estructural de la interfaz de la plataforma Globows LM antes de su implementación.

Su propósito es establecer una base arquitectónica que describa cómo se distribuyen las pantallas, cómo se relacionan los componentes y cuál será el flujo de navegación de la aplicación.

Este documento no define estilos visuales, colores o tipografías. Dichos aspectos corresponden al Manual de Identidad Digital (MID).

En cambio, la UIA documenta la estructura funcional de la interfaz, permitiendo que el desarrollo del frontend se realice sobre una arquitectura previamente diseñada y validada.

---

# 2. Relación con la documentación del proyecto

La UIA forma parte del conjunto oficial de documentos del proyecto y se apoya en las decisiones tomadas en los documentos anteriores.

```
ERP
        │
        ▼
ERV1
        │
        ▼
DocITyET
        │
        ▼
Brand Discovery
        │
        ▼
MID
        │
        ▼
UIA
        │
        ▼
Wireframes
        │
        ▼
Desarrollo Frontend
```

Cada documento responde una necesidad distinta dentro del proceso de desarrollo y evita la improvisación durante las siguientes etapas del proyecto.

---

# 3. Filosofía Arquitectónica

La arquitectura de la interfaz se construye bajo una serie de principios que orientan todas las decisiones de composición.

## La interfaz acompaña al contenido

El objetivo principal de la interfaz es resaltar el trabajo realizado por Globows LM.

Las fotografías y el contenido son el elemento protagonista.

---

## La navegación debe ser intuitiva

El usuario debe recorrer la Landing de forma natural, sin requerir explicaciones adicionales.

Cada sección deberá conducir a la siguiente mediante una narrativa visual coherente.

---

## La Landing comunica mediante imágenes

La primera impresión del visitante estará basada principalmente en fotografías reales del trabajo realizado.

La interfaz actúa como un marco visual y no como el elemento principal de comunicación.

---

## La arquitectura debe ser escalable

Todos los componentes deberán diseñarse pensando en la evolución futura de la plataforma.

La incorporación de nuevas funcionalidades no deberá requerir rediseñar la estructura existente.

---

## Componentes reutilizables

La mayor parte de la interfaz estará construida mediante componentes reutilizables.

Cada componente deberá cumplir una única responsabilidad y poder utilizarse en diferentes contextos.

---

# 4. Arquitectura General de la Aplicación

```
App

│

├── Layout
│   ├── Navbar
│   ├── FloatingContactMenu
│   └── Footer
│
└── LandingPage
    │
    ├── HeroSection
    ├── AboutSection
    ├── ServicesEventsSection
    ├── GallerySection
    ├── CoursesSection
    ├── CertificationsSection
    ├── TrustSupportSection [condicional: contenido validado]
    └── ContactSection
```

Esta estructura representa el nivel más alto de organización de la aplicación durante la versión 1.0.0.

---

# 5. Arquitectura Completa de Componentes

```
App

│

├── Layout
│
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
│       ├── Logo
│       ├── ContactInfo
│       ├── SocialLinks
│       ├── CoverageArea
│       └── Copyright
│
└── LandingPage

    ├── HeroSection
    │   ├── HeroImage [fotografía única, D03]
    │   ├── HeroOverlay
    │   ├── HeroLogo
    │   ├── HeroTitle
    │   ├── HeroSubtitle
    │   └── ScrollIndicator
    │
    ├── AboutSection
    │   ├── SectionTitle
    │   ├── PortraitImage
    │   ├── AboutText
    │   ├── ValuesPreview
    │   └── SecondaryButton
    │
    ├── ServicesEventsSection
    │   ├── SectionTitle
    │   ├── ServicesGrid / ServiceCard[]
    │   └── EventCategoryCard[]
    │
    ├── GallerySection
    │   ├── SectionTitle
    │   ├── GalleryGrid
    │   └── GalleryCard[] [solo decoraciones]
    │
    ├── CoursesSection
    │   ├── SectionTitle
    │   ├── CourseDescription
    │   ├── CourseGallery
    │   └── CourseCard[]
    │
    ├── CertificationsSection
    │   ├── SectionTitle
    │   ├── HorizontalTimeline
    │   ├── CertificationLogo[]
    │   └── CertificationGallery
    │
    ├── TrustSupportSection [condicional]
    │   └── Testimonios y/o FAQ validados
    │
    └── ContactSection
        ├── SectionTitle
        ├── ContactDescription
        └── ContactCTA
```

---

# 6. Componentes Reutilizables

El sistema de componentes constituye la base del desarrollo frontend.

```
UI

├── Button
├── Logo
├── SectionContainer
├── SectionTitle
├── Card
├── Badge
├── Divider
├── ImageCard
├── GalleryCard
├── EventCard
├── CourseCard
├── CertificationCard
├── Timeline
├── FloatingMenu
├── SocialButton
├── ScrollIndicator
└── LoadingSpinner
```

Este inventario es conceptual: solo se implementarán componentes que la V1 necesite. `Carousel` corresponde a una propuesta histórica reemplazada por la fotografía única del Hero (D03); `Timeline` se concreta como timeline horizontal de certificaciones (§13). Los componentes implementados deberán ser consistentes con el MID.

---

# 7. Flujo de Navegación

La Landing Page seguirá una navegación lineal basada en desplazamiento vertical.

```
Usuario

│

▼

Hero

▼

Sobre Licey

▼

Servicios y Eventos

▼

Galería de Decoraciones

▼

Formación Profesional

▼

Certificaciones

▼

Confianza y Orientación [condicional]

▼

Contacto

▼

Footer
```

No existirán rutas internas durante la versión 1.0.0.

Toda la navegación se realizará mediante desplazamiento suave entre secciones.

---

# 8. Arquitectura de Navegación

La barra de navegación actuará como punto principal de acceso a cada sección.

```
Navbar

Logo

│

├── Inicio
├── Servicios y Eventos
├── Galería
├── Cursos
├── Certificaciones
└── Contacto
```

Cada elemento realizará desplazamiento hacia la sección correspondiente.

---

# 9. Arquitectura del Hero

El Hero representa el punto de mayor impacto visual de toda la plataforma.

Su objetivo principal consiste en presentar el trabajo realizado por Globows LM mediante una fotografía real validada, acompañada por texto y una llamada a la acción legibles (D03).

```
Hero

│

Background

└── Fotografía única validada

Overlay

Logo

Título

Subtítulo

Scroll Indicator
```

La interfaz no compite con las fotografías; las acompaña.

---

# 10. Arquitectura del Floating Contact Menu

El menú flotante constituye el principal mecanismo de conversión de la plataforma.

Durante la versión 1.0.0 permitirá acceder rápidamente a las redes sociales y medios de contacto.

```
Floating Contact Menu

        ○

        │

        ▼

    WhatsApp

    Facebook

    Instagram

    TikTok

    Correo electrónico
```

Los cinco canales deberán utilizar datos oficiales validados; WhatsApp empleará mensajes contextualizados según la acción (D06 y D09). La posible evolución hacia un asistente pertenece al roadmap futuro del ERP y no se implementa en V1.

---

# 11. Distribución Visual General

```
┌─────────────────────────────────────────────┐
│ Navbar                                      │
├─────────────────────────────────────────────┤
│                                             │
│                  HERO                       │
│                                             │
│         Fotografía única validada            │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│              Sobre Licey                    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│         Servicios y Eventos                 │
│                                             │
│        □          □                         │
│        □          □                         │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│       Galería de Decoraciones              │
│                                             │
│     □ □ □ □                                │
│     □ □ □ □                                │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│          Formación Profesional             │
│                                             │
│        Texto + Fotografías                  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│            Certificaciones                  │
│                                             │
│   Timeline horizontal + evidencias          │
│                                             │
│          Fotografías                        │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│   Confianza y Orientación [condicional]      │
├─────────────────────────────────────────────┤
│               Contacto                      │
│                                             │
├─────────────────────────────────────────────┤
│ Footer                                      │
└─────────────────────────────────────────────┘

                 ○
                 │
                 │
      Floating Contact Menu
```

Esta distribución representa la composición base vigente de la Landing Page. La referencia histórica a wireframes no constituye una dependencia para iniciar la implementación aprobada.

---

# 12. Componentes Preparados para Futuras Versiones

La arquitectura contempla la incorporación de nuevos módulos conforme evolucione la plataforma.

```
Future Components

BlogCard
BlogPreview
BlogCategory
CommentCard
StudentCard
CourseDetailCard
ProductCard
Calendar
DashboardCard
NotificationCard
SearchBar
FilterBar
Pagination
Breadcrumb
Modal
Toast
Accordion
VideoPlayer
EnrollmentCard
ProfileMenu
```

Este inventario es histórico y orientativo para versiones posteriores. No autoriza crear carpetas, componentes ni dependencias de V2 durante la V1; el roadmap funcional vigente lo define el ERP conforme a D08.

---

# 13. Restricciones Arquitectónicas

Con el fin de mantener la coherencia del sistema, se establecen las siguientes reglas:

* La Landing contará con un único Hero.
* Cada sección iniciará con un `SectionTitle`.
* Todas las secciones utilizarán un `SectionContainer`.
* No existirán dos llamadas a la acción (CTA) principales dentro de una misma sección.
* Las galerías utilizarán una distribución basada en Grid.
* Las certificaciones se presentarán mediante un Timeline horizontal.
* Todos los componentes reutilizables pertenecerán al sistema UI compartido.
* La navegación principal será lineal y mediante desplazamiento.
* El Floating Contact Menu permanecerá disponible durante toda la navegación.
* La arquitectura deberá priorizar la reutilización de componentes sobre la duplicación de código.

---

# 14. Convenciones de Organización del Frontend

La organización del código seguirá la estructura técnica del plan maestro y la decisión D01. DocITyET investiga herramientas y tecnologías, pero no prescribe directorios físicos.

```
src/app/
src/components/ui/
src/components/layout/
src/components/sections/
src/components/shared/
src/config/
src/content/
src/hooks/
src/lib/
src/styles/
src/types/
public/
```

Esta organización busca facilitar la mantenibilidad, escalabilidad y reutilización de componentes durante todo el ciclo de vida del proyecto.

---

# 15. Evolución Arquitectónica

La arquitectura definida en este documento constituye la base sobre la que evolucionará la plataforma.

```
Landing Institucional

        │

        ▼

CMS Administrativo

        │

        ▼

Campus Digital

        │

        ▼

Portal de Alumnos

        │

        ▼

ERP Integral Globows LM
```

La secuencia anterior es una ilustración histórica, no una redefinición del roadmap ERP aprobado por D08. La V1 se limita a la Landing institucional; las etapas siguientes se precisarán en ERV2 y sus decisiones correspondientes.

---

# Conclusión

La Arquitectura de Interfaz de Usuario (UIA) establece la organización estructural de la Landing. Sirve como puente entre Brand Discovery, MID, ERV1 y el plan maestro técnico; DocITyET aporta investigación tecnológica.

La arquitectura vigente se concreta en D01–D09. El siguiente paso autorizado es implementar la V1 por sprints conforme al plan maestro y sus criterios de aceptación; la recomendación anterior de elaborar wireframes de alta fidelidad se conserva como antecedente histórico, sin ser una condición de inicio.
