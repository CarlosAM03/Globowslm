
# Manual de Identidad Digital (MID)

## Plataforma Integral para Globows LM by Licey Márquez

Versión: 1.0.0

- Sistema de Diseño Oficial Globows LM by Licey Márquez.
- Estado: Cerrado hasta versiones superiores a 1.0.0 de la plataforma.

- **Vigencia de arquitectura V1.0.0:** los tokens, tipografías y reglas visuales siguen vigentes. Las propuestas de secciones, Hero, galerías, testimonios/FAQ, menú flotante y evolución que aparecen más adelante se interpretan con las decisiones D01–D09 del [ADR consolidado](05-ADR-Arquitectura-UI-Consolidada.md). Esta nota registra su reconciliación sin alterar la identidad oficial.

Fecha: 01 Agosto 2026

Documento derivado del Brand Discovery v1.0.

# 1. Propósito del documento

El Manual de Identidad Digital (MID) define todas las reglas visuales y de experiencia de usuario que deberán respetarse durante el desarrollo de la plataforma Globows LM.

Su objetivo consiste en traducir la identidad estratégica descrita en el Brand Discovery en un sistema visual consistente, reutilizable y escalable.

Este documento funciona como la fuente oficial para todas las decisiones relacionadas con:

* Diseño UI.
* Experiencia de usuario (UX).
* Componentes visuales.
* Sistema de diseño.
* Desarrollo Frontend.

El MID complementa al Brand Discovery y no lo sustituye.

Mientras el Brand Discovery responde quién es la marca, el MID responde cómo debe representarse digitalmente.

---

# 2. Principios del sistema de diseño

Todo elemento desarrollado para la plataforma deberá respetar los siguientes principios.

## La marca es el protagonista

La interfaz existe para potenciar el trabajo realizado por Globows LM.

Nunca deberá competir visualmente con las decoraciones.

---

## La fotografía comunica más que la interfaz

Las imágenes representan el principal recurso de comunicación.

El diseño deberá servir como marco para destacar el contenido fotográfico.

---

## La elegancia nace de la simplicidad

Se evitará cualquier elemento visual innecesario.

La experiencia deberá sentirse limpia, organizada y profesional.

---

## El contenido siempre tiene prioridad

La información deberá ser clara y fácilmente escaneable.

Los efectos visuales nunca deberán dificultar la lectura.

---

## Mobile First

Todas las decisiones de diseño deberán comenzar considerando dispositivos móviles.

Posteriormente se adaptarán a tablet y escritorio.

---

## Consistencia sobre creatividad

La creatividad pertenece a las decoraciones.

La interfaz debe ser consistente.

---

## Cada pantalla debe acercar al usuario al contacto

Toda vista deberá conducir naturalmente hacia una acción de conversión.

Principalmente:

* WhatsApp
* Redes sociales
* Solicitud de información
* Reserva de cursos

En V1, cualquier solicitud de reserva se canaliza por contacto externo; no existe inscripción o reserva automatizada (ERV1, §6).

---

# 3. Design Tokens

Todo el sistema visual se construirá utilizando Design Tokens para garantizar consistencia durante el desarrollo.

## Colores principales

### Primary

Magenta Globows

HEX

#B3006D

Uso

* CTA principales
* Botones
* Links
* Estados activos

---

### Secondary

Rosa Globo

HEX

#F7B7D8

Uso

* Fondos suaves
* Cards especiales
* Etiquetas

---

### Surface

Rosa Pastel

HEX

#FADAE9

Uso

* Fondos alternativos
* Secciones
* Hover muy suaves

---

### Accent

Dorado Champagne

HEX

#D4AF37

Uso

* Certificaciones
* Badges
* Reconocimientos
* Elementos Premium

---

### Neutral

White

#FFFFFF

Gray 100

#F7F7F7

Gray 300

#DADADA

Gray 500

#666666

Gray 900

#2B2B2B

---

## Estados

Success

Verde suave

Warning

Amarillo cálido

Danger

Rojo suave

Info

Azul claro

Estos colores únicamente se utilizarán para estados del sistema y nunca como parte de la identidad principal.

---

# 4. Sistema Tipográfico

La tipografía deberá transmitir elegancia sin perder legibilidad.

## Logotipo

Se mantiene la tipografía oficial de la marca.

No deberá ser sustituida.

---

## Tipografía principal

Manrope

Uso

* Navegación
* Párrafos
* Botones
* Formularios
* Cards
* Etiquetas

---

## Tipografía editorial

Cormorant Garamond

Uso

* Hero
* Encabezados
* Frases destacadas
* Secciones principales

---

## Escala tipográfica

Display

56 px

H1

48 px

H2

40 px

H3

32 px

H4

24 px

Body Large

20 px

Body

18 px

Small

16 px

Caption

14 px

---

# 5. Sistema de Espaciado

Todo el proyecto utilizará una retícula basada en múltiplos de 4 px.

Escala oficial

4

8

12

16

20

24

32

40

48

64

80

96

128

Nunca deberán utilizarse valores arbitrarios.

---

# 6. Border Radius

Small

8 px

Medium

12 px

Large

16 px

Extra Large

24 px

El radio principal del proyecto será 16 px.

---

# 7. Elevaciones

Shadow XS

Separaciones mínimas

Shadow SM

Cards

Shadow MD

Componentes flotantes

Shadow LG

Hero Cards

Nunca utilizar sombras dramáticas.

Las sombras deberán transmitir ligereza.

---

# 8. Grid y Layout

Container máximo

1280 px

Padding Desktop

80 px

Tablet

48 px

Mobile

24 px

La composición deberá mantener amplios espacios en blanco.

---

# 9. Responsive Design

Breakpoints

320

375

390

428

640

768

1024

1280

1440

1536

Toda pantalla deberá diseñarse primero para dispositivos móviles.

---

# 10. Sistema de Iconografía

Biblioteca oficial

Lucide Icons

Características

* Outline
* Stroke 1.75
* Bordes suaves
* Minimalista

Tamaños

16

20

24

32

48

Nunca utilizar

* Emojis
* Cliparts
* Iconografía infantil
* Iconos tridimensionales

---

# 11. Sistema Fotográfico

La fotografía constituye el principal activo visual de Globows LM.

Todo el contenido deberá mostrar situaciones reales.

Se priorizarán fotografías donde aparezcan:

* Decoraciones terminadas.
* Clientes satisfechos.
* Cursos presenciales.
* Alumnos.
* Certificaciones.
* Licey Márquez impartiendo clases.
* Procesos de trabajo.
* Detalles de calidad.

Las fotografías deberán contar una historia.

No únicamente mostrar globos.

Siempre deberán transmitir:

* Celebración.
* Aprendizaje.
* Profesionalismo.
* Creatividad.
* Orgullo.
* Confianza.

Nunca utilizar:

* Fotografías oscuras.
* Filtros agresivos.
* Imágenes pixeladas.
* Fotografías de stock.
* Composiciones saturadas.

---

# 12. Componentes del Sistema

La primera versión del sistema incluirá los siguientes componentes reutilizables.

## Navegación

Navbar principal.

---

## Hero

Hero con fotografía protagonista.

CTA principal.

CTA secundario.

---

## Botones

Primary

Secondary

Ghost

Social

WhatsApp

---

## Cards

Servicio

Curso

Certificación

Galería

Testimonio

`Testimonio` y `FAQ` son componentes condicionales: solo se materializan con contenido real y validado, conforme a D04 y D09.

---

## Componentes especiales

Floating Social Menu

Galería Masonry

Carousel

Timeline

FAQ

Footer

El carrusel de este catálogo no define el Hero V1: D03 establece una sola fotografía. La galería puede incorporar interacción únicamente si aporta valor y preserva la clasificación aprobada en D05.

---

# 13. Motion Design

Toda animación deberá sentirse natural.

Duración

200–300 ms

Animaciones permitidas

Fade

Slide

Scale

Opacity

Scroll Reveal

Hover

Nunca utilizar

Bounce

Shake

Rotaciones exageradas

Animaciones infinitas innecesarias

---

# 14. Accesibilidad

Toda interfaz deberá cumplir como mínimo con:

* Contraste AA.
* Navegación mediante teclado.
* Focus visible.
* Tamaños táctiles mínimos de 44 px.
* Texto alternativo en imágenes.
* Etiquetas ARIA cuando sea necesario.

---

# 15. Uso del Logotipo

El logotipo oficial constituye el principal identificador de la marca.

Lineamientos

* Mantener siempre su proporción original.
* No modificar colores.
* No deformar.
* No aplicar sombras.
* No añadir contornos.
* No utilizar sobre fondos que dificulten su lectura.

Siempre deberá existir un área de protección equivalente a la altura del moño presente en el logotipo.

---

# 16. Recursos Gráficos

Los recursos gráficos deberán complementar el contenido, nunca competir con él.

Elementos permitidos

* Formas orgánicas inspiradas en globos.
* Gradientes suaves.
* Texturas ligeras.
* Detalles florales discretos.
* Motivos circulares.
* Destellos sutiles.
* Líneas curvas.

Elementos prohibidos

* Cliparts.
* Ilustraciones infantiles.
* Texturas pesadas.
* Patrones excesivos.
* Fondos con alto ruido visual.

---

# 17. Guía para Desarrollo

La implementación de la interfaz deberá seguir las siguientes decisiones tecnológicas definidas para la versión 1.0.0.

Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion

Reglas

* Mobile First.
* Componentes reutilizables.
* Design Tokens centralizados.
* No utilizar estilos inline.
* No utilizar Bootstrap.
* Mantener separación entre lógica y presentación.
* Optimización de imágenes mediante `next/image`.

---

**Nota editorial de vigencia:** los apartados 18–25 proceden de una propuesta de evolución del MID. Sus reglas visuales se conservan; cualquier composición o roadmap divergente queda reemplazado en V1 por el ADR consolidado y, para evolución funcional, por el ERP (D08).

---

# 18. Arquitectura de la Landing

La Landing Page constituye el primer punto de contacto entre Globows LM y sus futuros clientes.

Su estructura deberá guiar al usuario de forma natural desde el descubrimiento de la marca hasta el contacto directo mediante WhatsApp o cualquiera de los canales oficiales.

La navegación deberá sentirse intuitiva, ligera y enfocada en la conversión.

## Estructura general

**Composición vigente V1 (D01, D02, D04 y D05):** Navbar, Hero, Sobre Licey, Servicios y Eventos, Galería de Decoraciones, Formación Profesional, Certificaciones, Confianza y Orientación solo con testimonios/FAQ validados, Contacto y CTA final, Footer. El FloatingContactMenu pertenece al layout global. Son ocho posiciones conceptuales; se publican siete secciones si la posición condicional se omite.

La secuencia que sigue se conserva como propuesta histórica anterior al ADR. Sus dos galerías y las posiciones independientes de Testimonios/FAQ no constituyen secciones adicionales obligatorias de V1.

```
Navbar

↓

Hero

↓

Sobre Licey Márquez

↓

Servicios

↓

Galería Destacada

↓

Cursos y Formación

↓

Certificaciones

↓

Testimonios

↓

Galería por Categorías

↓

Preguntas Frecuentes

↓

Llamado a la acción

↓

Footer
```

Cada sección deberá responder una pregunta del visitante.

| Sección         | Objetivo                   |
| --------------- | -------------------------- |
| Hero            | Captar atención            |
| Sobre mí        | Generar confianza          |
| Servicios       | Explicar qué hace la marca |
| Galería         | Demostrar calidad          |
| Cursos          | Mostrar autoridad          |
| Certificaciones | Validar experiencia        |
| Testimonios     | Reducir incertidumbre      |
| FAQ             | Resolver objeciones        |
| CTA             | Convertir al visitante     |

---

# 19. Componentes de Conversión

Toda interacción importante deberá conducir al usuario hacia un canal de contacto.

## CTA Primario

WhatsApp

Se utilizará para:

* Solicitar cotización.
* Reservar fecha.
* Solicitar información.
* Resolver dudas.

---

## CTA Secundario

Redes sociales.

Permitirá conocer más trabajos realizados.

---

## CTA Terciario

Formulario de contacto.

Preparado para futuras versiones.

---

## Menú flotante

Durante toda la navegación deberá permanecer visible un botón flotante que permita desplegar los accesos rápidos hacia:

* WhatsApp
* Facebook
* Instagram
* TikTok
* Correo electrónico

Este componente constituye uno de los principales mecanismos de conversión del sitio.

El quinto canal es obligatorio por ERV1 §4 y D07. Los enlaces y mensajes exactos requieren validación; D06 exige mensajes WhatsApp según el servicio.

---

# 20. Estrategia Fotográfica

La Landing deberá construirse alrededor del contenido fotográfico.

No alrededor de bloques de texto.

## Hero

Una única fotografía de alto impacto.

---

## Servicios

Fotografías representativas.

---

## Cursos

Fotografías mostrando enseñanza.

Nunca únicamente alumnos posando.

---

## Galerías

La propuesta visual original contempla entre cuatro y seis fotografías por categoría. La taxonomía y disponibilidad reales se validarán antes de fijar categorías publicadas; no se crearán categorías vacías ni fotografías ficticias (D05 y D09).

Categorías iniciales:

* Bodas
* XV años
* Cumpleaños
* Baby Shower
* Temáticos

Las categorías podrán evolucionar conforme crezca el catálogo.

En V1, la galería principal presenta decoraciones. Las evidencias de formación y certificaciones permanecen en sus respectivas secciones (D05). La lista anterior es orientativa, no una afirmación de disponibilidad actual.

---

# 21. Microinteracciones

Las microinteracciones deberán reforzar la sensación de calidad del sitio.

Permitidas:

* Hover en botones.
* Elevación ligera en tarjetas.
* Animaciones Fade.
* Scroll Reveal.
* Transiciones suaves.
* Cambio de color gradual.

Nunca deberán distraer del contenido principal.

---

# 22. Rendimiento Visual

Toda decisión visual deberá considerar el rendimiento del sitio.

## Imágenes

* Formato WebP.
* Lazy Loading.
* Optimización mediante `next/image`.
* Tamaño adaptativo.

---

## Tipografías

* Carga mediante `next/font`.
* Evitar múltiples familias tipográficas.
* Precarga de fuentes críticas.

---

## Animaciones

Las animaciones deberán utilizar aceleración por GPU cuando sea posible.

Nunca bloquearán la interacción del usuario.

---

# 23. Evolución de la Identidad

**Ámbito:** el refinamiento visual puede versionarse en el MID. La secuencia funcional V1–V5 de la tabla histórica siguiente queda reemplazada por el roadmap del ERP según D08; no debe usarse para planificar módulos futuros.

La identidad digital evolucionará progresivamente conforme crezca la plataforma.

## V1.0.0

Landing institucional.

---

## V1.1

Optimización visual.

Nuevas fotografías.

Mejoras de accesibilidad.

---

## V2.0

Panel administrativo.

CMS.

---

## V3.0

Campus Digital.

---

## V4.0

Portal para alumnos.

---

## V5.0

ERP Globows LM.

---

# 24. Criterios de Aceptación

Una interfaz podrá considerarse terminada únicamente cuando cumpla todos los siguientes criterios.

## Identidad

* Mantiene coherencia con el Brand Discovery.
* Respeta la personalidad de la marca.
* Comunica profesionalismo.
* Refuerza la confianza.

## Diseño

* Utiliza exclusivamente componentes del sistema.
* Respeta la jerarquía tipográfica.
* Mantiene la paleta oficial.
* Conserva un espaciado consistente.

## Experiencia

* Navegación intuitiva.
* Responsive.
* Accesible.
* Carga rápida.

## Desarrollo

* Componentes reutilizables.
* Código limpio.
* Optimización de recursos.
* Sin estilos duplicados.

---

# 25. Roadmap del MID

El MID constituye un documento vivo.

La tabla siguiente describe versiones editoriales previstas del manual. Sus nombres de módulos no alteran el roadmap funcional del ERP, que prevalece por D08.

Toda modificación al sistema visual deberá registrarse mediante una nueva versión del documento.

| Versión    | Alcance                |
| ---------- | ---------------------- |
| MID v1.0.0 | Landing institucional  |
| MID v1.1.0 | Refinamiento visual    |
| MID v2.0.0 | Sistema administrativo |
| MID v3.0.0 | Campus digital         |
| MID v4.0.0 | Portal de alumnos      |
| MID v5.0.0 | ERP Globows LM         |

---

# Anexo de enlaces relacionados a GlobowsLM.

```tsx
# Imagenes, logo, decoraciones, anuncios para redes sociales o medios digitales

https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHTn_RByn5F3KF7NtJmbndS1iHbci93RWvi4znxqPZyQ&s



https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_4Dc0GLTjWYxI8Ie1JhYujiB20ckv8w3RWHNb0r2wnw&s



https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCIwgN7e_CYTUkvmDWCBWZgMKpXTwoeUnKtre7UeyGndSzR4_0-8a9N-U&s=10



https://scontent.ftij5-1.fna.fbcdn.net/v/t39.30808-6/690741577_1640846903919874_8190536135443969457_n.jpg?stp=dst-jpg_tt6&cstp=mx842x1515&ctp=s842x1515&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHlLvukRCaf_q8zorIpLMrs2iCT7g_0QxLaIJPuD_RDEho7WqW92QdlOjPZgVPb_J5FqIg2cachAaZsupaZvkt4&_nc_ohc=hfO2lORQdYcQ7kNvwHib-k_&_nc_oc=Adr9tAQCqh34Qo1Owh3rZMa4dfzB-H3Ga-fTTk5Ntc3zVRQaO2H0yL50Bm6LyyE34V4AjhPhVTUQKVfL60YU2PeF&_nc_zt=23&_nc_ht=scontent.ftij5-1.fna&_nc_gid=KCoqo9OM4jMhBRuD93LZCQ&_nc_ss=7b2a8&oh=00_AQEhAKfgYZ3Xr_jR79gGJnVtl__bYP7cKoj_SZITXmxIcQ&oe=6A738036



https://scontent-sjc6-1.xx.fbcdn.net/v/t39.30808-6/482229276_1305879304083304_2901448344245134899_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1080&ctp=s1080x1080&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeH5MfNe7wc6dTkNhmZb2e4r-vErbAgvQy368StsCC9DLWLoB4jeABkGE3VcMwAeOLR_a2xmnr1TIR_fDPepFpIr&_nc_ohc=3UrXWwYOc9kQ7kNvwE7EC_9&_nc_oc=AdojLBbAMeM0mVW1S_It8y8XS15Fo2NBsdnKPGIYOn6mTkzDsWTfm0a3v6wKQl1qoPH4stGdfOOhlLtCpdL62q-o&_nc_zt=23&_nc_ht=scontent-sjc6-1.xx&_nc_gid=gjDmQFpxaC-diVWVpSHbyg&_nc_ss=7b2a8&oh=00_AQGLFgV_yTMQl7oF1WkTHRlxVWqevRN3OZCciR5FX5UZHw&oe=6A736350



# redes sociales

https://www.facebook.com/globowslm?locale=es_LA



https://www.instagram.com/globows_lm/?hl=es



https://www.tiktok.com/@globows_liceymarquez



# certificaciones

https://sempertexmexico.com/certificate/



https://aqboficial.com



https://www.gob.mx/sep/acciones-y-programas/solicitud-de-acreditacion-y-certificacion-de-conocimientos-por-cada-certificado-de-competencia-ocupacional-de-capacitacion-para-el-trabajo-sep-13-003


```
