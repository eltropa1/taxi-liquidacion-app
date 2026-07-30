# GeoTaxi · Component Catalog v1.0

> Estado: 🟢 Aprobado. Catálogo de los componentes visuales ya implementados en la app, extraído del código real (no aspiracional). Cada entrada indica sus tokens, variantes y dónde vive en el código. Complementa — no repite — `design.md` (que define los tokens) y `GeoTaxi States and Feedback v1.0.md` (que define los estados de interacción).
>
> Forma parte del conjunto **GeoTaxi Design Language** — ver `GeoTaxi Design Language v1.0.md` para el índice completo.

---

## 1. Tarjeta (`card`)

Contenedor base de cualquier bloque de contenido agrupado.

- **Tokens:** `background: color-surface`, `borderRadius: radius-card (16)`, `borderWidth: 1`, `borderColor: color-border`, `...shadowCard`.
- **Padding interno:** 14–18px según densidad de contenido.
- **Variantes:** ninguna — es deliberadamente un único componente sin skins. Si un bloque necesita verse "más importante", se resuelve con jerarquía tipográfica interna, nunca con una tarjeta distinta.
- **Dónde:** `currentCard`/`infoCard`/`historyCard` en `goals.tsx`, `breakdownRow`/`workdayRow` en `history.tsx`, `section` en `settings.tsx` y `RegisteredServiceDetailLayout.tsx`.

---

## 2. Botones

Tres familias, nunca una cuarta sin pasar antes por `design.md` §5 (criterio verde/neutro):

| Familia | Fondo | Texto | Cuándo |
|---|---|---|---|
| **Primario (verde)** | `color-primary` | `color-surface` | La acción avanza el trabajo/ingresos del conductor. Máximo uno visible por pantalla. |
| **Neutro/administrativo** | `color-text-primary` (negro cálido) | `color-surface` | Acción de cierre o administrativa que es la principal de su pantalla pero no avanza ingresos (Cerrar jornada, Guardar configuración, Guardar correcciones). |
| **Secundario** | `color-bg` o `color-surface` con borde `color-border` | `color-text-primary` o `color-text-secondary` | Cualquier acción que no es la principal de la pantalla (Cancelar, Completar después, Exportar). |
| **Destructivo** | Transparente o `color-danger-subtle` | `color-danger` (también el borde) | Únicamente para eliminar/borrar. Nunca para "Cancelar". |

- **Tokens comunes:** `borderRadius: radius-button (14)`, `minHeight: 44–52px` (nunca por debajo del mínimo táctil de 44px).
- **Dónde:** `primaryAction`/`secondaryAction` en las 5 pantallas; `deleteButton`/`dangerButton` en `index.tsx` y `RegisteredServiceDetailLayout.tsx`.

---

## 3. Indicador de estado (pill/badge)

Pastilla de texto corto, `radius: 999` (totalmente redondeada), `text-caption` en mayúsculas o peso alto.

| Variante | Fondo | Texto | Significa |
|---|---|---|---|
| Positivo | `color-primary-subtle` | `color-primary` | "ACTIVA", "Actual", servicio "Registrado". |
| Neutro | `color-border` | `color-text-secondary` | "CERRADA" — un estado que no es ni positivo ni un error. |
| Atención | Amarillo suave (`warningSurface`, `#fff8e1` en `RegisteredServiceDetailLayout.tsx`) | Ámbar oscuro | "Corrigiendo" — informa de un modo activo, no de un error. |

- **Regla:** nunca decorativo. Si una pantalla quiere una pastilla puramente estética sin dato detrás, no se añade (`design.md` §5).
- **Dónde:** `currentBadge`/`historyBadge` en `goals.tsx`, `statusOpen`/`statusClosed` en `history.tsx`/`summary.tsx`, `statusPill`/`correctionPill` en `RegisteredServiceDetailLayout.tsx`.

---

## 4. Chip seleccionable

Botón pequeño que representa una opción dentro de un grupo (día de la semana, plataforma, método de pago).

- **Estado inactivo:** `color-surface` con borde `color-border`, texto `color-text-secondary`.
- **Estado activo:** fondo `color-primary-subtle`, borde `color-primary`, texto `color-primary` — exactamente el mismo lenguaje visual que el indicador de estado positivo (§3), porque conceptualmente *es* un estado ("este día/plataforma está seleccionado ahora mismo").
- **Tamaño mínimo:** 44×44px.
- **Dónde:** `weekdayChip` en `settings.tsx`, `platformTile`/`paymentTile` en `CompleteServiceBottomSheet.tsx`, `optionRow` en `HistoryScalePickerModal.tsx`, `rangeChip` en `HistoryCustomRangeModal.tsx`.

---

## 5. Campo de texto (`TextInput`)

- **Tokens:** `borderWidth: 1`, `borderColor: color-border`, `borderRadius: radius-button`, `backgroundColor: color-surface`, `color: color-text-primary`, `placeholderTextColor: color-text-secondary`.
- **Altura mínima:** 44px.
- **Dónde:** `input` en todas las pantallas con formularios, `DetailTextInput` en `RegisteredServiceDetailLayout.tsx`.

---

## 6. Fila de lista

El patrón más repetido de la app. Dos variantes según densidad de datos:

- **Fila simple** (`EconomicDrilldownRow`): sin fondo propio, divisor inferior hairline `color-border`, título + subtítulo a la izquierda, cifra + contador + chevron a la derecha.
- **Fila-tarjeta** (`breakdownRow`, `workdayRow`, `TripHistoryRow`): con fondo `color-surface`, borde `color-border`, `radius-card` — usada cuando la fila necesita distinguirse visualmente del fondo de pantalla (listas dentro de una pantalla ya densa).
- **Regla de identidad** (heredada de `03-visual-domain.md`): el color de la fila identifica siempre la plataforma, nunca el estado de la fila — el estado (pendiente/registrado) se comunica con la pastilla de §3, no recoloreando la fila entera.
- **Dónde:** `src/components/economic/EconomicDrilldownRow.tsx`, `src/components/trip-history/TripHistoryRow.tsx`, filas de `history.tsx`.

---

## 7. Modal / Bottom sheet

- **Overlay:** `rgba(0,0,0,0.42–0.45)`.
- **Hoja:** `color-surface`, esquinas superiores `radius-card`, "handle" (barra gris pequeña, `color-border`, `radius: 999`) centrado arriba para sugerir que se puede arrastrar/cerrar.
- **Sombra:** sutil, dirección hacia arriba (`shadowOffset: { height: -1 }`) porque la hoja "flota" sobre el contenido, no debajo.
- **Dónde:** `CompleteServiceBottomSheet.tsx`, `SummaryDrilldownSheet.tsx`, `HistoryScalePickerModal.tsx`, `HistoryCustomRangeModal.tsx`, `NeighborhoodSelector.tsx`.

---

## 8. Barra de progreso — *la firma*

Único componente con tratamiento visual "más cuidado que el mínimo funcional" (`design.md` §5). Pista redondeada (`height: 12`, `radius: 999`, fondo `color-border`) + relleno `color-primary` con ancho proporcional al porcentaje.

- **No se reutiliza esta forma para nada más.** Si otra pantalla necesita mostrar una proporción/avance, no reutiliza este componente literal sin antes verificar si eso lo convertiría en una segunda "firma" — que `design.md` prohíbe explícitamente.
- **Dónde:** `ProgressBar` en `index.tsx`.

---

## 9. Barra de navegación inferior (tab bar)

- **Tokens:** `backgroundColor: color-bg`, `borderTopColor: color-border`, activo `color-primary`, inactivo `color-text-secondary`.
- **5 pestañas fijas:** Inicio, Resumen, Historial, Metas, Ajustes — no se añaden pestañas nuevas sin revisar `GeoTaxi Layout System v1.0` (¿es arquetipo A o B?) y sin confirmar que caben cómodamente 5-6 iconos con etiqueta en el ancho de pantalla mínimo soportado.
- **Dónde:** `app/(tabs)/_layout.tsx`.

---

## 10. Selector de fecha / calendario

Grid de 7 columnas, celdas `~34-44px`, celda seleccionada con fondo `color-primary` sólido y texto `color-surface`. Excepción documentada a la exigencia de 44px táctiles (`design.md` §2, "excepción de chrome muy compacto") por restricción de ancho de rejilla.

- **Dónde:** modal de calendario en `index.tsx`/`summary.tsx`, `HistoryCustomRangeModal.tsx`.

---

## 11. Estado vacío (`empty state`)

Texto centrado, título (`text-body`, semibold) + descripción (`text-caption`, `color-text-secondary`). Sin ilustración, sin icono grande — mantiene la disciplina de "sin decoración" incluso cuando no hay contenido que mostrar.

- **Dónde:** `TripHistoryEmptyState.tsx`, `emptyState` en `history.tsx`/`goals.tsx`.

---

*Para cómo se comporta cada uno de estos componentes al presionarlo, deshabilitarlo o mostrarlo cargando, ver `GeoTaxi States and Feedback v1.0.md`. Para cómo se anima su aparición/desaparición, ver `GeoTaxi Motion and Microinteractions v1.0.md`.*
