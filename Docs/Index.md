# Documentación de Globows LM V1.0.0

**Punto de entrada y corte:** 13/10/2026. Este índice describe archivos existentes y su autoridad; una propuesta histórica no amplía por sí sola el alcance V1. La implementación se rige por ERV1 y las decisiones D01–D09 del ADR consolidado. Ningún documento por sí solo acredita implementación: el plan, matriz y evidencias registran resultados reales. El responsable confirmó la aprobación comercial del preview para textos principales, fotos, teléfono, WhatsApp y tres redes; no requieren nueva aprobación general.

## Fuentes oficiales vigentes

| Documento | Autoridad y uso |
|---|---|
| [ERP](00-ERP.md) | Visión, estrategia del negocio y roadmap funcional de versiones, conforme a D08. |
| [ERV1](01-ERV1.md) | Requerimientos obligatorios, exclusiones y criterios de aceptación de V1. Sus fechas históricas no sustituyen el calendario de ejecución vigente. |
| [Brand Discovery](05-DiseñoUI_UX/02-BrandDiscovery.md) | Identidad, públicos y comunicación. La validación del origen/nombre de marca sigue pendiente cuando aplique. |
| [Manual de Identidad Digital (MID)](05-DiseñoUI_UX/03-MID.md) | Colores, tipografías, tokens y reglas UX/UI. Las propuestas estructurales anteriores quedan subordinadas al ADR. |
| [Arquitectura de Interfaz (UIA)](05-DiseñoUI_UX/04-UIArquitecture.md) | Organización de secciones y componentes conceptuales para la Landing; leer junto al ADR. |

## Autoridad comercial y editorial

[Preview aprobado](https://github.com/CarlosAM03/globows-preview), conservado en legacy/index.html: copy, datos comerciales y composición visual aprobados por Licey Márquez y confirmados expresamente por el responsable en la ejecución Sprint 4–5. ERV1/ADR mantienen autoridad funcional y MID el sistema visual. Credenciales individuales y correo ausentes se registran específicamente, sin invalidar esa aprobación.

## Decisiones aprobadas

[ADR — Arquitectura UI consolidada, D01–D09](05-DiseñoUI_UX/05-ADR-Arquitectura-UI-Consolidada.md) resuelve las contradicciones estructurales entre fuentes sin reemplazar el ERP ni ERV1. En particular, establece ocho posiciones conceptuales, Hero de fotografía única, servicios/eventos integrados, galería principal de decoraciones, timeline horizontal, cinco canales del menú y contenido real validado.

## Investigación

[DocITyET](05-DiseñoUI_UX/Investigacion/DocITyET.md) documenta evaluación de tecnologías y herramientas. No define la estructura física de directorios ni es una especificación de implementación.

## Planeación y trazabilidad

| Documento | Función |
|---|---|
| [Plan maestro de implementación](Planeacion/PlanDeImplementacion.md) | Ejecución técnica y funcional por sprints 0–6, release y estabilización. Estado real por sprint, pruebas y dependencias. |
| [Matriz de trazabilidad V1](Planeacion/MatrizTrazabilidadV1.md) | Mapeo local de ERV1 a componentes, sprints, aceptación, evidencia y validación. Los IDs `TV1-*` no pertenecen a ERV1. |

[Release Candidate V1](Planeacion/ReleaseCandidateV1.md): corte técnico, QA, métricas, puerta de liberación y operación/rollback; no autoriza release por sí mismo.

## Auditorías históricas y evidencias académicas

| Documento | Interpretación |
|---|---|
| [Auditoría de consistencia documental](Planeacion/Auditoría%20de%20consistencia%20documental%20—%20Globows%20LM%20v1.0.0.md) | Diagnóstico y acuerdos previos; consultar ADR y plan vigentes para ejecución. |
| [Resumen ejecutivo Codex](Planeacion/ResumenEjecutivoCodex.md) | Línea de base de auditoría pre-repositorio; sus hallazgos pueden cambiar de estado tras hardening. El seguimiento actual se registra en el plan. |
| [PlanAvance2](Planeacion/PlanAvance2.md) | Objetivos, calendario y evidencias académicas; no es el plan productivo ni agrega funcionalidades a ERV1. |

## Pendiente o futuro

ERV2 y las especificaciones de versiones posteriores aún no existen. No se crearán documentos de backend, API, base de datos, autenticación ni CMS como parte de la V1. El dominio permanente, correo oficial y credenciales individuales/evidencias siguen específicamente ausentes o sin confirmar. La aprobación del preview ya está vigente. Release, indexación y tratamiento del riesgo dev requieren autorización expresa.
