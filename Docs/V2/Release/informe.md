# Informe FREE-01

Estado actual y operaciones persistentes en [estado.json](estado.json). [Decisiones](decisiones.md) · [Preflight P18](evidencias/P18.md) · [Roles P19](evidencias/P19.md) · [Seguridad P20](evidencias/P20.md) · [Candidata 2.0.0-rc.1](../Candidata-2.0.0-rc.1.md)

[Persistencia P21](evidencias/P21.md) · [Configuración cloud](operacion-cloud.md) · [Diagnóstico del preview P23](evidencias/P23.md)

## Checkpoint

P19 integrado como `04f67d5c90e2dcf539944578cc7b4ef6b0717858`. P20 integrado como `b1bf4cc545b95a180bf4817a3d4eaf49160ec82b`. P21 publicado como `7fa0b44c25eacf70882e68651ee9364032c98445`. Supabase tiene seis migraciones, TLS en ambos tramos del pooler, RLS sobre 16 tablas y Storage privado verificado. El preview automático de P20 falló por alcance TypeScript. La corrección excluye el backend del proyecto TypeScript de Next.

OpenAPI local del stack P21, 27 rutas, SHA-256 `03e56deea2d4ebcbceba57ac1a2b30eb55d48881f0a9eceb61a65c5399abc081`. Archivo local `.visual-evidence/release/openapi-local-free01.json`.

El release comercial sigue condicionado por Vercel Hobby. Los gates bloqueados conservan sus requisitos completos. No se aprovisionaron recursos de pago.
