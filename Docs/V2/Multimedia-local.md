# Biblioteca multimedia local

En el panel, abre **Multimedia** para subir, consultar, previsualizar y editar archivos. Los selectores de Sitio y Servicios muestran archivos disponibles del tipo admitido.

| Tipo | Formatos | Límite |
|---|---|---|
| Imagen | JPEG, PNG, WebP | 15 MiB y 40 megapíxeles |
| Video | MP4, WebM | 100 MiB |

El navegador solicita un ticket y sube los bytes directamente a la API con el tipo y tamaño registrados. El ticket vence a los cinco minutos y se consume al procesar el primer intento autorizado. La previsualización vence a los dos minutos. Sus direcciones llevan un ticket privado y se deben tratar como enlaces privados.

El origen de multimedia que usa el navegador se configura con `CMS_MEDIA_ORIGIN` al compilar y arrancar Next. Para Chromium en la red de QA se usa `http://api:3101` con `APP_ORIGIN=http://127.0.0.1:3100`. Para revisión desde el navegador del host usa `http://127.0.0.1:3101`. En un entorno remoto se requiere HTTPS y el origen exacto del frontend debe coincidir con el `APP_ORIGIN` de la API.

La API publica bytes solo cuando el archivo está disponible y pertenece a una publicación activa. Permite rangos simples y devuelve `416` cuando el rango es insatisfacible. El retiro y borrado consultan las referencias editoriales. Conserva el volumen de archivos junto con la base de datos en las copias de respaldo.

Para inspeccionar archivos huérfanos con más de 24 horas, ejecuta en el contenedor de la API

```powershell
docker compose -f compose.local.yml --env-file .env.harness.local exec api node dist/src/media/cleanup-cli.js
```

La salida JSON enumera candidatos sin modificar archivos. Verifica cada candidato frente al inventario y respaldo antes de cualquier retiro operativo.
