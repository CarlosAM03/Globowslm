# Dependencias de Globows LM V2

## Frontend

La versión exacta de cada dependencia directa coincide con la entrada de `package-lock.json`, que conserva su URL e integridad del registro npm. Las dependencias de desarrollo se instalan en la imagen de QA.

| Dependencia | Versión | Licencia | Uso |
|---|---|---|---|
| next | 16.4.6 | MIT | App Router, frontend y BFF |
| react, react-dom | 19.3.0 | MIT | Componentes y renderizado |
| lucide-react | 1.56.0 | ISC | Iconos |
| @tailwindcss/turbopack, tailwindcss | 4.3.3 | MIT | CSS y loader Turbopack |
| @types/node | 20.19.43 | MIT | Tipos del baseline web |
| @types/react, @types/react-dom | 19.3.0 | MIT | Tipos de componentes y renderizado |
| eslint | 9.39.5 | MIT | Lint web |
| eslint-config-next | 16.4.6 | MIT | Reglas del framework |
| typescript | 5.9.3 | Apache-2.0 | Tipos y compilación |
| @playwright/test | 1.64.0 | Apache-2.0 | E2E Chromium |
| @axe-core/playwright | 4.13.0 | MPL-2.0 | Accesibilidad en E2E |
| lighthouse | 13.5.0 | Apache-2.0 | Auditorías de laboratorio |
| sharp | 0.35.5 | Apache-2.0 | Imágenes y generación de derivados |

Next acepta Node >=20.9 y React 19. Su configuración ESLint admite ESLint >=9 y TypeScript >=3.3.1. Node 22.23.5 incluye npm 10.9.9 y satisface los rangos del proyecto. Chromium 156.0.8078.4 procede del manifiesto de Playwright 1.64.0.

El lock fija los binarios críticos: `@next/swc-linux-x64-gnu@16.4.6` (MIT) y `@img/sharp-linux-x64@0.35.5` (Apache-2.0). El runtime de Next resuelve `postcss@8.5.23` (MIT).

## Imágenes oficiales

Las referencias incluyen el digest del índice OCI y permiten que el motor seleccione el manifiesto de su plataforma. La verificación local usa Linux amd64.

| Imagen | Digest del índice | Manifiesto Linux amd64 |
|---|---|---|
| `node:22.23.5-bookworm-slim` | `sha256:e9f565d32859f0cbfb52125eafe8be39390f24dac302dc3cdf566e8ba3ab21ee` | `sha256:47725aca53d3295ec2d3be8f62726599b3033cc262edc2c7e429909b3ac599fc` |
| `postgres:16.16-bookworm` | `sha256:ce3efec6bc404f6b15ebf5d9bed6b45a9d4655aea238d7dacc3467ccb05a1175` | `sha256:59ab0bbd4930fcd32dd4389836c0bfbf87431ffa87097c739a71210f7aed58c9` |

Node 22.23.5 incorpora las correcciones LTS publicadas el 11 de noviembre de 2026. El binario PostgreSQL reportó 16.16 dentro de la imagen exacta. [Release LTS de Node](https://nodejs.org/en/blog/release/v22.23.5/)

## Backend previsto para P02

Se verificaron las versiones, licencias, engines, peers e integridad de los candidatos en el registro npm. P02 aplicará los pines solo a paquetes usados y validará el lockfile, la generación de Prisma y las migraciones contra PostgreSQL 16.

| Dependencias previstas | Versión | Licencia | Compatibilidad |
|---|---|---|---|
| @nestjs/common, @nestjs/core, @nestjs/platform-express | 12.6.0 | MIT | Node >=20, peers de Nest 12 |
| @nestjs/swagger | 12.1.2 | MIT | Node >=22.12 en rama 22, Nest 12 y TypeScript 5.5+ |
| reflect-metadata | 0.2.2 | Apache-2.0 | Peer de Nest |
| rxjs | 7.8.2 | Apache-2.0 | Nest solicita ^7.1.0 |
| prisma, @prisma/client, @prisma/adapter-pg | 7.10.1 | Apache-2.0 | CLI y cliente estables de la misma versión. Node >=22.12 en rama 22, TypeScript >=5.4 |
| pg | 8.23.1 | MIT | Node >=16, dentro del rango ^8.16.3 del adaptador |
| typescript | 5.9.3 | Apache-2.0 | Compilador ya utilizado por web |
| eslint, @eslint/js, typescript-eslint | 10.15.0 / 10.0.1 / 8.74.0 | MIT | ESLint 10 en el backend nuevo. Node >=22.13 en rama 22 y TypeScript 5.9 |

El dist-tag de `prisma@latest` devolvió una prerelease 8.0.0-rc.35. El pin 7.10.1 usa una publicación estable comprobada para CLI, cliente y adaptador.

## Riesgo y actualización

Next 16.4.6 corrige los avisos críticos y altos de runtime observados en P00. La auditoría de runtime de npm después del cambio de Next reportó cero. El fin de soporte de ESLint 9 afecta al QA web y se mantiene bajo seguimiento. La cadena de desarrollo `eslint-config-next → @next/eslint-plugin-next → fast-glob@3.3.1 → micromatch@4.0.8 → braces@3.0.3` permanece documentada por V1. El registro no reprodujo el aviso histórico de `braces` en las auditorías de P00 y P01 y la decisión de V1 sigue pendiente.

Repetir auditoría runtime y completa para web y backend en P17. Un hallazgo alto o crítico en runtime requiere remediación compatible antes de cerrar la candidata. Para nuevas dependencias se registra la necesidad y se agrega la versión exacta junto con su lockfile.
El ajuste compatible del lockfile de P01 actualizó las cadenas de desarrollo a `fast-uri@3.1.9` (BSD-3-Clause), `minimatch@3.1.5` (ISC) y `typescript-eslint@8.74.0` (MIT) en la raíz del árbol. La auditoría completa devuelta por npm tras ajustar el lock reportó cero hallazgos.

## P02

El backend usa Express 5.3.0, @types/express 5.0.6 y @types/node 22.20.5, todos MIT. El paquete PostgreSQL pg está fijado a 8.23.1. El lock conserva la integridad de cada entrada. Las imágenes PostgreSQL y Node usan los digests verificados en P01.

Prisma 7.10.1 solicitaba Effect 3.20.0 en @prisma/config. El override aplica Effect 3.22.1 (MIT) solo en esa cadena y conserva el major de Prisma. El lock corregido pasó las auditorías npm de runtime y completa con cero hallazgos. Revisar el override cuando Prisma adopte una versión parcheada. [Aviso GHSA-7589-6fvf-x4pw](https://github.com/advisories/GHSA-7589-6fvf-x4pw)

## P03

Zod 4.6.7 (MIT) valida formas estrictas, límites y tipos del dominio editorial. Es una dependencia directa de runtime fijada con integridad en el lock del backend. La resolución npm del lock reportó cero hallazgos.

## P04

El backend fija @node-rs/argon2 2.2.2 (MIT) para hash Argon2id. El lock conserva la integridad del paquete y sus binarios opcionales. La resolución npm reportó cero vulnerabilidades.

## P08

Sharp 0.35.5 (Apache-2.0) se fija en el backend para decodificar imágenes y limitar píxeles. Su lock registra integridad de los binarios opcionales de libvips. Debian Bookworm fija FFmpeg en `7:5.1.9-0+deb12u1` para inspeccionar contenedores de video en un subproceso con tiempo, salida y protocolos limitados. Revisar avisos de ambos decodificadores al actualizar el lock o la imagen. La resolución del lock de npm reportó cero vulnerabilidades. [Documentación de Sharp](https://sharp.pixelplumbing.com/api-input/) [Documentación de ffprobe](https://ffmpeg.org/ffprobe.html)
