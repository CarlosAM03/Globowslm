# Globows LM V2

El ERP §7 define el alcance de V2. Los documentos de V1 en [Docs/Index.md](../Index.md) conservan su autoridad sobre identidad, contenido comercial y regresión. La activación `APPROVE-GLOBOWS-V2` aprobó los siguientes contratos.

- [ERV2](ERV2.md) describe M01–M12 y sus criterios de aceptación.
- [ADR](ADR.md) documenta las decisiones V2-01–V2-10.
- [Contratos](CONTRACTS.md) define modelos, API, publicación, media e importación.
- [Dependencias](Dependencias.md) registra versiones, procedencia y riesgos.
- [Evidencias](Evidencias/) registra los resultados de cada patch.

## Arquitectura

Next.js conserva el frontend en la raíz y actúa como BFF para el panel. El servidor Next consulta el contenido publicado a través de la API NestJS y mantiene los secretos fuera del navegador. PostgreSQL guarda el contenido, las revisiones, las referencias y la auditoría. La API sirve archivos desde un volumen durable y autoriza subidas directas mediante tickets de uso único.

Compose local separa el entorno de revisión y las pruebas que escriben datos. La API y el frontend tendrán puertos publicados únicamente en loopback. PostgreSQL quedará en la red de Compose. La importación de datos aprobados de V1 y el seed demostrativo serán operaciones explícitas.

La validación de cierre cubre `2.0.0-rc.1` en local, incluida la restauración de PostgreSQL y media. La validación de la propietaria, la sincronización con la V1 liberada y la conexión a servicios productivos se realizan después.
