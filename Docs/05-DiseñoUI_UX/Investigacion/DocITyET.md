
---

# Documento de Investigación Tecnológica y Estrategia de Diseño

## Plataforma Integral para Globows LM by Licey Márquez

**Versión:** 0.1

**Estado:** Investigación tecnológica

**Vigencia:** referencia histórica de investigación y selección tecnológica. No define un contrato de directorios para la Foundation actual; la organización orientativa está en el [plan maestro](../../Planeacion/PlanDeImplementacion.md) y la arquitectura UI vigente en el [ADR consolidado](../05-ADR-Arquitectura-UI-Consolidada.md).

**Fecha:** 4 Julio 2026

---

# 1. Objetivo del documento

Este documento recopila las decisiones preliminares, investigaciones y criterios estratégicos relacionados con la experiencia visual, el frontend, las herramientas de diseño y el proceso de construcción de la primera versión de la Plataforma Integral para Globows LM by Licey Márquez.

Su propósito es documentar el razonamiento detrás de las decisiones adoptadas antes del inicio de la implementación, sirviendo como referencia para las siguientes etapas del proyecto y como base para la elaboración del futuro **Manual de Identidad Digital (MID)**.

---

# 2. Cambio de perspectiva del proyecto

Durante el análisis inicial se identificó un aspecto fundamental del proyecto:

> La primera versión no debe entenderse únicamente como un desarrollo frontend, sino como la construcción de la identidad digital de la marca.

Aunque técnicamente la Versión 1 consiste en una Landing Page, estratégicamente representa el primer contacto entre la empresa y sus potenciales clientes.

En consecuencia, el diseño visual deja de ser un aspecto exclusivamente estético para convertirse en una herramienta de comunicación, posicionamiento y generación de confianza.

La plataforma constituye el primer elemento del ecosistema digital de Globows LM by Licey Márquez y deberá transmitir profesionalismo, creatividad, elegancia y cercanía desde el primer momento.

---

# 3. Implicaciones para el proyecto

Este cambio de enfoque modifica la forma en que se abordará el desarrollo.

En lugar de comenzar directamente con la implementación, será necesario diseñar previamente la identidad visual del proyecto, estableciendo un lenguaje gráfico consistente que pueda mantenerse durante todas las versiones futuras.

Por ello, el trabajo inicial estará orientado principalmente al diseño de la experiencia visual y posteriormente a la implementación técnica.

---

# 4. Stack tecnológico propuesto

Después del análisis de los requerimientos actuales y de la visión de largo plazo del proyecto, se propone el siguiente stack tecnológico.

## Framework

* Next.js

## Lenguaje

* TypeScript

## Librería de interfaz

* React

## Estilos

* Tailwind CSS

## Componentes

* shadcn/ui

## Animaciones

* Framer Motion

## Despliegue

* Vercel

---

# 5. Justificación de Next.js

Aunque la primera versión consiste en un sitio estático, el roadmap contempla la incorporación futura de funcionalidades como:

* Blog.
* SEO avanzado.
* Panel administrativo.
* Plataforma educativa.
* Gestión de usuarios.
* Gestión de contenido.
* Cursos en línea.
* Academia digital.

Next.js proporciona una base tecnológica adecuada para esta evolución al ofrecer capacidades de renderizado híbrido, optimización automática de imágenes, generación de sitios estáticos, renderizado del lado del servidor y una arquitectura preparada para aplicaciones de gran tamaño.

La adopción de Next.js desde la primera versión reduce la probabilidad de migraciones arquitectónicas en etapas posteriores.

---

# 6. Estrategia Responsive

El proyecto adoptará una filosofía **Mobile First**.

Esta decisión responde al comportamiento esperado de los usuarios finales.

El flujo principal de captación de clientes será:

Publicidad

↓

Facebook

↓

Instagram

↓

TikTok

↓

WhatsApp

↓

Landing Page

↓

Contacto

La mayor parte de este recorrido ocurre desde dispositivos móviles.

Por ello, la experiencia móvil constituye la prioridad principal del proyecto.

La prioridad estimada de diseño será:

* 40% teléfonos móviles.
* 35% tabletas.
* 25% computadoras de escritorio.

El diseño para escritorio se construirá posteriormente como una adaptación de la experiencia móvil y no al contrario.

---

# 7. Metodología de trabajo propuesta

Antes de escribir código se realizará un proceso completo de diseño.

## Etapa 1 — Definición de identidad visual

Objetivo:

Construir el lenguaje visual de la marca.

Productos esperados:

* Moodboard.
* Paleta de colores.
* Tipografía.
* Iconografía.
* Estilo fotográfico.
* Referencias visuales.

---

## Etapa 2 — Wireframes

Objetivo:

Definir la estructura de navegación y distribución del contenido.

En esta etapa no se trabajará con colores ni estilos gráficos.

Únicamente se establecerá la experiencia de usuario y la organización visual del sitio.

---

## Etapa 3 — Diseño de alta fidelidad

Objetivo:

Construir la interfaz definitiva.

Se definirán:

* Colores.
* Espaciados.
* Componentes.
* Sombras.
* Botones.
* Tarjetas.
* Iconografía.
* Animaciones.
* Transiciones.
* Estados interactivos.

---

## Etapa 4 — Implementación

Una vez concluido el diseño visual comenzará el desarrollo del proyecto utilizando el stack tecnológico previamente definido.

---

# 8. Pipeline de diseño

El flujo de trabajo propuesto será:

```
Logo

↓

Extracción de colores

↓

Design Tokens

↓

Moodboard

↓

Wireframes

↓

Diseño UI

↓

Sistema de Componentes

↓

Landing Page

↓

Responsive

↓

Animaciones

↓

Optimización

↓

Despliegue
```

Este enfoque busca reducir retrabajos y garantizar coherencia visual durante todo el desarrollo.

---

# 9. Herramientas de apoyo

## Diseño e identidad visual

* Figma.
* Penpot.

---

## Paletas de color

* Adobe Color.
* Coolors.
* Khroma.
* Color Hunt.

---

## Inspiración visual

* Behance.
* Dribbble.
* Pinterest.
* Awwwards.
* Land-book.
* Lapa Ninja.
* Mobbin.

---

## Inteligencia Artificial

* ChatGPT.
* Claude.
* Galileo AI.
* Uizard.
* Relume.
* v0.

---

## Componentes

* shadcn/ui.
* Aceternity UI.
* Magic UI.
* React Bits.
* Tailwind UI.

---

## Animaciones

* Framer Motion.
* Motion One.
* GSAP (cuando sea estrictamente necesario).

---

## Iconografía

* Lucide.
* Heroicons.
* Phosphor.

---

## Optimización de imágenes

* TinyPNG.
* Squoosh.

---

## Validación Responsive

* Chrome DevTools.
* Responsively App.

---

# 10. Manual de Identidad Digital (MID)

Durante el análisis surgió la necesidad de crear un documento adicional que acompañe al proyecto durante toda su evolución.

Este documento será denominado **Manual de Identidad Digital (MID)**.

Su objetivo será documentar el sistema de diseño completo de la plataforma, permitiendo mantener consistencia visual entre versiones y facilitando futuras ampliaciones sin necesidad de rediseñar la interfaz.

El MID incluirá, entre otros elementos:

* Identidad de marca.
* Valores.
* Personalidad.
* Tono de comunicación.
* Paleta de colores.
* Tipografías.
* Componentes.
* Sistema de espaciados.
* Iconografía.
* Animaciones.
* Transiciones.
* Breakpoints.
* Responsive.
* Estados visuales.
* Sombras.
* Bordes.
* Elevaciones.
* Gradientes.
* Uso correcto del logotipo.
* Accesibilidad.
* Principios de diseño.

Este documento evolucionará paralelamente al proyecto y se convertirá en la referencia oficial para todas las decisiones relacionadas con la experiencia visual.

---

# 11. Conclusiones

La primera versión de la Plataforma Integral para Globows LM by Licey Márquez representa mucho más que una Landing Page. Constituye el inicio de la identidad digital de la marca y la base sobre la cual evolucionará un ecosistema completo de gestión del negocio y formación profesional en línea.

Por ello, el diseño visual será tratado con el mismo nivel de importancia que la arquitectura de software, siguiendo un proceso estructurado que priorice la investigación, el diseño y la consistencia antes de la implementación.

La adopción de un enfoque Mobile First, el uso de Next.js como plataforma tecnológica y la futura creación del Manual de Identidad Digital permitirán construir una base sólida tanto para la Versión 1 como para las versiones posteriores del proyecto.

---
