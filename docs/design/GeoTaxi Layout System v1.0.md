# GeoTaxi · Layout System v1.0

> Estado: 🟢 Aprobado. Generaliza a *todas* las pantallas el patrón de anatomía que `Home V2 Architecture v1.0.md` definió solo para Inicio, y formaliza las decisiones ya adoptadas en `Research 02 - Layout.md`. No repite esos documentos — los referencia y completa el hueco que dejaban (qué hacer en pantallas que no son Home).
>
> Forma parte del conjunto **GeoTaxi Design Language** — ver `GeoTaxi Design Language v1.0.md` para el índice completo.

---

## 1. Principio heredado (no se repite, se aplica)

De `Research 02 - Layout.md` (ya aprobado): las pantallas se construyen por zonas funcionales, la zona superior orienta, la decisión/acción principal ocupa el centro visual, la información secundaria va después, la acción principal nunca requiere scroll para alcanzarse, y la primera pantalla que ve el conductor debe bastarse a sí misma sin necesitar explorar el resto de la app.

Este documento traduce ese principio en **dos arquetipos concretos**, porque auditando las 5 pantallas ya construidas se ve que no todas siguen la misma forma — y esa diferencia es correcta, no accidental.

---

## 2. Arquetipo A — Pantalla operativa (Inicio)

Uso: la única pantalla que el conductor consulta constantemente **durante** el trabajo, no antes ni después. Definida en detalle en `Home V2 Architecture v1.0.md` (5 bloques: Barra de Contexto Operativo → Progreso de la Jornada → Acción Principal → Registro Operativo → Navegación inferior). Reglas clave que no se repiten aquí, solo se referencian:

- Sin kicker ni título de pantalla — el conductor ya sabe que está en Inicio, un título sería un elemento que hay que leer y descartar cada vez.
- La acción principal (`actionCard`, verde, "Nuevo servicio"/"Abrir jornada") está **fija fuera del área de scroll** — nunca se pierde bajando la lista de servicios. Esto es intencional y no debe romperse al añadir contenido nuevo a esta pantalla.
- Solo hay **un** arquetipo A en toda la app. No se introduce una segunda pantalla con esta anatomía sin revisar antes si de verdad necesita competir con Inicio por el mismo patrón.

---

## 3. Arquetipo B — Pantalla de registro/consulta (Historial, Resumen, Metas, Ajustes)

Uso: cualquier pantalla que el conductor consulta **parado, en casa, o al cerrar la jornada** — no mientras conduce o atiende un cliente. Es la razón de diseño explícita, confirmada en esta sesión, de por qué Historial/Resumen pueden permitirse más densidad de información que Inicio.

**Anatomía, de arriba abajo:**

1. **Kicker** (opcional): etiqueta corta en mayúsculas, `text-caption`, `color-text-secondary` — usado en Historial/Metas ("HISTORIAL", "METAS"), omitido en Ajustes porque su título ya es autoexplicativo de una palabra.
2. **Título de pantalla**: `text-title` (24px/700), `color-text-primary`. Es el elemento con más peso tipográfico de esta zona, pero — regla que se rompía y ya se corrigió en Metas — **nunca debe pesar visualmente más que la cifra económica principal de la tarjeta que sigue**. Si compiten, el título pierde.
3. **Bloque "hero"** (si la pantalla tiene una cifra dominante — caso de Historial/Resumen): fecha/rango + pill de estado, luego la cifra grande (`text-display`, único "número grande" de la pantalla), luego metadatos de una línea.
4. **Contenido en secciones o tarjetas**: cada bloque de información autocontenida es una `card` (`color-surface`, `radius-card`, `shadow-card`) o una `section` separada por un divisor sutil (`color-border`, hairline) — nunca ambas cosas para el mismo bloque (regla ya en `design.md` §5, "listas sin decoración extra").
5. **Acción(es)**: el patrón CTA verde/neutro de `design.md` §5, situado al final del contenido relevante, no flotante.

**Regla de densidad:** a diferencia de Inicio, un arquetipo B puede requerir scroll para llegar a la acción — es aceptable porque el conductor no está tomando esta decisión con prisa. Esto es lo que distingue a los dos arquetipos, no un descuido.

---

## 4. Márgenes y contenedor

- Margen horizontal de pantalla: `20px` en arquetipo B (Historial, Resumen, Metas, Ajustes), `16px` en arquetipo A (Inicio) — Inicio usa un margen más ajustado porque necesita maximizar el espacio para la lista de servicios, que es información operativa densa por naturaleza.
- El contenido nunca toca el borde físico de la pantalla ni el notch/barra de estado — siempre dentro de `SafeAreaView` con `edges={["top", "bottom"]}`, patrón ya universal en las 5 pantallas.

---

## 5. Cuándo crear un tercer arquetipo

No se crea uno nuevo por defecto. Antes de diseñar una pantalla nueva, se responde: *¿el conductor la consulta trabajando (arquetipo A) o parado/al cerrar (arquetipo B)?* Si la respuesta no encaja limpiamente en ninguno de los dos, se documenta aquí el motivo antes de construirla — no se improvisa una tercera anatomía sobre la marcha.

---

*Para las reglas de espaciado interno (padding, gaps) ver `design.md` §3. Para el catálogo de los componentes que rellenan cada zona, ver `GeoTaxi Component Catalog v1.0.md`.*
