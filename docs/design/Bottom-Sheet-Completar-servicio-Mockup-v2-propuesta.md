# Bottom Sheet de "Completar servicio" - propuesta de composición v2

## Alcance

Esta propuesta actualiza únicamente los bloques de selección:

- plataformas;
- métodos de pago;
- separador visual entre ambos bloques.

Todo lo demás permanece idéntico a la versión actualmente validada:

- Bottom Sheet;
- importe;
- importe cobrado;
- botones;
- teclado;
- comportamiento general;
- lenguaje visual base del producto.

---

## Wireframe actualizado

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ HOME VIGENTE                                                                 │
│                                                                              │
│                                ┌──────────────────────────────────────┐      │
│                                │                                      │      │
│                                │  Importe                             │      │
│                                │  [ TextInput ]                       │      │
│                                │                                      │      │
│                                │  Importe cobrado (opcional)          │      │
│                                │  [ TextInput ]                       │      │
│                                │                                      │      │
│                                │  ─────────────────────────────────   │      │
│                                │                                      │      │
│                                │  ┌────┐ ┌────┐ ┌────┐ ┌────┐         │      │
│                                │  │ T  │ │ U  │ │ C  │ │ F  │         │      │
│                                │  └────┘ └────┘ └────┘ └────┘         │      │
│                                │                                      │      │
│                                │  ─────────────────────────────────   │      │
│                                │                                      │      │
│                                │  ┌────┐ ┌────┐ ┌────┐                │      │
│                                │  │ 💶 │ │ 💳 │ │ 📱 │                │      │
│                                │  └────┘ └────┘ └────┘                │      │
│                                │                                      │      │
│                                │  [ Guardar servicio ]                │      │
│                                │  [ Completar después ]               │      │
│                                │                                      │      │
│                                └──────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Decisiones de composición

### Plataformas

- Una única fila de cuatro identidades.
- Sin texto visible.
- Iconos más grandes para acelerar el reconocimiento.
- Cada opción conserva la identidad visual real de GeoTaxi.

### Métodos de pago

- Una única fila de tres identidades.
- Sin texto visible.
- Iconos más grandes y equilibrados con las plataformas.
- Misma lógica visual que las identidades ya existentes del proyecto.

### Separación entre bloques

- Separador fino y sutil entre plataformas y métodos de pago.
- Se usa el mismo lenguaje visual de división que ya existe en GeoTaxi.
- La separación existe para reforzar que son dos decisiones distintas sin añadir ruido.

---

## Por qué mejora la velocidad de uso

- Reduce lectura innecesaria en un flujo de alta frecuencia.
- Convierte cada bloque en una decisión visual inmediata.
- Aprovecha mejor el ancho disponible, evitando una composición fragmentada.
- Disminuye el tiempo de exploración porque el usuario reconoce la opción por forma e icono, no por etiqueta.

---

## Invariantes

- El resto de la pantalla permanece idéntico.
- No se modifica el Bottom Sheet.
- No se modifica el comportamiento.
- No se modifica el dominio.
- No se modifica la persistencia.
- No se modifica la jerarquía global de la pantalla.

