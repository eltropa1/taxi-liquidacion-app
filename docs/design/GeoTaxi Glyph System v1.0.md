# GeoTaxi Glyph System v1.0

> Estado: 🟢 Aprobado. Especificación oficial del símbolo de GeoTaxi — construcción geométrica, color, y reglas de uso. **Es la fuente única** para el símbolo; `GeoTaxi Branding v1.0.md` ya no repite esta geometría, solo enlaza aquí.
>
> Forma parte del conjunto **GeoTaxi Design Language** — ver `GeoTaxi Design Language v1.0.md` para el índice completo.

---

## 1. Introducción

### 1.1 Objetivo
Fijar, sin ambigüedad, cómo se construye el símbolo de GeoTaxi, con qué colores, en qué contextos aparece y en cuáles no — para que cualquier persona o herramienta (incluida una IA generativa de imagen) pueda reproducirlo de forma idéntica sin necesitar nada más que este documento.

### 1.2 Alcance
Cubre el símbolo (*glyph*) exclusivamente. No cubre tipografía de marca (no existe — ver `GeoTaxi Branding v1.0.md` §4), ni el resto del sistema visual de la interfaz (colores, componentes, motion de la UI — ver `design.md` y los demás documentos del índice).

### 1.3 Filosofía
El Glyph debe transmitir **calma, estabilidad, simplicidad, robustez, permanencia**. Nunca debe transmitir velocidad exagerada, agresividad, complejidad, decoración o moda pasajera. Es la misma disciplina que rige toda la app (`GeoTaxi Design Language v1.0.md` §1), aplicada a un único símbolo en vez de a una pantalla.

---

## 2. El Glyph

### 2.1 Concepto
Dos trayectorias independientes convergen en un único punto. No es un pictograma de un objeto — no representa un coche, un mapa, un GPS ni un taxímetro. Representa un principio: **la convergencia de trayectorias hacia un único resultado resuelto correctamente.**

Este es el mismo concepto que `design.md` §5 nombraba como *"Trayecto — origen y destino unidos"* al describir la firma de progreso de Inicio. Este documento lo formaliza como el **Glyph**, su forma abstracta e independiente, reutilizable fuera de esa barra de progreso concreta (icono de app, splash, marca).

### 2.2 Significado
Precisión, confianza, continuidad, resolución, equilibrio, control.

### 2.3 Qué representa / qué no representa
Representa la capacidad del sistema para llevar cualquier servicio hasta un resultado resuelto — no un viaje concreto, no una ruta real, no una localización. No es un logotipo en el sentido de "nombre estilizado" (`GeoTaxi Branding v1.0.md` §4 ya fija que no hay tipografía de marca) — es un símbolo puramente geométrico.

---

## 3. Construcción geométrica

**Ley única:** dos trazos rectos, idénticos y simétricos, convergen en una unión superior continua.

### 3.1 Retícula
Todo se especifica como proporción de un lienzo cuadrado de lado `S` (ej. `S = 1024px` para los assets digitales). Ninguna medida se da en píxeles absolutos aislados — todo escala con `S`.

### 3.2 Ángulo
Cada trazo forma un ángulo de **≈31.7° respecto al eje vertical** (≈58.3° respecto a la horizontal), derivado directamente de las proporciones de §3.5 — no es un valor libre, es consecuencia de la altura y el semiancho de la marca. Si se ajusta la proporción altura/anchura en una revisión futura, este ángulo se recalcula a partir de ella; nunca se fija el ángulo y se deforma la proporción para encajarlo.

### 3.3 Grosor
Constante en todo el recorrido de cada trazo — no ahusado, no varía en ningún punto. El valor exacto depende de la variante (ver tabla en §3.5).

### 3.4 Radios (terminaciones)
Los tres extremos — punto inferior izquierdo, unión superior, punto inferior derecho — son **completamente redondeados**: semicírculos de radio exactamente igual a la mitad del grosor del trazo. Sin vértices afilados en ningún punto, incluida la unión superior (que es una unión suave y continua, no un ángulo vivo).

### 3.5 Proporciones

| Variante | Grosor del trazo | Altura total | Semiancho en la base |
|---|---|---|---|
| Icono standalone (`icon.png`, también válido para iOS) | `0.155 × S` | `0.56 × S` | `altura × 0.62` |
| Foreground de adaptive icon (Android) | `0.115 × S` | `0.40 × S` | `altura × 0.62` |
| Splash | `0.11 × S` | `0.34 × S` | `altura × 0.62` |

La proporción semiancho/altura (`0.62`) es **fija entre variantes** — lo único que cambia es la escala global de la marca (para respetar la zona de seguridad de cada contexto, §4.2), nunca su forma relativa.

### 3.6 Centro óptico
La marca se centra horizontalmente. Verticalmente, la unión superior se sitúa al **21% × S** desde el borde superior del lienzo — no al 50% exacto. Esto es una corrección de **centrado óptico**, no un descuido: al ser una forma más pesada visualmente hacia la base (dos brazos abriéndose), centrar matemáticamente la caja delimitadora hace que el glyph "parezca" descentrado hacia arriba; desplazar la unión superior ligeramente por encima del centro geométrico es lo que lo hace *parecer* centrado al ojo.

### 3.7 Espacio negativo
El hueco triangular entre los dos trazos es parte del diseño, no un vacío accidental — su forma queda determinada enteramente por el ángulo (§3.2) y el grosor (§3.3). No se rellena, no se le añade una tercera forma dentro, y no se ajusta de forma independiente al resto de la geometría (cambiar el ángulo cambia el espacio negativo automáticamente; son el mismo parámetro visto desde dos ángulos).

### 3.8 Prohibido en la construcción
Relleno de color sólido plano únicamente — sin degradado, sin sombra, sin brillo, sin contorno/stroke adicional, sin efectos 3D. Sin guías, retículas, marcas de agua ni artefactos de archivo de trabajo visibles en el export final.

---

## 4. Especificación técnica

### 4.1 Colores oficiales

| Elemento | Color | Token |
|---|---|---|
| Glyph (uso estándar) | `#1C7C43` | `color-primary` |
| Fondo — crema | `#F7F3EC` | `color-bg` |
| Fondo — blanco | `#FFFFFF` | `color-surface` |
| Fondo — oscuro (dentro del ecosistema de producto) | `#14120F` | `color-bg-dark` |
| Fondo — verde corporativo (glyph invertido) | Fondo `#1C7C43`, glyph en `#FFFFFF` o `#F7F3EC` | — |

**Nunca** un tono de verde más claro ni más oscuro que `#1C7C43` para el glyph — misma regla que rige todo el uso del verde en la app (`design.md` §1 y §6).

**Sobre el negro puro (`#000000`):** no se usa dentro del ecosistema de producto (viola la regla de "nunca negro puro" de `design.md` §1bis, pensada para evitar el efecto "halo" en pantallas OLED). Se permite **únicamente** en variantes monocromas estrictamente externas — impresión física, avatares de redes sociales — donde el medio es distinto (tinta o un sistema de diseño ajeno) y no convive con el resto de la interfaz. Nunca dentro de la app, nunca en material que aparezca junto a otros elementos de producto.

**Colores prohibidos:** degradados, sombras, brillos, contornos, transparencias decorativas.

### 4.2 Zona de seguridad
- **Adaptive icon (Android):** el sistema recorta el foreground a una máscara circular/variable — todo el glyph debe caber dentro del **66% central** del lienzo. Ya contemplado en las proporciones de §3.5 (el foreground usa una marca más pequeña que el icono standalone precisamente por esto).
- **Área de respeto (lienzo libre — documentos, marketing, web, redes sociales):** separación mínima equivalente al **35% de la altura del glyph** en todos los lados, sin texto, iconos u otros elementos dentro de esa zona.

**Estas dos reglas no se aplican simultáneamente al mismo lienzo.** El icono de app (lienzo fijo 1024×1024, sin control sobre lo que Android recorta) sigue solo la zona de seguridad del 66%. El área de respeto del 35% rige exclusivamente en contextos donde hay control total del lienzo circundante (un documento, una web, un post) — aplicarla también al icono de app sacaría el glyph fuera de la zona seguridad de Android (el cálculo no cierra: un margen del 35% sobre una marca ya reducida al 40%×S de altura produce una caja de ~0.84×S de ancho, por encima del 66% permitido). Son dos salvaguardas para dos problemas distintos: una evita que el sistema operativo recorte el símbolo; la otra evita que otros elementos de diseño lo agobien visualmente.

### 4.3 Tamaño mínimo
- **Digital:** 16px.
- **Impresión:** 6mm.

Por debajo de ese tamaño no se garantiza una lectura correcta de la geometría (los radios y el espacio negativo dejan de distinguirse).

### 4.4 Versiones oficiales

| Versión | Especificación |
|---|---|
| **App Icon** | PNG 1024×1024, sRGB, sin canal alfa (opaco). Fondo crema `#F7F3EC`, glyph verde. Válido para Android (`expo.icon`) e iOS sin modificaciones — ver §4.7. |
| **Adaptive Icon (Android)** | Foreground: PNG con canal alfa, transparente, solo el glyph. Background: sólido `#F7F3EC` (o `backgroundColor` directo en `app.json`, sin archivo). |
| **Splash** | Glyph centrado, canal alfa transparente; el fondo `#F7F3EC` se define en `app.json` (`expo.splash.backgroundColor`), no horneado en el PNG. |
| **Monocromo** | Verde (`#1C7C43`), o negro/blanco puros — únicamente para uso externo (impresión, redes), nunca dentro de la app (ver §4.1). Nada más: no hay una cuarta variante de color "creativa". |

### 4.5 Versiones prohibidas
Cualquier combinación de color fuera de la tabla de §4.1, cualquier variante con efectos (sombra, degradado, brillo, contorno, 3D), cualquier proporción que no siga §3.5.

### 4.6 Formatos y tamaños de exportación

| Archivo | Tamaño | Formato | Fondo | Plataforma |
|---|---|---|---|---|
| `assets/icon.png` | 1024×1024px | PNG, sRGB, sin alfa (opaco) | Opaco `#F7F3EC` | Android e iOS (mismo archivo para ambas) |
| `assets/icons/adaptive-icon-foreground.png` | 1024×1024px | PNG con alfa | Transparente | Solo Android |
| `assets/icons/adaptive-icon-background.png` | 1024×1024px | PNG | Sólido opaco `#F7F3EC` | Solo Android (opcional — puede sustituirse por `backgroundColor` en `app.json`) |
| `assets/splash-icon.png` | 1024×1024px | PNG con alfa | Transparente | Android e iOS (mismo archivo) |

### 4.7 Nota sobre iOS
El proyecto es Android-only *hoy* (`app.json` → `"platforms": ["android"]`), pero es una decisión de build, no de diseño — iOS está previsto a futuro y esta especificación no lo excluye en ningún punto. Los cuatro archivos de la tabla ya son válidos para ambas plataformas; iOS exige un icono cuadrado completamente opaco sin transparencia y sin esquinas redondeadas (el sistema aplica la máscara de esquina automáticamente), que es exactamente el formato de `icon.png`. Cuando se active iOS, solo hace falta añadir `"ios"` a `platforms` — el símbolo no se rediseña ni se vuelve a exportar.

### 4.8 Conexión en `app.json` (pendiente)

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "backgroundColor": "#F7F3EC",
      "resizeMode": "contain"
    },
    "android": {
      "package": "com.taxiliquidacionapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/icons/adaptive-icon-foreground.png",
        "backgroundColor": "#F7F3EC"
      }
    }
  }
}
```

Solo se hace visible en un build nativo (EAS build o `expo prebuild`), no en una sesión de Metro/Expo Go.

---

## 5. Aplicaciones

### 5.1 Usos permitidos
- Icono de aplicación (App Icon, Adaptive Icon).
- Splash screen.
- Documentación oficial (portadas/encabezados de los propios documentos del Design Language, si se desea).
- Material de marca **externo a la interfaz**: sitio web, redes sociales, exportaciones con membrete (ej. un PDF de liquidación con el glyph en el encabezado — nota: la app hoy exporta CSV, no PDF; si en el futuro se añade exportación PDF, el glyph puede aparecer en su membrete).

### 5.2 Usos explícitamente NO permitidos (y por qué)

Esta es la corrección más importante frente a un borrador anterior de este documento, que proponía el glyph dentro de **botones, motion de interacción, confirmaciones y pantallas de carga**. Se descarta explícitamente:

- **`design.md` §5-6** ya fija que la *única* firma con tratamiento gráfico cuidado es el indicador de progreso de Inicio, y que no se introduce ningún otro elemento con pretensión de firma — meter el glyph en botones lo convertiría en un segundo elemento de marca repetido, justo lo que esa regla prohíbe.
- **`GeoTaxi States and Feedback v1.0.md` §2** fija que GeoTaxi no usa confirmaciones decorativas — el cambio de estado ya confirmado es la confirmación. Un glyph apareciendo en una confirmación sería ruido añadido sobre una señal que ya existe.
- **`GeoTaxi Motion and Microinteractions v1.0.md` §1** prohíbe cualquier animación que no oriente o confirme un toque — un glyph animándose en una pantalla de carga es decoración con pretensión de "delight", exactamente lo que ese documento descarta.

**Regla de decisión:** el Glyph vive en los puntos de entrada a la marca (icono, splash) y en comunicación *sobre* el producto (documentos, redes, web) — nunca dentro del flujo de trabajo del conductor. Si en el futuro alguien propone usarlo en un botón o una carga, la respuesta por defecto es no, salvo que se revise y apruebe explícitamente una nueva versión de este documento.

---

## 6. Normas de uso

### 6.1 Escalado
Solo escalado uniforme (mismo factor en ambos ejes). Nunca se estira ni se comprime en un solo eje — rompería el ángulo fijo de §3.2 y la proporción de §3.5.

### 6.2 Fondos
Solo los de §4.1. Nunca sobre una fotografía, una textura, un patrón, o un color fuera de esa tabla.

### 6.3 Inversiones
Permitida únicamente la inversión de color glyph/fondo ya especificada en §4.1 (verde sobre crema/blanco/oscuro, o blanco/crema sobre verde). Nunca una inversión especular (voltear la forma) ni una rotación.

### 6.4 Monocromo
Ver §4.4 — verde, negro o blanco, nada más. El monocromo no es una licencia para crear una quinta variante de color.

### 6.5 Errores frecuentes a evitar
Cambiar el color fuera de la tabla · estirar la forma · girar el símbolo · añadir sombras o degradados · modificar el grosor · alterar la simetría · añadir bordes · aplicar efectos 3D · usar el glyph en botones, confirmaciones o pantallas de carga (§5.2) · centrar matemáticamente en vez de ópticamente (§3.6).

---

## 7. Evolución

### 7.1 Elementos inmutables
La ley de construcción (§3, dos trazos simétricos convergentes con terminaciones redondeadas), el color oficial `#1C7C43`, la regla de "nunca negro puro dentro del producto", y la restricción de aplicaciones de §5 (nunca dentro del flujo de interacción). Cambiar cualquiera de estos es, por definición, un símbolo distinto — no una versión nueva de este.

### 7.2 Elementos ajustables (en una futura v1.1+, con justificación explícita)
Afinado fino de las proporciones de §3.5 si una prueba de legibilidad a 16px lo exige; el valor exacto del centrado óptico de §3.6 si se cambia la proporción altura/anchura; nuevos contextos de aplicación en §5.1 si aparece un caso de uso real externo a la interfaz (nunca uno interno al flujo de trabajo, eso requeriría revisar §5.2 explícitamente, no solo añadir una excepción).

---

## 8. Principio fundamental

El GeoTaxi Glyph no es un logotipo. Es el elemento fundacional del *Design Language* de GeoTaxi. Todas las aplicaciones futuras de la marca deben construirse respetando su geometría, sus proporciones y su filosofía — garantizando una identidad reconocible y duradera sin necesitar que aparezca en más sitios de los que este documento permite.

---

*Para el nombre del producto, posicionamiento y voz, ver `GeoTaxi Branding v1.0.md`. Para el índice completo del sistema, `GeoTaxi Design Language v1.0.md`.*
