# Globows LM — Plan de ejecución del segundo avance

Proyecto: Plataforma Integral para Globows LM by Licey Márquez | Octubre de 2026

**Vigencia:** este plan ordena objetivos y evidencias del segundo avance académico. El alcance obligatorio y la aceptación productiva permanecen en ERV1; la ejecución técnica vigente por sprints se rige por [PlanDeImplementacion.md](PlanDeImplementacion.md). Las fechas y propuestas de este documento no sustituyen el plan maestro ni autorizan ampliar V1 hacia V2.

## 1. Objetivo estratégico del segundo avance

Para este segundo avance propongo establecer una meta más ambiciosa que simplemente cumplir con la presentación académica:

Concluir, desplegar y validar la plataforma Globows LM v1.0.0 como un producto funcional en producción, respaldado por un proceso documentado de UX/UI, ingeniería frontend y DevOps.

Esto nos permitirá trabajar simultáneamente sobre dos objetivos:

1. Objetivo académico: demostrar los procesos de diseño y despliegue técnico solicitados por el profesor, utilizando evidencias reales del proyecto.
2. Objetivo del producto: entregar una primera versión institucional que represente profesionalmente a Globows LM y sirva como base para su evolución comercial.

La posibilidad de iniciar la v2.0.0 debe considerarse una oportunidad adicional, pero no una condición para declarar exitoso el segundo avance.

SECUENCIA DE ENTREGAS PROPUESTA

Avance 1

Base documental

Identidad, requerimientos y arquitectura

Avance 2

Objetivo actual

V1 productiva, QA y CI/CD

Entrega final

Condicionada

V1 estabilizada o inicio de V2

## 2. Diagnóstico del estado documental actual

Tenemos una ventaja importante: no estamos comenzando desde cero. La documentación oficial ya establece el producto, su identidad, sus restricciones y la arquitectura esperada.

| Documento              | Lo que ya proporciona                               | Papel en este avance      |
| ---------------------- | --------------------------------------------------- | ------------------------- |
| `00-ERP.md`            | Visión de negocio y evolución V1–V5                 | Delimitación del producto |
| `01-ERV1.md`           | Requerimientos, alcance y criterios de aceptación   | Verificación funcional    |
| `02-BrandDiscovery.md` | Identidad, públicos y diferenciadores               | Investigación UX          |
| `03-MID.md`            | Design System, tokens, componentes y accesibilidad  | Diseño de alta fidelidad  |
| `04-UIArquitecture.md` | Navegación, secciones y arquitectura de componentes | Wireframes y frontend     |

Sin embargo, debemos distinguir entre diseño documentado e implementación comprobada. Los archivos establecen una solución prevista, pero no demuestran todavía que estén terminados los wireframes, el repositorio Next.js, las pruebas o el despliegue.

### Dos puntos que debemos resolver antes de programar

A. Discrepancia de arquitectura UI.

El MID presenta una narrativa amplia con servicios, galerías, testimonios, preguntas frecuentes y CTA. Por otro lado, la UIA v1.0.0 especifica siete secciones principales: Hero, About, Events, Gallery, Courses, Certifications y Contact.

Esto debe resolverse mediante una reconciliación documental explícita, no seleccionando arbitrariamente una de las estructuras. Recomiendo utilizar la UIA como referencia estructural provisional y comprobar su cobertura frente a los requerimientos de ERV1 y al sistema visual del MID.

B. Cronograma original desactualizado.

ERV1 conserva fechas de desarrollo y entrega previstas para julio y agosto de 2026. Como estamos a 11 de octubre de 2026, necesitamos elaborar una planificación de ejecución actualizada, sin reescribir el historial del documento original.

También detecté una diferencia entre los roadmaps de largo plazo del ERP y del MID. No bloquea la V1, pero deberá resolverse antes de establecer el alcance formal de V2.

## 3. Interpretación de las cinco fases del profesor

El profesor permite presentar el proyecto según su fase de desarrollo. Por lo tanto, no necesariamente exige que todos los proyectos hayan llegado a producción.

En nuestro caso, dado que el objetivo es completar la V1, propongo cubrir las cinco fases utilizando evidencias verificables, desde la investigación hasta el despliegue.

Fase 1 — Alineación inicial y arquitectura

UX/UI: mapa de empatía, flujos de usuario, arquitectura de información y wireframes de baja fidelidad.

Ingeniería: arquitectura Next.js, justificación de Vercel y estrategia CDN.

Estado: existe base documental, pero faltan artefactos UX específicos.

Fase 2 — Alta fidelidad y configuración

UX/UI: sistema de diseño implementable, prototipos desktop/mobile e interacciones.

Ingeniería: repositorio GitHub, estructura del proyecto y configuración de entornos.

Estado: Design System especificado en MID; implementación y prototipos pendientes de verificar.

Fase 3 — Handoff y desarrollo

UX/UI: assets reales, especificaciones de componentes y trazabilidad diseño-código.

Ingeniería: desarrollo completo de la Landing y pipeline CI.

Estado: principal bloque de construcción del segundo avance.

Fase 4 — Pruebas y preproducción

UX/UI: Design QA, comparaciones visuales y revisión responsiva.

Ingeniería: Preview Deployments, pruebas automatizadas, Lighthouse y validación E2E.

Estado: debe ejecutarse sobre funcionalidades implementadas, no solamente documentarse.

Fase 5 — Producción y observabilidad

UX/UI: análisis de comportamiento, medición de conversiones e identificación de mejoras.

Ingeniería: despliegue continuo, distribución mediante CDN y monitoreo de rendimiento.

Estado: objetivo final de la V1 en este avance.

Hay una precisión académica importante: podremos demostrar la configuración de analítica desde el despliegue, pero no debemos afirmar que existen resultados de comportamiento de usuarios hasta contar con visitas reales y datos suficientes.

## 4. Arquitectura técnica propuesta para V1.0.0

El stack principal ya está establecido en el MID. No considero necesario introducir otro framework, backend independiente ni base de datos.

Arquitectura objetivo de entrega

Visitantes

Mobile · Tablet · Desktop

HTTPS

Vercel + CDN

Hosting, distribución y caché de contenido estático

Globows LM — Next.js

App Router · TypeScript · Tailwind CSSshadcn/ui · Motion · Design Tokens

Contenido estático

Fotografías, textos, galerías y SEO

Conversión externa

WhatsApp y redes sociales

Sin backend de negocio, base de datos, autenticación ni CMS en V1.

Decisiones técnicas que recomiendo adoptar:

- Next.js con App Router, priorizando renderizado estático para el contenido institucional.
- Vercel como plataforma de producción, conforme al despliegue previsto en ERV1.
- GitHub como control de versiones, con protección de la rama de producción.
- GitHub Actions para validaciones CI, complementado por el despliegue automatizado de Vercel.
- Vitest y Playwright para pruebas unitarias y E2E respectivamente, como propuesta técnica sujeta a aprobación.
- Lighthouse y herramientas de accesibilidad para la evaluación de calidad.
- Vercel Web Analytics y Speed Insights, sujetos a configuración, consentimiento y necesidades reales de medición.

Vercel actualmente permite generar despliegues Preview desde cambios en ramas y desplegar a producción desde la rama configurada. También ofrece mecanismos de seguimiento de rendimiento mediante Speed Insights.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://vercel.com\&sz=32)

Vercel

+1



Sobre las variables de entorno, la V1 podría necesitar únicamente valores públicos de configuración. No debemos incluir credenciales privadas del negocio en variables `NEXT_PUBLIC_*`, porque Next.js las incorpora al código accesible desde el navegador.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://nextjs.org\&sz=32)

Next.js

+1



## 5. Backlog de ejecución del segundo avance

Propongo organizar el trabajo en seis paquetes, con criterios de salida comprobables.

Checklist de ejecución

Seguimiento sugerido; se inicia sin marcar para evitar asumir trabajo completado.

0/24

WP-01 · Consolidación arquitectónica

Conciliar MID, ERV1 y UIA

Cerrar estructura definitiva de secciones

Definir trazabilidad requerimiento → componente

Actualizar cronograma de ejecución

Salida: Arquitectura V1 aprobada

WP-02 · Diseño UX/UI

Mapa de empatía por público objetivo

User flows de decoración y formación

Wireframes Lo-Fi y Hi-Fi responsive

Especificación de componentes e interacciones

Salida: Design Handoff listo

WP-03 · Foundation Next.js

Crear o revisar repositorio GitHub

Configurar Next.js y TypeScript

Implementar tokens, tipografías y componentes UI

Configurar lint, tests y estructura base

Salida: Foundation compilable y validada

WP-04 · Implementación de la Landing

Desarrollar Layout y navegación

Construir secciones de contenido aprobadas

Integrar fotografías y enlaces oficiales

Implementar responsive, accesibilidad y SEO

Salida: Cobertura funcional ERV1 completa

WP-05 · QA y preproducción

Design QA desktop y mobile

Pruebas unitarias y E2E críticas

Auditoría Lighthouse y accesibilidad

Preview validado sin defectos bloqueantes

Salida: Release Candidate aprobado

WP-06 · Producción y entrega académica

Desplegar V1 en Vercel

Verificar HTTPS, CDN y enlaces

Activar observabilidad acordada

Preparar evidencias y presentación del avance

Salida: V1 productiva y demostrable

&#x20;Copiar checklist

## 6. Criterios de aceptación adicionales

ERV1 define los criterios funcionales de la plataforma. Propongo complementarlos con indicadores técnicos mensurables, que deberán validarse como objetivos de calidad del segundo avance.

| Dimensión                | Objetivo propuesto                                     |
| ------------------------ | ------------------------------------------------------ |
| Cobertura funcional      | 100% de requerimientos obligatorios V1                 |
| Build                    | Sin errores de compilación o typecheck                 |
| Pruebas E2E              | 100% de flujos críticos aprobados                      |
| Lighthouse Performance   | ≥ 90, móvil y escritorio, bajo condiciones controladas |
| Lighthouse Accessibility | ≥ 90, sin errores críticos conocidos                   |
| SEO                      | ≥ 90, más validaciones manuales                        |
| Responsive               | Sin desbordamientos ni elementos inaccesibles          |
| Design QA                | Sin discrepancias críticas respecto al diseño aprobado |
| Despliegue               | Producción accesible mediante HTTPS                    |
| CI/CD                    | Validación automática antes de integrar cambios        |

Estos valores son propuestas nuevas, no requisitos ya aprobados en los documentos actuales. Especialmente en Lighthouse, debemos acompañar los puntajes con condiciones de medición y evidencias, en lugar de tratarlos como garantías absolutas.

## 7. Estructura recomendada de la presentación

Considero apropiadas entre 12 y 15 diapositivas, priorizando evidencias visuales y demostraciones sobre explicaciones teóricas.

| Diapositiva | Contenido                                         |
| ----------- | ------------------------------------------------- |
| 1           | Portada institucional                             |
| 2           | Contexto del problema y objetivo V1               |
| 3           | Roadmap del proyecto y alcance del segundo avance |
| 4           | Investigación UX: mapa de empatía                 |
| 5           | User flows y arquitectura de información          |
| 6           | Wireframes Lo-Fi y Hi-Fi                          |
| 7           | Design System oficial                             |
| 8           | Arquitectura técnica Next.js + Vercel             |
| 9           | Organización del repositorio y componentes        |
| 10          | Design Handoff e implementación                   |
| 11          | Flujo CI/CD y despliegues Preview                 |
| 12          | Pruebas de interfaz, rendimiento y accesibilidad  |
| 13          | Despliegue a producción y observabilidad          |
| 14          | Demostración de la plataforma V1.0.0              |
| 15          | Resultados, conclusiones y proyección V2          |

La presentación debe construirse al finalizar los paquetes de trabajo correspondientes. Así evitamos elaborar diapositivas que describan funcionalidades o procesos que todavía no se han ejecutado.

## 8. ¿Qué hacemos con la versión 2.0.0?

Aquí considero importante conservar la independencia de los objetivos académicos y empresariales.

Según el ERP, la v2 introduce la administración autónoma del contenido: panel administrativo, galerías, servicios, categorías, información institucional y blog.

Eso representa un cambio de alcance considerable respecto a la V1 estática.

Puerta de decisión: V1 → V2

La siguiente etapa solo debería autorizarse cuando se cumplan simultáneamente estas condiciones:

- V1 completada y aprobada conforme a ERV1.
- Producción y despliegue continuo funcionando.
- Sin incidencias críticas conocidas.
- Tiempo académico restante suficiente para un incremento verificable.
- Alcance funcional V2 validado con la propietaria del negocio.

Si se cumplen, mi propuesta sería iniciar el análisis del CMS y panel administrativo V2, trabajando primero su arquitectura y alcance, sin asumir todavía proveedores de base de datos, almacenamiento, autenticación ni decisiones de seguridad.

No recomendaría acelerar el desarrollo de V2 sacrificando las pruebas y la estabilización de V1. Un producto institucional completo, estable y desplegado ya constituye un entregable sólido para demostrar las cinco fases exigidas por el profesor.

## 9. Primer paso concreto

Comenzaría por WP-01: auditoría y consolidación de la arquitectura V1.0.0.

El resultado debe ser una definición única y aprobada que podamos utilizar para los wireframes de alta fidelidad y la posterior implementación en Next.js, sin contradicciones entre ERV1, MID y UIA.

El orden inmediato sería:

1. Determinar qué estructura de secciones es la definitiva y qué elementos son obligatorios, opcionales o derivados.
2. Establecer los contratos visuales y funcionales de cada sección y componente.
3. Identificar los assets reales disponibles y el contenido faltante, especialmente fotografías, textos, certificaciones y testimonios.
4. Cerrar el Design Handoff y pasar a la Foundation técnica de Next.js.

Mi recomendación es que el segundo avance se gobierne por la V1.0.0 y sus criterios de aceptación, mientras utilizamos la rúbrica del profesor como una matriz de evidencias del proceso de ingeniería. Así el proyecto conserva su dirección arquitectónica y al mismo tiempo demuestra todas las competencias académicas solicitadas.

El siguiente entregable de trabajo debería ser precisamente la auditoría de consistencia ERP–ERV1–Brand Discovery–MID–UIA, con los conflictos identificados, la resolución propuesta para cada uno y las decisiones que requieren tu aprobación antes de congelar el diseño.
