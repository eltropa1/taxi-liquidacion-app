# GeoTaxi · Sistema de Diseño (Design Tokens)

> Este documento traduce la filosofía de identidad visual de GeoTaxi en reglas concretas y reutilizables. Es el documento que se le pasa a Claude Code como referencia antes de tocar cualquier pantalla.

---

## 1. Color

El color no decora. El color comunica estado y jerarquía.

| Token | Uso | Valor sugerido |
|---|---|---|
| `color-bg` | Fondo general de la app | `#F7F3EC` (crema cálido, no blanco puro) |
| `color-surface` | Fondo de tarjetas | `#FFFFFF` |
| `color-text-primary` | Texto principal, cifras | `#1A1A1A` |
| `color-text-secondary` | Etiquetas, texto de apoyo | `#6B6B6B` |
| `color-primary` | Verde operativo — CTA, progreso, estado positivo | `#1C7C43` (mantener el verde ya usado; no aclarar ni saturar más) |
| `color-primary-subtle` | Fondos suaves de estado positivo (ej. "ACTIVA") | `#E3F3E9` |
| `color-border` | Separadores, contornos de tarjeta | `#E7E1D7` |
| `color-warning` | Uso excepcional — solo alertas reales | `#7A4D00` (ámbar oscuro, no rojo salvo error crítico; ajustado desde `#B8860B` tras verificación de contraste — el tono más claro original no llegaba a 4.5:1 ni siquiera sobre un fondo casi blanco) |
| `color-warning-subtle` | Fondo suave de pills/banners de alerta (ej. "Pendiente", "Corrigiendo") | `#FFF8E1` |
| `color-danger` | Eliminar, error crítico | `#DC2626` |
| `color-danger-subtle` | Fondo de banners/pills de error | `#FFFAFA` (ajustado desde `#FCE8E8` tras verificación de contraste — el valor original daba 4.10:1, por debajo del mínimo AA de 4.5:1) |

**Regla:** si una pantalla no tiene una acción principal, un estado positivo o progreso que mostrar, no debería tener verde. El verde que no comunica nada, se retira.

---

## 1bis. Modo nocturno

Un turno de taxi cubre noche. Una pantalla clara y brillante en un coche a oscuras es fatiga real y un riesgo de deslumbramiento al volver a mirar la calle. El modo nocturno no es una preferencia estética: es una condición de trabajo.

**Disparador:** automático por horario (21:00–07:00 por defecto), con anulación manual en Ajustes (Automático / Claro / Oscuro) para turnos que no encajan en ese rango.

**Regla de construcción:** el modo oscuro no es una paleta nueva — es la misma paleta invertida en luminosidad, manteniendo la misma calidez y la misma función de cada token. Igual que `color-bg` nunca es blanco puro, `color-bg-dark` nunca es negro puro (evita el "halo" de contraste extremo tipo OLED).

| Token | Uso | Valor |
|---|---|---|
| `color-bg-dark` | Fondo general | `#14120F` |
| `color-surface-dark` | Fondo de tarjetas | `#1E1B17` |
| `color-text-primary-dark` | Texto principal, cifras | `#F2EEE7` |
| `color-text-secondary-dark` | Etiquetas, texto de apoyo | `#A79E90` |
| `color-primary-dark` | Verde operativo sobre fondo oscuro | `#35A166` (el mismo verde, aclarado un único paso fijo para cumplir contraste — no es una variación libre, es el mismo cálculo en todas las pantallas) |
| `color-primary-subtle-dark` | Fondos suaves de estado positivo | `#14291B` (ajustado desde `#17301F` tras verificación de contraste — ver `GeoTaxi Design Language Roadmap v1.0.md`, el valor original daba 4.36:1 con el texto `color-primary-dark`, por debajo del mínimo AA de 4.5:1 en texto normal) |
| `color-border-dark` | Separadores, contornos | `#322D26` |
| `color-warning-dark` | Alertas reales | `#D4A017` |
| `color-warning-subtle-dark` | Fondo suave de pills/banners de alerta | `#332908` |
| `color-danger-dark` | Eliminar, error crítico | `#E4534A` |
| `color-danger-subtle-dark` | Fondo de banners/pills de error | `#331311` (ajustado desde `#3A1614` — el original daba 4.32:1, por debajo del mínimo AA de 4.5:1) |

**Regla:** ningún otro valor oscuro se improvisa por pantalla. Si un color no está en esta tabla, no existe en modo oscuro — se deriva de aquí o se pide que se añada aquí primero.

---

## 2. Tipografía

Fuente del sistema (SF Pro en iOS, Roboto en Android) — no fuente de marca. La identidad no vive en la tipografía, vive en cómo se usa.

| Token | Uso | Peso / Tamaño |
|---|---|---|
| `text-display` | Cifras económicas grandes (recaudación, importes) | Semibold, 28–32px, tabular figures |
| `text-title` | Títulos de pantalla | Bold, 22–24px |
| `text-heading` | Encabezados de sección/tarjeta | Semibold, 16–17px |
| `text-body` | Texto normal | Regular, 14–15px |
| `text-caption` | Etiquetas, metadatos, fechas | Regular, 12–13px, `color-text-secondary` |

**Regla:** solo un tamaño "grande" por pantalla. Si todo es grande, nada lo es.

**Excepción — chrome muy compacto:** `text-caption` (12–13px) es el mínimo para texto que alguien *lee*. Badges muy compactos (ej. "ACTIVA"), iniciales de día en un calendario, o etiquetas de la barra de tabs pueden bajar de ese mínimo porque funcionan por posición y color, no por lectura — son más icono que texto. Esta excepción no aplica a nada que el conductor necesite leer con atención (importes, fechas, nombres de sección).

---

## 3. Espaciado

Escala de 4pt. Nada fuera de esta escala.

`4 · 8 · 12 · 16 · 24 · 32 · 48`

- Padding interno de tarjeta: `16`
- Separación entre tarjetas: `16` o `24`
- Márgenes de pantalla: `16` o `20`

**Regla:** el espacio en blanco no es "espacio vacío que rellenar". Es la herramienta principal de jerarquía.

---

## 4. Radios y sombras

| Token | Valor |
|---|---|
| `radius-card` | `16px` (suave, no exagerado) |
| `radius-button` | `12–14px` |
| `shadow-card` | Muy sutil — `0 1px 3px rgba(0,0,0,0.06)`, nunca sombras marcadas o "flotantes" |

**Regla:** la sombra indica que un elemento está por encima de otro, no que es "premium". Si no hay ambigüedad de capas, no hace falta sombra.

### 4.1 Escala de elevación

GeoTaxi tiene **dos** niveles de elevación, no una escala larga tipo Material Design de 5+ pasos — con dos alcanza para resolver toda la ambigüedad de capas que existe en la app hoy, y una escala más larga invitaría a usar sombra como decoración (lo que la regla de arriba prohíbe explícitamente).

| Nivel | Cuándo | Sombra |
|---|---|---|
| **0 — En reposo** | Filas de lista, chips, filas dentro de una tarjeta ya elevada. No compite por capa con nada — vive en el mismo plano que el fondo. | Ninguna. Se separa con `color-border` (1px) o un divisor hairline, nunca con sombra. |
| **1 — Tarjeta** | Cualquier `card` (`GeoTaxi Component Catalog v1.0` §1), el CTA principal de Inicio. | `shadow-card` — `shadowOffset: { width: 0, height: 1 }`. |
| **2 — Superpuesto** | Modal, bottom sheet — el único contenido que de verdad flota *sobre* toda la pantalla, no solo sobre el fondo. | Los mismos valores de `shadow-card` (color, opacidad, radio) pero con `shadowOffset: { width: 0, height: -1 }` — la sombra apunta hacia arriba porque la hoja se eleva desde abajo, no desde el plano de la pantalla. No se aumenta la opacidad ni el radio respecto al nivel 1: la diferencia entre "tarjeta" y "superpuesto" es la dirección de la sombra y el hecho de que cubre el resto de la interfaz, no la intensidad visual. |

En modo oscuro, el nivel 1 y 2 usan `shadowCardDark` (`shadowOpacity: 0.3` en vez de `0.06`) porque una sombra al 0.06 es imperceptible sobre un fondo ya oscuro — sigue siendo el mismo principio ("sutil, nunca premium"), ajustado para seguir siendo *visible* sobre el nuevo fondo.

---

## 5. Componentes — reglas de uso

- **Una acción principal por pantalla.** Un solo botón verde sólido ("Editar metas", "Nuevo servicio"). El resto son acciones secundarias (fondo neutro, texto oscuro).
- **Criterio verde vs. neutro para el CTA:** el botón verde se reserva para la acción que hace avanzar el trabajo o los ingresos del conductor (ej. "Nuevo servicio", "Editar metas"). Las acciones de cierre o administrativas (ej. "Cerrar jornada", "Guardar configuración") usan fondo neutro/oscuro, nunca verde — aunque sean la acción principal de esa pantalla.
- **Listas:** sin decoración extra. Divisores sutiles o espacio en blanco, no ambos a la vez.
- **Indicadores de estado** (ej. "ACTIVA", "CERRADA", "Pendiente"): pastilla con `color-primary-subtle` + texto `color-primary`, o gris neutro si el estado no es positivo. Nunca decorativos si no aportan información.
- **Elementos "de marca" repetidos** (rails, líneas, iconos de firma): **evitar por defecto.** Solo se introducen si responden a la pregunta: *¿esto ayuda al conductor a trabajar mejor?* Si la respuesta es no, no se incluye — aunque diferencie visualmente la app.
- **La única firma acordada:** el indicador de progreso/objetivo de la pantalla de Inicio (pista redondeada + relleno `color-primary`). Es el único lugar donde el verde recibe un tratamiento algo más cuidado que el mínimo funcional, precisamente porque ahí comunica algo real: cuánto queda para el objetivo. Coherente con el icono elegido (concepto "Trayecto" — origen y destino unidos). No se introduce ningún otro elemento gráfico con pretensión de firma.

---

## 6. Cómo se logra el reconocimiento sin logo

Quitar decoración no genera reconocimiento por sí solo — lo genera la **repetición exacta** de muy pocos elementos: el mismo verde (`#1C7C43`, nunca un tono más claro ni más oscuro), el mismo radio de tarjeta (`16px`), el mismo ritmo de espaciado (`16`/`24`), y la firma de progreso definida arriba. La disciplina no consiste en no tener nada distintivo, sino en no tener más de lo necesario — y en que lo poco que existe no varíe nunca entre pantallas.

---

## 7. Checklist antes de dar por buena una pantalla

- [ ] ¿Hay más de una acción "que grita" en la pantalla? → reducir a una.
- [ ] ¿Hay verde que no comunica estado o progreso? → quitarlo.
- [ ] ¿Hay algún elemento puramente decorativo? → quitarlo.
- [ ] ¿Los números importantes son los más grandes y legibles de la pantalla?
- [ ] ¿Podría alguien reconocer que es GeoTaxi sin ver el logo, solo por cómo respira el layout?

---

*Este documento es la referencia base. Antes de pedirle a Claude Code cualquier cambio visual nuevo, contrástalo contra estas reglas — así cada pantalla nueva refuerza el mismo sistema en vez de añadir una variación más.*
