# GeoTaxi · Iconografía v1.0

> Estado: 🟢 Aprobado. Cubre los iconos de **interfaz genérica** (navegación, acciones, chrome). Para los iconos de **dominio** (tipo de servicio, método de pago, plataforma) ver `docs/domain/03-visual-domain.md` §7-8 — ese sistema ya existe, es distinto, y este documento no lo sustituye ni lo repite.
>
> Forma parte del conjunto **GeoTaxi Design Language** — ver `GeoTaxi Design Language v1.0.md` para el índice completo.

---

## 1. Por qué existía un hueco

`03-visual-domain.md` define con precisión los iconos que identifican *conceptos de negocio* (Uber, Cabify, pago con tarjeta, aeropuerto...). Pero la app también tiene decenas de iconos que no identifican ningún concepto de dominio — son *chrome de interfaz*: la flecha de "volver", el icono de "editar", el calendario para abrir un selector de fecha, el bote de basura de "eliminar". Ese segundo sistema nunca se documentó, y la auditoría de esta sesión encontró una grieta real por su ausencia: los botones de calendario en Inicio y Resumen usaban el emoji 📅 (renderizado a todo color por el sistema operativo del teléfono, fuera de cualquier control de marca) mientras el resto de la app usaba `MaterialIcons` monocromo. Ya corregido en código — este documento fija la regla para que no vuelva a pasar.

---

## 2. Regla única

**Todo icono de interfaz genérica es `MaterialIcons` de `@expo/vector-icons`. Nunca un emoji, nunca un carácter Unicode decorativo (✓, ›, ‹ son la única excepción — ver §5), nunca un PNG/SVG custom salvo que este documento se actualice explícitamente para añadirlo.**

Motivo: un emoji lo renderiza el sistema operativo del teléfono con su propio estilo (a todo color, con variaciones entre fabricantes de Android). Eso rompe la regla central del sistema — "el mismo verde, el mismo radio, nunca varía entre pantallas" (`design.md` §6) — porque introduce un elemento que la app no controla. `MaterialIcons` es monocromo, hereda el `color` que se le pasa por props exactamente como cualquier texto, y ya es una dependencia instalada y usada en `RegisteredServiceDetailLayout.tsx` y `RecordEnrichmentSection.tsx`.

---

## 3. Color

El icono de interfaz **nunca lleva un color propio inventado**. Toma su color de la misma paleta que rige el texto, siguiendo esta tabla:

| Contexto del icono | Color |
|---|---|
| Icono dentro de un botón/acción interactiva neutra (volver, inicio, calendario, más opciones) | `color-text-primary` (o `color-text-secondary` si es un icono secundario/de apoyo dentro de esa misma fila) |
| Icono que acompaña una acción o estado que "avanza el trabajo" (editar, encabezado de sección con acento) | `color-primary` |
| Icono de una acción destructiva (eliminar) | `color-danger` |
| Icono dentro de un botón cuyo fondo ya es `color-primary` sólido (ej. el "+" del CTA "Nuevo servicio") | `color-surface` (blanco/crema, para contraste sobre el verde) |

Esto es literalmente la misma tabla de decisión que ya rige el color del texto (`design.md` §1) — un icono de interfaz es, a efectos de color, un carácter tipográfico más. No tiene una paleta propia.

---

## 4. Tamaño

No hay una escala nueva — los tamaños ya en uso en el código son consistentes y se formalizan aquí:

| Tamaño | Uso |
|---|---|
| `15–16px` | Icono inline junto a un texto pequeño (etiqueta de campo, error) |
| `17–18px` | Icono de encabezado de sección (junto a un `text-heading`) |
| `20–22px` | Icono de botón de navegación (volver, inicio) — siempre dentro de un contenedor táctil de mínimo 44×44px (ver `GeoTaxi States and Feedback v1.0.md` sobre objetivos táctiles) |

**Regla:** el tamaño del icono lo determina el texto o el contenedor que lo acompaña, nunca al revés. No se elige un tamaño de icono "porque se ve bien" — se deriva del contexto tipográfico o del tamaño mínimo táctil.

---

## 5. Excepciones — glifos tipográficos, no iconos

Los siguientes caracteres **no** son iconos y no están sujetos a la regla de `MaterialIcons` porque son, funcionalmente, texto:

- `‹` `›` — flechas de navegación de fecha/paginación (ej. `dateNavigatorArrow` en Inicio/Resumen/Historial).
- `›` — chevron de "ir a" al final de una fila pulsable.
- `+` — el signo de "nuevo" dentro del círculo del CTA principal de Inicio.

Se mantienen como `Text` porque heredan directamente el tamaño/peso tipográfico de su contexto sin necesitar una librería de iconos, y porque son símbolos matemáticos universales, no pictogramas — no tienen el problema de inconsistencia visual entre plataformas que sí tiene un emoji.

---

## 6. Relación con los iconos de dominio (`03-visual-domain.md`)

El sistema de dominio (chip de plataforma con inicial y color, icono de método de pago) es **intencionalmente distinto**: ahí el color y el símbolo identifican un concepto de negocio (qué plataforma, qué forma de cobro) y por eso sí varían de color entre sí — esa variación es información, no decoración (`03-visual-domain.md` §1: *"el color no decora, comunica"*). Ese sistema no se toca ni se sustituye aquí.

**Cómo distinguir cuál aplica:** si el icono responde a la pregunta *"¿qué es esto en el negocio del taxista?"* (una plataforma, un método de cobro, un tipo de servicio) → `03-visual-domain.md`. Si responde a *"¿qué acción de interfaz es esta?"* (volver, editar, calendario, eliminar) → este documento.

---

## 7. Prohibido

- Emoji como icono funcional en cualquier parte nueva de la interfaz (chrome, no dominio).
- Iconos con relleno de color propio fuera de la tabla de §3.
- Mezclar dos librerías de iconos distintas en la misma pantalla.
- Iconos decorativos que no acompañan ninguna acción o texto — todo icono de interfaz debe tener un propósito funcional (misma regla que `design.md` §5: *"elementos de marca repetidos: evitar por defecto"*).

---

*Para el catálogo completo de componentes (dónde exactamente aparece cada icono, dentro de qué componente), ver `GeoTaxi Component Catalog v1.0.md`.*
