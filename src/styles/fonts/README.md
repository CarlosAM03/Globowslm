# Fuentes locales de Globows LM

Manrope (200–800) y Cormorant Garamond (300–700), estilo normal, subconjunto latino con caracteres españoles. Se usan sin modificar mediante `next/font/local`; desarrollo, CI y Vercel no descargan fuentes durante el build.

Distribución oficial Google Fonts, consultada el 13/10/2026 mediante la API CSS2. Los archivos WOFF2 se conservan dentro del repositorio para reproducibilidad:

| Archivo | Origen | SHA-256 |
|---|---|---|
| `manrope-latin-variable.woff2` | https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2 | `A30DDCD349703AFF7464C34BEF3FFFDFF405EE50C113440D7C8693C02D210972` |
| `cormorant-garamond-latin-variable.woff2` | https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2 | `D80DF8FF5AECD299A61549F9E29AB1ED0B9B05F4EA71D50FE978E07D5240B235` |

Ambas familias permiten incorporación y redistribución con software bajo SIL Open Font License 1.1. Se incluyen avisos de copyright y licencias completas en `manrope-OFL.txt` y `cormorant-garamond-OFL.txt`, tomados de `google/fonts` en el commit `66928797f271fed5ee428544e7229685e2d90127` (directorios `ofl/manrope` y `ofl/cormorantgaramond`). Los créditos no implican endorsement del producto.
