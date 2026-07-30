# GeoTaxi · States and Feedback v1.0

> Estado: 🟢 Aprobado. Define cómo se ve cada componente en cada estado de interacción, y cómo la app le confirma al conductor que una acción ha ocurrido. Ninguno de los dos temas tenía documento antes de este.
>
> Forma parte del conjunto **GeoTaxi Design Language** — ver `GeoTaxi Design Language v1.0.md` para el índice completo.

---

## 1. Estados de componente

Todo elemento pulsable tiene, como máximo, estos estados. No se inventan estados adicionales (hover no aplica — es una app táctil, no de escritorio).

| Estado | Tratamiento visual | Regla |
|---|---|---|
| **Default** | Los tokens definidos en `GeoTaxi Component Catalog v1.0`. | — |
| **Pressed** | `opacity: 0.7–0.92` sobre el estado default (el valor exacto varía ligeramente por componente en el código actual, entre 0.7 y 0.92; no se documenta un único número porque no aporta nada fijarlo más allá de "notablemente más tenue, nunca casi invisible"). Opcionalmente `transform: scale(0.99)` en los CTA principales para dar sensación de "pulsación física" (ya usado en `actionCard` de Inicio y `primaryAction` de Metas). | Todo componente pulsable debe tener un estado pressed distinguible. Un botón que no cambia nada al tocarlo no confirma que el toque se ha registrado — falla el principio de `Research 05` ("respuesta visual inmediata"). |
| **Disabled** | `opacity: 0.45–0.6` sobre el estado default, y se elimina cualquier `onPress` funcional (no solo visualmente atenuado — debe ser realmente no interactivo). | Nunca se oculta un botón que podría estar disabled — se muestra atenuado para que el conductor entienda que la acción existe pero no está disponible ahora mismo (ej. "Periodo siguiente" cuando ya está en el periodo actual). |
| **Selected / Active** | Ver §3 del Component Catalog (chip seleccionable) — fondo `color-primary-subtle`, borde y texto `color-primary`. | Es el mismo lenguaje visual que un indicador de estado positivo, nunca un color distinto. |
| **Loading** | Ver §4. | — |
| **Error / inválido** | Ver §5. | — |

### 1.1 Objetivo táctil mínimo

Todo elemento con estado pulsable mide **mínimo 44×44px** de área táctil, aunque su representación visual sea más pequeña (se usa `hitSlop` para compensar cuando el elemento visual es menor por restricción de espacio). Regla ya aplicada en toda la app tras la auditoría de esta sesión. Única excepción documentada: la rejilla de selección de día del calendario (`GeoTaxi Component Catalog v1.0` §10), por restricción real de ancho de 7 columnas.

---

## 2. Feedback de acciones completadas

GeoTaxi **no usa toasts ni snackbars**. La confirmación de que una acción ha funcionado es, por diseño, el propio cambio de estado visible en pantalla — principio ya establecido en `Research 05 - Actions & Interaction` ("el cambio de estado confirma la operación") y en `GeoTaxi Operational Loop v1.0`. Ejemplos ya implementados:

- Guardar una corrección → la pantalla vuelve al modo lectura con los datos nuevos visibles. No hay un mensaje "Guardado correctamente" superpuesto.
- Cerrar una jornada → el pill de estado cambia de "ABIERTA" a "CERRADA".
- Añadir una nota → el bloque de nota deja de mostrar "Sin notas añadidas" y muestra el texto guardado.

**No se introduce un sistema de toasts en el futuro sin revisar antes si el cambio de estado ya es suficiente confirmación** — añadir un toast encima de un cambio de estado ya visible es ruido redundante, exactamente lo que la misión de este proyecto pide evitar.

---

## 3. Errores — dos niveles, dos tratamientos

| Nivel | Cuándo | Tratamiento |
|---|---|---|
| **Error de campo (inline)** | Validación de un input concreto (importe inválido, hora mal formada). | Texto `color-danger`, `text-caption`, debajo del campo afectado. Nunca bloquea la pantalla. Patrón `Field` con prop `error` en `RegisteredServiceDetailLayout.tsx`. |
| **Error de operación** | Falla una acción completa (no se pudo guardar, no se pudo exportar, no se pudo cargar). | `Alert.alert` nativo de React Native, con título corto describiendo qué falló y cuerpo explicando qué hacer o qué pasa con los datos introducidos (ver tono en `GeoTaxi Branding v1.0` §3 — nunca un código de error crudo). |

**Regla de decisión:** si el error es sobre *un dato que el conductor acaba de escribir*, es inline. Si el error es sobre *una operación que el sistema intentó hacer* (guardar, exportar, eliminar, cargar), es `Alert`. No se usa `Alert` para errores de validación de campo — interrumpe innecesariamente un formulario que el conductor sigue rellenando.

### 3.1 Confirmaciones destructivas

Toda acción irreversible (eliminar un registro, eliminar un adjunto, descartar cambios sin guardar) pasa por un `Alert.alert` de confirmación con dos opciones, la destructiva marcada con `style: "destructive"` (la usa React Native para pintarla en rojo del sistema en iOS; en Android no tiene efecto visual pero se mantiene por semántica y portabilidad). Nunca se ejecuta una acción destructiva directamente al primer toque.

---

## 4. Estado de carga

- **Carga de pantalla completa** (primer render, datos aún no disponibles): `ActivityIndicator` centrado, sin texto adicional salvo que la espera pueda percibirse larga (ej. `"Cargando detalle del servicio..."` en `trip/edit.tsx`).
- **Carga de una acción puntual** (guardar, importar): el propio botón cambia su texto al gerundio ("Guardando...", "Importando...", "Eliminando...") y pasa a estado disabled. No se superpone un spinner encima del botón — cambiar el texto ya comunica que está en curso, y evita un segundo elemento visual moviéndose en pantalla.
- **Nunca** se bloquea toda la pantalla con un overlay de carga para una acción puntual — solo el control implicado queda disabled.

---

## 5. Validación en tiempo real vs. al guardar

Por defecto, GeoTaxi valida **al intentar guardar**, no mientras el conductor escribe. Escribir un importe o una hora y ver un error aparecer letra a letra es más disruptivo que útil en un contexto donde el conductor puede estar completando el dato con el coche parado y prisa. Excepción: si un campo tiene un formato tan estricto que un error solo puede confirmarse al terminar de escribir (ninguno actualmente en la app), se documenta aquí explícitamente antes de implementarse.

---

*Para cómo se anima la transición entre estos estados (aparición/desaparición de un error, cambio de un botón a "Guardando..."), ver `GeoTaxi Motion and Microinteractions v1.0.md`.*
