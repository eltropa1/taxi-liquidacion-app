# GeoTaxi · Motion and Microinteractions v1.0

> Estado: 🟡 Fundacional — define las reglas y tokens; la implementación en código todavía usa en su mayoría los valores por defecto de React Native (ver §6, gap de implementación). Ningún documento anterior cubría este tema — es una brecha real que este documento cierra.
>
> Forma parte del conjunto **GeoTaxi Design Language** — ver `GeoTaxi Design Language v1.0.md` para el índice completo.

---

## 1. Principio

El movimiento en GeoTaxi existe para **orientar**, no para impresionar. Cada animación debe responder a una de estas dos preguntas con un sí:

1. *¿Ayuda al conductor a entender qué acaba de pasar o de dónde vino este elemento?*
2. *¿Confirma que su toque se ha registrado?*

Si la respuesta a ambas es no, la animación no se añade — es la misma disciplina que rige el color y la decoración en `design.md`, aplicada al tiempo en vez de al espacio. Nada de rebotes, nada de efectos "delight" (confetti, partículas, spring exagerado), nada de parallax. El objetivo de la misión de este proyecto es que *"la interfaz desaparezca y deje que el trabajo fluya"* — una animación que se nota es una animación que ha fallado su propósito.

---

## 2. Escala de duración

| Token | Valor | Uso |
|---|---|---|
| `motion-instant` | `0ms` (cambio de estilo directo, sin transición) | Feedback de "pressed" (opacity) — debe sentirse simultáneo al toque, no un mini-evento animado independiente. |
| `motion-fast` | `120–150ms` | Micro-transiciones: aparición de un error inline, cambio de texto de un botón a "Guardando...". |
| `motion-base` | `200–250ms` | Entrada/salida de modales y bottom sheets, cambio de pantalla. |
| `motion-slow` | `300ms` | Techo absoluto. Ninguna animación de interfaz debe durar más de 300ms. Un conductor no espera a que algo termine de moverse para seguir trabajando. |

No existe un token por encima de `300ms`. Si algo "necesita" más tiempo para verse bien, el problema es el diseño de esa transición, no la duración.

---

## 3. Curvas de aceleración (easing)

- **Entradas** (algo aparece / se acerca): `ease-out` — empieza rápido, desacelera al llegar a su posición final. Sensación de "asentarse", no de rebotar.
- **Salidas** (algo desaparece / se aleja): `ease-in` — empieza lento, acelera al salir. Se percibe como "se va", no como "se cae".
- **Cambios continuos de valor** (relleno de la barra de progreso cuando cambia el importe): `ease-in-out` lineal y suave — es el único elemento de la app donde una transición de valor con recorrido (no solo aparición/desaparición) tiene sentido, precisamente porque es *la firma* (`design.md` §5).
- **Nunca** se usa una curva con overshoot/spring rebote (el valor final se pasa y vuelve) — asociada a personalidad juguetona, contraria al tono "calma operativa" de `GeoTaxi Branding v1.0`.

---

## 4. Qué anima y qué no

| Elemento | Anima | Cómo |
|---|---|---|
| Botón al presionar | No con transición de tiempo — cambio de opacidad instantáneo (`motion-instant`) | Ver `GeoTaxi States and Feedback v1.0` §1. |
| Apertura de modal / bottom sheet | Sí | Deslizamiento desde abajo (`animationType="slide"`, ya el comportamiento por defecto usado en toda la app), `motion-base`, `ease-out` a la entrada. |
| Cierre de modal / bottom sheet | Sí | Mismo recorrido inverso, `ease-in`. |
| Relleno de la barra de progreso (Inicio) al cambiar el importe recaudado | **Sí — gap de implementación, ver §6** | De su ancho anterior al nuevo, `motion-base`, `ease-in-out`. Hoy el cambio es instantáneo (salto directo de ancho). |
| Aparición de un error inline | Sí | Fade-in simple, `motion-fast`. |
| Cambio de pestaña en la barra inferior | No | Cambio de pantalla directo — es navegación entre destinos permanentes, no una revelación de contenido nuevo; una transición aquí añadiría demora a la acción más frecuente de la app. |
| Listas (aparición de filas al cargar) | No | Las filas aparecen ya renderizadas. Animar la entrada de una lista de servicios es decoración, no orientación — el conductor ya sabe que está viendo una lista, no necesita que se lo demuestren fila a fila. |
| Iconos / chips al seleccionarse | No | El cambio de color/fondo (estado activo, `GeoTaxi Component Catalog v1.0` §4) es instantáneo — es feedback de estado, no una animación de decoración. |

---

## 5. Accesibilidad de movimiento

Cualquier animación implementada con `Animated`/`Reanimated` debe respetar la preferencia del sistema operativo "reducir movimiento" (`AccessibilityInfo.isReduceMotionEnabled()` en React Native) — si está activa, la transición se sustituye por un cambio instantáneo equivalente, nunca se omite el cambio de estado en sí. Las transiciones por defecto de `Modal` y de la navegación de Expo Router ya heredan este comportamiento de la plataforma sin trabajo adicional.

---

## 6. Gap de implementación

A fecha de este documento, el único punto de la tabla de §4 que no está implementado es la animación del relleno de la barra de progreso — hoy cambia de ancho instantáneamente (`width: ${percent}%` sin `Animated.timing`). Queda registrado en `GeoTaxi Design Language Roadmap v1.0.md` como tarea pendiente. El resto de comportamientos de la tabla ya coincide con el código actual porque son, en su mayoría, los valores por defecto de React Native — este documento los formaliza para que no se rompan sin querer al tocar ese código en el futuro.

---

*Para qué confirma cada acción completada (más allá del movimiento), ver `GeoTaxi States and Feedback v1.0.md` §2.*
