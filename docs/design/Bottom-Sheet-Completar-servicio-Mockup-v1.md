# Bottom Sheet de "Completar servicio" mockup v1

## Mockup visual

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  HOME VIGENTE                                                                │
│  (permanece visible debajo, desenfocada / atenuada)                          │
│                                                                              │
│                                                                              │
│                                ┌──────────────────────────────────────┐      │
│                                │                                      │      │
│                                │  0,00 €                               │      │
│                                │  [ TextInput ]                       │      │
│                                │                                      │      │
│                                │  0,00 € (opcional)                    │      │
│                                │  [ TextInput ]                       │      │
│                                │                                      │      │
│                                │  ┌────┐ ┌────┐ ┌────┐ ┌────┐         │      │
│                                │  │ T  │ │ U  │ │ C  │ │ F  │         │      │
│                                │  └────┘ └────┘ └────┘ └────┘         │      │
│                                │                                      │      │
│                                │  💶   💳   📱   📲   💼   ✏️           │      │
│                                │                                      │      │
│                                │  ┌────────────────────────────────┐  │      │
│                                │  │        Guardar servicio        │  │      │
│                                │  └────────────────────────────────┘  │      │
│                                │  ┌────────────────────────────────┐  │      │
│                                │  │       Completar despues        │  │      │
│                                │  └────────────────────────────────┘  │      │
│                                │                                      │      │
│                                └──────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Distribución visual

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Overlay oscuro suave                                                         │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Sheet blanco                                                            │  │
│  │ Radio superior 24 px                                                    │  │
│  │                                                                        │  │
│  │  Bloque 1                                                               │  │
│  │  Importe                                                                │  │
│  │  [TextInput]                                                            │  │
│  │                                                                        │  │
│  │  Bloque 2                                                               │  │
│  │  Importe cobrado                                                        │  │
│  │  [TextInput]                                                            │  │
│  │                                                                        │  │
│  │  Bloque 3                                                               │  │
│  │  PlatformIdentity  PlatformIdentity  PlatformIdentity  PlatformIdentity │  │
│  │                                                                        │  │
│  │  Bloque 4                                                               │  │
│  │  PaymentMethodIdentity  PaymentMethodIdentity  PaymentMethodIdentity    │  │
│  │  PaymentMethodIdentity  PaymentMethodIdentity  PaymentMethodIdentity    │  │
│  │                                                                        │  │
│  │  Accion primaria                                                        │  │
│  │  [Guardar servicio]                                                     │  │
│  │                                                                        │  │
│  │  Accion secundaria                                                      │  │
│  │  [Completar despues]                                                    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Estados visuales

```text
IMPORTES
┌──────────────────────────────────────┐
│ 0,00 €                               │  -> vacío
│ 12,50 €                              │  -> con valor
└──────────────────────────────────────┘

PLATAFORMAS
┌────┐  ┌────┐  ┌────┐  ┌────┐
│ T  │  │ U  │  │ C  │  │ F  │
└────┘  └────┘  └────┘  └────┘
 base   base   base   base
  │       │      │      │
  └────── seleccionado = refuerzo visual existente

PAGO
💶  💳  📱  📲  💼  ✏️
base -> seleccionado = refuerzo visual existente

BOTONES
[Guardar servicio]   -> primario
[Completar despues]  -> secundario
```

## Comportamiento visual

```text
ABIERTO
Home visible debajo
Overlay + sheet desde abajo

TECLADO
Sheet asciende
Importe sigue visible
Acciones permanecen accesibles

CIERRE
Sheet baja
Overlay desaparece
Home vuelve a ser protagonista
```

## Tema

- Estado actual: claro
- Oscuro: no aplicable en la baseline vigente

