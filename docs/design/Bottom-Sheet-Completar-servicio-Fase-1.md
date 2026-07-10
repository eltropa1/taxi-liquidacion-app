# Bottom Sheet de "Completar servicio" v1.1

## Estado

Fase 1. Auditoria del Design System vigente e integracion del mockup definitivo.

## Alcance

Este documento no implementa nada.

No modifica codigo.

No crea componentes.

No altera el Design System.

Su objetivo es encajar el flujo de "Completar servicio" en la baseline visual actual de GeoTaxi.

---

## 1. Auditoria del Design System vigente

### 1.1 Home actual

La Home actual ya fija un lenguaje visual muy concreto:

- fondo crema muy claro;
- contenido en tarjetas blancas con radio amplio;
- jerarquia fuerte en el importe y en la accion principal;
- tipografia pesada y compacta;
- espaciado generoso pero contenido;
- botones grandes con peso visual claro;
- bottom navigation fija y simple.

La Home comunica operativa diaria, no decoracion.

### 1.2 Historial operativo actual

El Historial operativo actual ya resuelve el patron que necesitamos reutilizar:

- fila horizontal compacta;
- `PlatformIdentity` para la identidad de plataforma;
- `PaymentMethodIdentity` para la identidad de pago;
- horario al centro;
- importe alineado a la derecha;
- chevron final como affordance;
- separacion sutil entre filas;
- lectura rapida, de reconocimiento.

### 1.3 Resumen y tarjetas

Las pantallas de resumen muestran el resto del lenguaje visual real del producto:

- cards blancas con borde muy suave;
- titulos grandes y pesados;
- tablas simples de dos o tres columnas;
- labels secundarios en gris;
- importes alineados a la derecha;
- divisores finos;
- bloques muy legibles sin ruido extra.

### 1.4 Modales existentes

La UI actual sigue usando modal centrado para el flujo de finalizacion.

Ese modal ya da varias pistas de sistema:

- overlay oscuro translúcido;
- modal blanco con radio alto;
- inputs apilados en vertical;
- controles de seleccion redondeados ya presentes en la UI actual;
- boton primario oscuro;
- boton secundario claro;
- accion de borrar separada cuando aplica.

No existe un bottom sheet real reutilizable en el codigo actual.

Lo mas cercano es el modal actual y la logica visual de la pantalla, no un componente de sheet formal.

### 1.5 Tipografia, radios, sombras y espaciado

Patrones observables en la baseline actual:

- titulos de seccion entre 18 y 26 px, semibold o bold;
- importes entre 30 y 40 px cuando dominan el bloque;
- textos secundarios entre 13 y 15 px;
- modales con radio amplio, aprox. 20 a 24;
- controles de seleccion con radio alto y forma pill o cuadrada redondeada;
- sombras suaves y profundas solo en acciones principales;
- padding interno tipico entre 16 y 20 px;
- separaciones verticales amplias entre bloques funcionales.

### 1.6 Colores

La baseline actual usa:

- fondo crema/beige claro;
- blanco en cards y modal;
- texto principal en casi negro;
- texto secundario en gris;
- verde para estados positivos y la accion principal en Home;
- navy oscuro para barras de progreso y botones primarios en modal;
- colores de plataforma como identidad fuerte;
- metodos de pago con emoji existentes.

---

## 2. Auditoria de iconografia

### 2.1 Plataformas

Las plataformas ya existen como identidades visuales reutilizables a traves de `PlatformIdentity` y `VisualCatalog`:

| Plataforma | Inicial | Color | Texto |
|---|---:|---|---|
| Taxi | T | `#F4D03F` | `#111111` |
| Uber | U | `#111111` | `#FFFFFF` |
| Cabify | C | `#7B2CBF` | `#FFFFFF` |
| Bolt | B | `#22C55E` | `#111111` |
| FreeNow | F | `#E53935` | `#FFFFFF` |
| Otra | O | `#9E9E9E` | `#111111` |

### 2.2 Metodos de pago

Los metodos de pago tambien son reutilizables exactamente a traves de `PaymentMethodIdentity` y `VisualCatalog`:

| Metodo | Icono |
|---|---|
| Efectivo | `💶` |
| Tarjeta | `💳` |
| Bizum | `📱` |
| App | `📲` |
| Bono empresa | `💼` |
| Otro | `✏️` |

### 2.3 Conclusiones de iconografia

- Taxi, Uber, Cabify y FreeNow se reutilizan tal cual.
- Los metodos de pago se reutilizan tal cual.
- No hace falta crear iconos nuevos.
- El patron visual del historial ya es suficiente para reconocer plataforma y pago porque usa las identidades reales del dominio visual, no reinterpretaciones.

---

## 3. Mockup definitivo

### 3.1 Reglas de integracion

- Bottom sheet adaptable.
- La Home queda visible debajo.
- No hay navegacion dentro del flujo.
- No hay titulos innecesarios.
- No mostrar ningun encabezado de seccion dentro del bottom sheet.
- Solo se muestran las plataformas configuradas por el conductor.
- No existe autoguardado.
- Hay dos acciones explicitas: `Guardar servicio` y `Completar despues`.
- El importe es la jerarquia principal.

### 3.2 Orden visual

1. Importe.
2. Importe cobrado, opcional.
3. Seleccion de plataforma con `PlatformIdentity`.
4. Seleccion de metodo de pago con `PaymentMethodIdentity`.
5. `Guardar servicio`.
6. `Completar despues`.

### 3.3 Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  Home actual permanece visible debajo con overlay oscuro suave              │
│                                                                              │
│                     ┌──────────────────────────────────┐                    │
│                     │                                  │                    │
│                     │  Importe                          │                    │
│                     │  0,00                             │                    │
│                     │                                  │                    │
│                     │  Importe cobrado                  │                    │
│                     │  0,00                             │                    │
│                     │                                  │                    │
│                     │  [T] [U] [C] [F]                 │                    │
│                     │                                  │                    │
│                     │  💶 💳 📱 📲 💼 ✏️                 │                    │
│                     │                                  │                    │
│                     │  [Guardar servicio]              │                    │
│                     │  [Completar despues]             │                    │
│                     │                                  │                    │
│                     └──────────────────────────────────┘                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Traduccion visual

- El importe debe leerse antes que cualquier seleccion auxiliar.
- La plataforma conserva `PlatformIdentity` para maximizar reconocimiento.
- El metodo de pago usa `PaymentMethodIdentity`, no una nueva tarjeta ni una reinterpretacion.
- Las acciones finales conservan el patron de confirmacion claro del producto.
- El sheet usa una tarjeta inferior para mantener contexto y evitar el gesto de "pantalla nueva".

---

## 4. Componentes reutilizados

- `TripHistoryRow`
- `TripHistory`
- `VisualCatalog`
- `VisualCatalog.listPlatforms()`
- `VisualCatalog.listPaymentMethods()`
- `PlatformIdentity`
- `PaymentMethodIdentity`
- `ServiceTypeIdentity` solo si el sheet incorpora selecciones ya existentes del dominio visual
- `TextInput` ya existente
- `Pressable` ya existente
- el modal actual como contenedor visual de referencia
- el overlay modal actual como capa de fondo de referencia

---

## 5. Componentes nuevos propuestos

Ninguno.

No se propone ningun componente reutilizable nuevo.

---

## 6. Justificacion de las decisiones nuevas

### 6.1 Bottom sheet inferior en lugar de modal centrado

Se usa bottom sheet porque conserva mejor la Home visible debajo y reduce la sensacion de salto de contexto.

### 6.2 Supresion de titulos de seccion

Se omiten cualquier encabezado de seccion dentro del bottom sheet para aplicar minimalismo contextual.

### 6.3 Importe como primer bloque

Se coloca primero porque es la decision operacional principal del flujo.

### 6.4 Mostrar solo plataformas configuradas

Se limita la lista a las plataformas activadas por el conductor para evitar opciones irrelevantes y reducir carga cognitiva.

### 6.5 Dos acciones finales

Se mantienen `Guardar servicio` y `Completar despues` para separar guardar de posponer sin añadir pasos ni autoguardado.
