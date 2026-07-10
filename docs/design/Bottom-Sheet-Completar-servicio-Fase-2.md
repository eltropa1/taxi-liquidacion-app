# Bottom Sheet de "Completar servicio" v2.0

## Estado

Fase 2. Mockup visual definitivo dentro del proyecto.

## Fuente de verdad

Este documento se construye directamente sobre [Bottom-Sheet-Completar-servicio-Fase-1.md](/C:/Users/monic/Desktop/geo/taxi-liquidacion-app/docs/design/Bottom-Sheet-Completar-servicio-Fase-1.md).

No reinterpreta decisiones de producto.

No redefine el flujo.

No altera reglas de negocio.

---

## 1. Objetivo visual

Construir un bottom sheet que parezca una continuation natural de GeoTaxi:

- mismo lenguaje visual;
- misma densidad;
- mismas superficies;
- mismas identidades visuales;
- misma jerarquia operativa;
- misma sensacion de herramienta de trabajo.

El resultado debe poder pasar a implementacion sin volver a debatir producto.

---

## 2. Composicion visual definitiva

### 2.1 Estructura general

El bottom sheet se compone de:

1. overlay semitransparente sobre la Home;
2. contenedor inferior anclado al borde inferior;
3. area de contenido desplazable;
4. bloque de acciones final fijo en la base del sheet.

### 2.2 Jerarquia de lectura

Orden visual exacto:

1. Importe.
2. Importe cobrado.
3. Seleccion de plataforma mediante `PlatformIdentity`.
4. Seleccion de metodo de pago mediante `PaymentMethodIdentity`.
5. Accion primaria `Guardar servicio`.
6. Accion secundaria `Completar despues`.

No hay encabezados de seccion.

No hay subtitulos.

No hay texto de contexto adicional dentro del sheet.

---

## 3. Mockup de alta fidelidad

### 3.1 Wireframe principal

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Home actual visible en background                                           │
│                                                                              │
│                         ┌──────────────────────────────────┐                 │
│                         │                                  │                 │
│                         │  Importe                         │                 │
│                         │  [ TextInput ]                   │                 │
│                         │                                  │                 │
│                         │  Importe cobrado                 │                 │
│                         │  [ TextInput ]                   │                 │
│                         │                                  │                 │
│                         │  [ PlatformIdentity ]            │                 │
│                         │  [ PlatformIdentity ]            │                 │
│                         │  [ PlatformIdentity ]            │                 │
│                         │  [ PlatformIdentity ]            │                 │
│                         │                                  │                 │
│                         │  [ PaymentMethodIdentity ]       │                 │
│                         │  [ PaymentMethodIdentity ]       │                 │
│                         │  [ PaymentMethodIdentity ]       │                 │
│                         │  [ PaymentMethodIdentity ]       │                 │
│                         │  [ PaymentMethodIdentity ]       │                 │
│                         │                                  │                 │
│                         │  [ Guardar servicio ]            │                 │
│                         │  [ Completar despues ]           │                 │
│                         │                                  │                 │
│                         └──────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Lectura visual del bloque de plataforma

La seleccion de plataforma no usa una tarjeta nueva ni un lenguaje nuevo.

Cada opcion se presenta como la identidad ya conocida del sistema:

- `PlatformIdentity` de Taxi;
- `PlatformIdentity` de Uber;
- `PlatformIdentity` de Cabify;
- `PlatformIdentity` de FreeNow;
- solo las plataformas activas del conductor.

### 3.3 Lectura visual del bloque de pago

La seleccion de metodo de pago reutiliza exactamente la identidad visual ya declarada:

- `PaymentMethodIdentity` de Efectivo;
- `PaymentMethodIdentity` de Tarjeta;
- `PaymentMethodIdentity` de Bizum;
- `PaymentMethodIdentity` de App;
- `PaymentMethodIdentity` de Bono empresa;
- `PaymentMethodIdentity` de Otro, si existe en el contexto.

No se inventan iconos.

No se crean variantes gráficas.

---

## 4. Distribución exacta de componentes

### 4.1 Contenedor

- Anclaje: borde inferior de pantalla.
- Anchura: 100% del viewport.
- Altura: adaptable al contenido.
- Límite superior recomendado: 84% de la altura disponible.
- Fondo: blanco.
- Radio superior izquierdo y derecho: 24 px.
- Bordes laterales e inferior: rectos al contacto con el viewport.
- Sombra: la misma familia de elevación suave del producto.

### 4.2 Overlay

- Cobertura: toda la pantalla excepto el sheet.
- Opacidad: oscura suave, suficiente para separar capas sin anular la Home.
- La Home sigue siendo reconocible debajo.

### 4.3 Padding interno del sheet

- Padding horizontal: 20 px.
- Padding superior: 20 px.
- Padding inferior: 20 px.
- Separacion entre bloques: 16 px.
- Separacion entre elementos dentro de un bloque: 12 px.

### 4.4 Bloque de importe

- Label implícito por contexto, sin encabezado visible.
- Campo principal: `TextInput` de importe.
- Jerarquia visual: la mas alta del sheet.
- Tamaño recomendado del valor: 34 px.
- Line height recomendado: 38 px.
- Peso: bold / extra bold, consistente con la Home.

### 4.5 Bloque de importe cobrado

- Campo secundario, opcional.
- Mismo ancho que el importe.
- Menor jerarquia tipográfica que el importe principal.
- Separacion vertical respecto al bloque anterior: 12 px.

### 4.6 Bloque de plataforma

- Rejilla de identidades visuales existentes.
- Distribucion en flujo horizontal con wrap.
- Separacion entre elementos: 8 px.
- Tamaño visual de cada identidad: el mismo patrón compacto ya usado en Historial operativo.
- No se añade título.

### 4.7 Bloque de metodo de pago

- Rejilla de identidades visuales existentes.
- Distribucion horizontal con wrap.
- Separacion entre elementos: 8 px.
- Tamaño visual: el mismo patrón ya usado en la identidad de pago del Historial operativo, sin ampliaciones.
- No se añade título.

### 4.8 Bloque de acciones

- Boton primario: `Guardar servicio`.
- Boton secundario: `Completar despues`.
- Disposicion: vertical, uno debajo del otro.
- Separacion entre botones: 12 px.
- El boton primario mantiene el mayor peso visual.
- El boton secundario mantiene presencia clara pero menor prioridad.

---

## 5. Espaciados y márgenes

### 5.1 Margenes externos

- Distancia superior del sheet al contenido visible de la Home: variable según el alto de pantalla.
- Distancia lateral al viewport: 0 px.
- Distancia al borde inferior: 0 px.

### 5.2 Margenes internos

- Padding general del contenedor: 20 px.
- Separacion entre campo de importe y campo de importe cobrado: 12 px.
- Separacion entre bloque de importe cobrado y plataforma: 16 px.
- Separacion entre plataforma y metodo de pago: 16 px.
- Separacion entre metodo de pago y acciones: 20 px.

### 5.3 Densidad

La densidad debe mantenerse alta pero legible.

No hay espacio dedicado a explicaciones.

No hay espacios decorativos.

---

## 6. Estados de selección

### 6.1 Campo de importe

- Estado vacío: placeholder neutro, visible y legible.
- Estado foco: borde o resaltado de foco coherente con `TextInput` existente.
- Estado con valor: el valor domina visualmente.

### 6.2 Campo de importe cobrado

- Estado vacío: placeholder neutro.
- Estado con valor: jerarquia secundaria respecto al importe.
- Si queda vacío, la lógica existente interpreta que coincide con el importe.

### 6.3 Plataforma

- Estado no seleccionado: identidad visual en su superficie base.
- Estado seleccionado: la misma identidad visual con un refuerzo de selección consistente con la UI actual.
- El cambio de seleccion debe ser instantaneo y evidente.

### 6.4 Metodo de pago

- Estado no seleccionado: identidad visual base.
- Estado seleccionado: refuerzo visual coherente con los patrones ya existentes.
- Debe poder reconocerse sin leer texto adicional.

### 6.5 Botones

- Primario: peso dominante.
- Secundario: contorno o superficie clara, sin competir con el primario.

---

## 7. Comportamiento visual del bottom sheet

### 7.1 Apertura

- Entra desde abajo.
- El overlay aparece al mismo tiempo.
- La Home permanece visible detrás.

### 7.2 Cierre

- Sale hacia abajo.
- El overlay desaparece al mismo tiempo.
- No hay navegación.
- No hay salto de pantalla.

### 7.3 Estado extendido

Si el contenido ocupa mas de la altura disponible:

- el area interna se vuelve desplazable;
- las acciones finales permanecen accesibles;
- el sheet conserva su anclaje inferior;
- la informacion principal nunca se oculta al completo.

### 7.4 Interaccion

- La seleccion de plataforma y pago debe ser inmediata.
- No se introducen pasos intermedios.
- No aparece confirmacion adicional.

---

## 8. Adaptacion cuando aparece el teclado

### 8.1 Regla general

El sheet debe adaptarse al teclado sin perder el contexto.

### 8.2 Comportamiento esperado

- El contenedor asciende lo necesario para evitar solapamiento con el teclado.
- El bloque de importe permanece visible siempre que sea posible.
- El bloque de acciones no queda oculto.
- Si el teclado reduce demasiado la altura, el contenido central pasa a scroll vertical.

### 8.3 Prioridades cuando el teclado está abierto

1. Mantener visible el importe.
2. Mantener visibles las acciones.
3. Permitir desplazamiento del contenido intermedio.

### 8.4 Auto-focus

El primer foco visual debe ir al campo de importe, porque es la jerarquia principal del flujo.

---

## 9. Estados claro y oscuro

### 9.1 Estado claro

Aplica al proyecto actual.

- Fondo de la app en crema claro.
- Sheet blanco.
- Texto principal oscuro.
- Texto secundario gris.
- Identidades de plataforma y pago intactas.

### 9.2 Estado oscuro

No aplica en la baseline actual.

La app no muestra soporte de tema oscuro en las pantallas vigentes revisadas para esta fase.

Si en el futuro se añade soporte de color scheme, el sheet debera conservar:

- la misma estructura;
- la misma jerarquia;
- las mismas identidades visuales;
- solo cambios de color tokenizados.

---

## 10. Reutilizacion literal de componentes

El mockup debe construirse con reutilizacion literal, no aproximada, de:

- `PlatformIdentity`
- `PaymentMethodIdentity`
- `VisualCatalog`
- `TextInput`
- `Pressable`
- tipografía existente
- espaciados existentes
- radios existentes
- colores existentes
- elevaciones existentes

Esto significa:

- mismos componentes;
- mismas superficies;
- misma familia tipográfica;
- mismos patrones de selección;
- misma elevación;
- mismo lenguaje visual.

---

## 11. Entrega visual esperada

El mockup final debe sentirse como una extension natural de la Home y del Historial operativo actuales.

No debe parecer:

- una pantalla externa;
- un modal genérico;
- un formulario nuevo;
- un sistema visual paralelo.

Debe parecer GeoTaxi.

