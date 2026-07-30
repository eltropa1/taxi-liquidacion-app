# GeoTaxi · Design Language Roadmap v1.0

> Estado: 🟢 Aprobado. Qué falta para que el **GeoTaxi Design Language** (ver `GeoTaxi Design Language v1.0.md`) esté no solo documentado sino 100% reflejado en código. No es el roadmap de producto — `docs/roadmap.md` es un documento distinto, de una fase de producto anterior (geolocalización, motor de zonas), no relacionado con este conjunto.
>
> Forma parte del conjunto **GeoTaxi Design Language** — ver `GeoTaxi Design Language v1.0.md` para el índice completo.

---

## Cómo leer este roadmap

Cada ítem indica: qué falta, por qué está en esa prioridad, y qué documento define la regla que hay que cumplir. **P0** = bloquea decir "la parte visible está terminada". **P1** = brecha real pero no bloqueante. **P2** = mejora identificada, sin urgencia, algunas explícitamente pospuestas por decisión de producto.

---

## P0 — Bloquea cerrar el sistema

### 1. Icono de app, adaptive icon y splash
- **Qué falta:** generar los 4 archivos según la especificación exacta de `GeoTaxi Glyph System v1.0.md` §3-4 (geometría, color `#1C7C43`, proporciones, formatos) — el usuario los produce externamente (OpenAI u otra herramienta), no este asistente.
- **Después de generarlos:** conectar en `app.json` (`expo.icon`, `expo.splash`, `expo.android.adaptiveIcon`) — bloque de configuración ya redactado en `GeoTaxi Glyph System v1.0.md` §4.8, listo para pegar.
- **Verificación:** solo visible en un build nativo (EAS build o `expo prebuild`), no en la sesión de Metro/Expo Go usada hasta ahora.
- **Por qué P0:** sin esto, la app sigue mostrando el placeholder de Expo en el launcher del teléfono — es la pieza de identidad más visible que queda sin resolver.

---

## P1 — Brechas reales, no bloqueantes

### 2. Animación del relleno de la barra de progreso — ✅ Hecho
`ProgressBar` (`app/(tabs)/index.tsx`) ahora usa `Animated.timing` (220ms, `Easing.inOut(Easing.ease)` — `motion-base` de `GeoTaxi Motion and Microinteractions v1.0.md` §2-3) para transicionar el ancho del relleno en vez de saltar directamente al nuevo valor. Verificado en emulador sin regresión visual.

### 3. Verificación formal de contraste — ✅ Hecho
Se calcularon los ratios WCAG reales (fórmula de luminancia relativa, no estimación visual) de todos los pares texto/fondo del sistema, claro y oscuro. Resultado: **3 pares fallaban AA (4.5:1 texto normal)**, todos relacionados con `color-warning`/`color-danger` sobre sus fondos "subtle":

| Par | Ratio original | Corregido a |
|---|---|---|
| `color-primary-dark` sobre `color-primary-subtle-dark` | 4.36 | `primarySubtle-dark` → `#14291B` (4.73) |
| `color-danger` sobre `color-danger-subtle` (claro) | 4.10 | `dangerSubtle` → `#FFFAFA` (4.67) |
| `color-danger-dark` sobre `color-danger-subtle-dark` | 4.32 | `dangerSubtle-dark` → `#331311` (4.54) |
| `color-warning` (`#B8860B`) sobre cualquier fondo pálido realista | 2.0–3.2 (fallaba incluso sobre blanco puro) | `color-warning` → `#7A4D00` (el valor que ya usaba, sin formalizar, la pill "Corrigiendo" en `RegisteredServiceDetailLayout.tsx`) + nuevo token `color-warning-subtle` (`#FFF8E1` claro / `#332908` oscuro) |

De paso se encontró y corrigió un hueco real: el chip "Pendiente" (`TripHistoryRow.tsx`) usaba `color-border` como fondo — un color sin relación con el texto ámbar que llevaba encima, nunca se había verificado esa combinación. Ahora usa `color-warning-subtle`. Todos los valores finales están en `design.md` §1 y §1bis, y en `tokens.ts`.

**Verificación pendiente y de menor riesgo:** legibilidad bajo luz solar directa real (no simulable con una fórmula de contraste de pantalla) — solo se puede confirmar probando el teléfono físico al sol. No bloquea nada, se deja como nota de campo.

### 4. Reducción de movimiento (`prefers-reduced-motion`) — ✅ Hecho
Implementado junto con el punto 2: `ProgressBar` consulta `AccessibilityInfo.isReduceMotionEnabled()` al montar y se suscribe a `reduceMotionChanged`; si está activo, la transición pasa a duración `0` (cambio instantáneo) en vez de omitirse el cambio de valor.

---

## P2 — Backlog, sin urgencia

### 5. Arquitectura de Historial/Resumen (divulgación progresiva)
- **Qué es:** reestructurar Historial/Resumen para no depender de un scroll largo con 5-6 secciones apiladas.
- **Por qué está en P2 y no más arriba:** decisión de producto ya tomada explícitamente en esta sesión — esas pantallas se consultan parado o al cerrar la semana, no en movimiento ni con prisa, así que la prioridad ahí es completitud del dato, no velocidad de escaneo. No es una deuda, es una decisión correcta para su contexto de uso. Si se retoma, es un cambio de arquitectura de navegación, no de este sistema visual — se planifica aparte.

### 6. Limpieza de directorios vacíos — ✅ Hecho
`src/components/buttons/` y `src/components/cards/` (vacíos, sin `.tsx`, restos de una reorganización anterior) eliminados.

### 7. Lockup de marca (símbolo + texto "GeoTaxi")
- **Qué es:** una combinación formal del símbolo y el nombre, para usos donde el icono solo no basta (ej. material fuera de la app).
- **Por qué P2:** `GeoTaxi Branding v1.0.md` §6 lo deja explícitamente sin definir hasta que haya un caso de uso real — no se especula sobre una necesidad que no existe todavía.

---

## Ya cerrado (para que no se reabra por error)

Todo lo demás listado originalmente como hueco — filosofía de producto, iconografía de interfaz, layout system, catálogo de componentes, estados, feedback visual, elevación, motion (como reglas, aunque el punto 2 de implementación siga pendiente), branding/naming — **ya tiene documento aprobado** dentro de este conjunto. No se vuelve a auditar desde cero; si aparece una duda, se consulta `GeoTaxi Design Language v1.0.md` primero.

---

*Único punto abierto: el 1 (P0), a la espera de que se generen los assets de icono/splash externamente. Todo lo demás de este roadmap — incluida la verificación de contraste, que encontró y corrigió 4 valores de color reales que fallaban WCAG AA — está cerrado.*
