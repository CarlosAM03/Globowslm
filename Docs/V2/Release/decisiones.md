# Decisiones de liberación FREE-01

La autorización directa `APPROVE-GLOBOWS-V2-FREE-01` activa el sprint P18–P26 con presupuesto inicial y recurrente de 0 USD. El harness declarativo añade los gates de liberación y el runner P00–P17 se conserva en `DONE`.

- Frontend en el proyecto existente de Vercel, API NestJS en Render Free y persistencia en la instancia Supabase Free `globows-lm` que el titular aprovisionó para Globows LM. Mantener el bucket privado y el disco de Render como espacio temporal. Se adopta el proyecto suministrado como sustituto de la creación propuesta en P21.
- MEDIA-FREE-45 fija fotos en 15 MiB y video en 45 MiB en cloud. Conservar 100 MiB de video para Compose local.
- Una cuenta OWNER y una ADMIN con unicidad por rol, sin registro público y con acceso editorial completo. Solo ADMIN accede a auditoría técnica y diagnóstico sanitizado.
- Conservar los pendientes editoriales auténticos y los cambios definitivos de V1 que puedan reconciliarse. Mantener noindex.
- Push de V2 revisada en P20. PR a main, merge, promoción, tag y release v2.0.0 siguen la secuencia de P26 una vez satisfechos los gates y los límites de los planes.
- Al reanudar, contrastar el estado, los trailers `Release-Patch: Pxx` y el SHA de cada rama con los recursos reales antes de repetir operaciones persistentes.

## Confirmaciones del propietario del 26 de noviembre

Render se limita al workspace dedicado GlobowsLM, sin método de pago. Supabase GlobowsLM usa el proyecto Free dedicado ya aprovisionado. El titular completó OAuth y Codex verificó lectura de tablas en el proyecto exacto. El titular entregará la contraseña de PostgreSQL por un mecanismo seguro cuando sea necesaria.

El sitio busca captar clientes. Vercel `globowslm` está en Hobby y el titular ratificó su uso exclusivo para desarrollo y validación inicial no comercial. Quedan bloqueadas la publicación para captar clientes y la aceptación comercial. El titular conserva los proveedores existentes y el presupuesto de 0 MXN. [Alternativas evaluadas](hosting-frontend.md)
