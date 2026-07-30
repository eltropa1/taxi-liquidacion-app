# GeoTaxi · Branding v1.0

> Estado: 🟢 Aprobado. Este documento fija el nombre, posicionamiento y voz de GeoTaxi. La especificación del símbolo (geometría, color, aplicaciones, reglas de uso) vive en `GeoTaxi Glyph System v1.0.md` — no se repite aquí.
>
> Forma parte del conjunto **GeoTaxi Design Language** — ver `GeoTaxi Design Language v1.0.md` para el índice completo.

---

## 1. Nombre del producto

**El nombre oficial y único es `GeoTaxi`.** Siempre con esa capitalización exacta (G y T mayúsculas, sin espacio, sin guion).

**Nota de higiene documental:** varios documentos de arquitectura y dominio anteriores a este (`docs/00-product-construction-principles.md`, `docs/domain/03-visual-domain.md`, `docs/design/Operational Lists Standard v1.0.md`, y la mayoría de `docs/architecture/*`) usan `TaxiGeo` en su lugar. Es un nombre heredado de una fase anterior del proyecto y **queda deprecado**. No se ha reescrito cada archivo de arquitectura para no tocar documentación fuera del alcance visual/de producto, pero cualquier referencia nueva — código, UI, documentación de diseño — usa `GeoTaxi`. Si un LLM u otra persona encuentra `TaxiGeo` en un documento de arquitectura antiguo, debe leerlo como sinónimo histórico de `GeoTaxi`, nunca como un nombre alternativo válido para uso nuevo.

`app.json` (`expo.name`) ya usa `"GeoTaxi"` — es lo que aparece en el launcher y el selector de apps del teléfono.

---

## 2. Posicionamiento

Frase de posicionamiento (recurrente en `GeoTaxi Interaction Principles v1.0`): **"Diseñado por un taxista, para taxistas."**

GeoTaxi no compite por ser la app más vistosa. Compite por ser la que un taxista profesional reconoce como hecha por alguien que entiende su turno de 14 horas: calma, precisión, rapidez, control. Ver la misión completa en `GeoTaxi Design Language v1.0.md` §1 (Filosofía).

**Lo que GeoTaxi nunca dice de sí misma:** "la app más innovadora", "revolucionaria", "todo en uno", superlativos de marketing genérico. El posicionamiento se apoya en la competencia operativa, no en el lenguaje publicitario.

---

## 3. Voz y tono (microcopy)

No existía una guía de voz antes de este documento. Reglas:

| Aspecto | Regla |
|---|---|
| Persona gramatical | Segunda persona informal ("tu jornada", "cambia una, no modifica las demás") — nunca "usted", nunca tercera persona robótica ("el usuario debe..."). |
| Longitud | Frases cortas. Si una etiqueta necesita más de ~8 palabras para explicarse, la etiqueta está mal — se simplifica el flujo, no se alarga el texto. |
| Tecnicismos | Cero jerga de desarrollador visible ("payload", "sync", "render") y cero jerga financiera innecesaria. Se habla de "recaudación", "jornada", "servicio" — el vocabulario del propio taxista. |
| Errores | Se describe qué pasó y qué hacer, nunca un código de error crudo. "No se ha podido guardar la nota. El texto se conserva." es el tono correcto (ejemplo real ya en el código, `RecordEnrichmentSection.tsx`). |
| Confirmaciones destructivas | Directas, sin suavizar ni dramatizar: "¿Eliminar este adjunto?" — no "¿Estás completamente seguro de que quieres...". |
| Mayúsculas | Nunca todo en mayúsculas para textos largos. Solo etiquetas cortas de estado/pestaña ("ACTIVA", "CERRADA") siguiendo la regla de `text-caption` de `design.md`. |
| Humor / personalidad | Ninguno. GeoTaxi no bromea, no usa exclamaciones triunfales ("¡Genial! 🎉"). La calma es la personalidad. |

---

## 4. Identidad tipográfica

GeoTaxi **no tiene una fuente de marca**. Usa la fuente del sistema (SF Pro en iOS, Roboto en Android) — decisión ya fijada en `design.md` §2 y deliberada: *"La identidad no vive en la tipografía, vive en cómo se usa."* Si en algún momento se necesita un wordmark (texto "GeoTaxi" estilizado, p. ej. para una tienda de apps o material externo), debe componerse con la misma fuente del sistema en peso Bold/700, nunca con una tipografía decorativa o caligráfica — mantiene la disciplina de "cero elementos gráficos con pretensión de firma" ya establecida en `design.md` §5.

---

## 5. El símbolo

El símbolo oficial de GeoTaxi (el "Glyph" — concepto **"Trayecto": dos trayectorias que convergen en un único punto**) tiene su propia especificación completa, con autoridad exclusiva sobre geometría, color, aplicaciones permitidas/prohibidas y formatos de exportación: **`GeoTaxi Glyph System v1.0.md`**.

Este documento de Branding no repite esa geometría — solo la referencia. Si necesitas producir el asset (con OpenAI u otra herramienta), el brief completo y autocontenido está en `GeoTaxi Glyph System v1.0.md` §2 a §6.

---

*Este documento resuelve el nombre, posicionamiento y voz. Para el símbolo, `GeoTaxi Glyph System v1.0.md`. Para la filosofía de producto completa y el mapa de todos los documentos del sistema, ver `GeoTaxi Design Language v1.0.md`.*
