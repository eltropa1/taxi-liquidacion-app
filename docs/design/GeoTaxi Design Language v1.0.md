# GeoTaxi Design Language v1.0

> Estado: 🟢 Aprobado. **Este es el documento de entrada.** Si solo vas a leer un archivo de este proyecto para entender cómo se ve y se comporta GeoTaxi, es este. Cada sección resume su tema y enlaza al documento que lo trata en profundidad — no hace falta leer nada más para operar con criterio sobre cualquier pantalla nueva, pero si necesitas el detalle exacto (un valor hex, una regla de espaciado), está en el documento enlazado, no repetido aquí.

---

## 0. Qué es esto y por qué existe

GeoTaxi acumuló documentación de diseño en fases distintas — investigación de UX, principios de interacción, arquitectura de Home V2, y finalmente una sesión de auditoría y unificación de todo el sistema visual (colores, tipografía, tokens, modo oscuro, accesibilidad táctil) que dejó el código coherente pero la documentación repartida en fragmentos, con algunos huecos reales (motion, estados, catálogo de componentes, branding) sin cubrir.

Este documento y los que indexa son el resultado de cerrar esos huecos y de conectar todo en un único sistema con nombre: el **GeoTaxi Design Language**. No sustituye ningún documento anterior que siga siendo correcto — lo indexa, y donde encontró una contradicción o una referencia obsoleta, la corrigió (ver §5).

---

## 1. Filosofía del producto

GeoTaxi no es una aplicación bonita. Es una herramienta de trabajo para un taxista que puede estar hasta 14 horas seguidas usándola, muchas veces parado en un semáforo o entre carreras, a veces de noche, casi nunca con tiempo de sobra.

**La pregunta que decide cualquier cambio visual:** *¿esto hace que trabajar sea más fácil, rápido, seguro o descansado?* Si la respuesta es no, se descarta — sin importar lo bien que se vea.

**Lo que GeoTaxi debe transmitir:** calma, confianza, precisión, rapidez, profesionalidad, continuidad, limpieza, control.
**Lo que GeoTaxi nunca debe transmitir:** ansiedad, ruido, espectacularidad, decoración gratuita, complejidad, fatiga.

Esto viene desarrollado con el detalle de "10 principios de interacción" en `GeoTaxi Interaction Principles v1.0.md` (la operativa manda, un vistazo debe bastar, una pantalla una misión, acción principal evidente, pensar menos/trabajar más, la interfaz sigue al estado del taxista, contenido sobre decoración, todo tiene un lugar, consistencia = velocidad, transmitir tranquilidad). No se repiten aquí — ese documento es la fuente.

**Distinción importante:** `docs/00-product-construction-principles.md` cubre una filosofía *distinta y complementaria* — no de diseño visual, sino de cómo se construye el producto (el dominio/arquitectura es la fuente de verdad, no el código prototipo; solo los datos históricos de viajes/jornadas deben sobrevivir cualquier refactor; la UI puede rediseñarse por completo sin miedo). Si buscas principios de ingeniería, es ese documento, no este.

---

## 2. Identidad — cómo se reconoce GeoTaxi sin logo

La identidad no vive en un elemento decorativo repetido — vive en la **repetición exacta** de muy pocas decisiones: el mismo verde, el mismo radio de tarjeta, el mismo ritmo de espaciado, y una única firma gráfica (la barra de progreso de Inicio). Ver `design.md` §6 para el detalle. `docs/domain/03-visual-domain.md` añade la capa de identidad *de dominio*: cada plataforma/método de pago tiene un color y un icono fijos, para siempre, en toda la app — nunca se reutilizan para otro concepto.

---

## 3. Mapa completo de documentos

### 3.1 Fundamentos (el "qué")

| Documento | Cubre |
|---|---|
| `GeoTaxi Interaction Principles v1.0.md` | Los 10 principios de interacción — la filosofía UX. |
| `docs/00-product-construction-principles.md` | Filosofía de construcción/ingeniería (no visual). |
| `docs/domain/03-visual-domain.md` | Identidad visual de conceptos de dominio: color de plataforma, iconos de tipo de servicio y método de pago. Vive como dominio, no como estilos. |
| `GeoTaxi UX Architecture v1.0.md` | Arquitectura de experiencia general. |
| `GeoTaxi Operational Loop v1.0.md` | El ciclo operativo del conductor (abrir jornada → servicios → cerrar jornada) y cómo la UI lo refleja. |

### 3.2 Sistema visual (el "con qué", tokens)

| Documento | Cubre |
|---|---|
| `design.md` | **Fuente única de tokens**: color (claro y oscuro), tipografía, espaciado, radios, sombras, elevación, reglas de componentes base (CTA verde/neutro, indicadores de estado). Espejo exacto de `src/presentation/theme/tokens.ts`. |
| `GeoTaxi Iconography v1.0.md` | Sistema de iconos de interfaz genérica (no de dominio): MaterialIcons, reglas de color y tamaño. |

### 3.3 Estructura (el "dónde va cada cosa")

| Documento | Cubre |
|---|---|
| `GeoTaxi Layout System v1.0.md` | Los dos arquetipos de pantalla (operativa vs. registro/consulta) y cuándo usar cada uno. |
| `Home V2 Architecture v1.0.md` | Anatomía detallada de la pantalla Inicio (arquetipo operativo), congelada como baseline. |
| `Operational Lists Standard v1.0.md` | Patrón de fila de lista operativa en profundidad. |
| `GeoTaxi UI Guidelines v1.0.md` | Guía normativa general de interfaz — aprobada, más antigua que este documento; sigue vigente salvo por la corrección de nomenclatura hecha en §5. |
| `GeoTaxi Component Catalog v1.0.md` | Catálogo de todos los componentes visuales ya implementados: tarjetas, botones, pills, chips, inputs, filas, modales, la barra de progreso-firma, tab bar, calendario, estado vacío. |

### 3.4 Comportamiento (el "cómo reacciona")

| Documento | Cubre |
|---|---|
| `GeoTaxi States and Feedback v1.0.md` | Estados de componente (default/pressed/disabled/selected/loading/error), objetivo táctil mínimo, cómo se confirman acciones, cuándo usar error inline vs. `Alert`, confirmaciones destructivas. |
| `GeoTaxi Motion and Microinteractions v1.0.md` | Qué anima y qué no, duraciones, curvas de aceleración, accesibilidad de movimiento. |

### 3.5 Marca

| Documento | Cubre |
|---|---|
| `GeoTaxi Branding v1.0.md` | Nombre oficial (resuelve la contradicción histórica GeoTaxi/TaxiGeo), posicionamiento, voz y tono, identidad tipográfica. |
| `GeoTaxi Glyph System v1.0.md` | **Fuente única del símbolo**: concepto, construcción geométrica exacta (ángulo, radios, proporciones, centro óptico), color, zona de seguridad, versiones oficiales, aplicaciones permitidas/prohibidas (explícitamente *no* en botones/motion/confirmaciones — solo icono, splash y marca externa), formatos de exportación. Para producir el icono/splash con una IA de imagen, este es el brief — sin generar la imagen aquí. |

### 3.6 Investigación (evidencia, no reglas nuevas)

`docs/design/research/` (`README.md` + Research 02 a 06) — hallazgos de investigación ya aprobados que alimentaron las guías normativas anteriores. Se citan desde los documentos de arriba cuando aportan el "por qué" de una regla; no se repiten aquí.

### 3.7 Roadmap

`GeoTaxi Design Language Roadmap v1.0.md` — qué falta para que cada documento de este índice esté 100% reflejado en código, con prioridad y orden. **No confundir con `docs/roadmap.md`**, que es un documento de fases de producto anterior y no relacionado con el sistema de diseño (geolocalización, motor de zonas) — se mantiene por su propio historial pero no forma parte de este conjunto.

---

## 4. Gobernanza del conjunto

- **Versión:** todos los documentos de este conjunto nacen en `v1.0`. Un cambio de regla sube la versión del documento afectado (`v1.1`, `v2.0` para cambios que rompen compatibilidad con lo ya construido) — nunca se edita un documento aprobado in-place sin dejar rastro de versión.
- **Fuente de verdad para valores exactos:** siempre `design.md` / `tokens.ts`. Si cualquier otro documento de este índice menciona un valor (un hex, un tamaño) que no coincide con `design.md`, `design.md` gana y el otro documento está desactualizado.
- **Un LLM u otra persona que solo tenga este archivo** puede reconstruir el criterio completo de diseño de GeoTaxi siguiendo los enlaces de §3 en orden — no necesita el historial de esta conversación ni contexto adicional.

---

## 5. Correcciones aplicadas al crear este documento

Durante la creación de este índice se encontraron y corrigieron dos inconsistencias en la documentación existente:

1. **Nomenclatura "Más" obsoleta:** `Home V2 Architecture v1.0.md` y `GeoTaxi UI Guidelines v1.0.md` referenciaban una pantalla "Más" que en código ya se renombró a "Ajustes" (para que el título coincida con la etiqueta de su pestaña). Corregido con una nota en ambos documentos.
2. **Nombre del producto dividido (GeoTaxi vs. TaxiGeo):** resuelto en `GeoTaxi Branding v1.0.md` §1 — `GeoTaxi` es el nombre único y correcto; `TaxiGeo` queda documentado como término heredado en documentación de arquitectura/dominio anterior, sin corregir archivo por archivo por estar fuera del alcance visual de este trabajo.

---

*Fin del índice. Para empezar a trabajar en una pantalla nueva: `GeoTaxi Layout System v1.0.md` (qué arquetipo), `design.md` (qué tokens), `GeoTaxi Component Catalog v1.0.md` (qué componente reutilizar) — en ese orden.*
