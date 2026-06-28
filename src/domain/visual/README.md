# Dominio Visual

`src/domain/visual/` contiene la infraestructura de identidad visual oficial de TaxiGeo.

## Objetivo

Centralizar en un único lugar la información visual estable del producto:

- colores de plataforma;
- iconos de tipo de servicio;
- iconos de método de pago;
- jerarquía de lectura visual.

No define estilos de pantalla, ni componentes, ni navegación, ni comportamiento de UI.

## Arquitectura

```
src/domain/visual/
├── contracts/
│   ├── VisualIdentity.ts
│   ├── PlatformIdentity.ts
│   ├── ServiceTypeIdentity.ts
│   └── PaymentMethodIdentity.ts
├── catalogs/
│   ├── platforms.ts
│   ├── serviceTypes.ts
│   ├── paymentMethods.ts
│   └── visualLegend.ts
├── constants/
│   └── visualOrder.ts
├── VisualCatalog.ts
├── index.ts
└── README.md
```

### `contracts/`

Define los contratos de dominio.

- `VisualIdentity` es la base común.
- `PlatformIdentity`, `ServiceTypeIdentity` y `PaymentMethodIdentity` especializan esa base.

### `catalogs/`

Contiene la única fuente de verdad de la información visual.

- `platforms.ts` declara colores oficiales de plataforma.
- `serviceTypes.ts` declara iconos oficiales de tipo de servicio.
- `paymentMethods.ts` declara iconos oficiales de método de pago.
- `visualLegend.ts` describe la jerarquía y el significado de cada canal visual.

### `constants/`

Contiene constantes estructurales del dominio.

- `visualOrder.ts` define el orden de lectura visual.

### `VisualCatalog.ts`

Es la API pública del dominio.

Expone lecturas seguras y de solo lectura sobre:

- plataformas;
- tipos de servicio;
- métodos de pago;
- leyenda visual;
- orden visual.

## Reglas

1. Toda información visual vive en `catalogs/`.
2. No se duplican colores ni iconos en componentes.
3. No se introducen dependencias con React, Expo, pantallas o componentes.
4. La identidad visual se consulta, no se reinterpreta.
5. El dominio es estable: un concepto siempre representa lo mismo.

## Uso

```ts
import { VisualCatalog } from 'ruta/al/modulo/src/domain/visual'; // ajusta la ruta según tu proyecto

const taxi = VisualCatalog.getPlatform('taxi');
const airport = VisualCatalog.getServiceType('airport');
const cash = VisualCatalog.getPaymentMethod('cash');

console.log(taxi?.color);
console.log(airport?.icon);
console.log(cash?.icon);
```

```ts
const legend = VisualCatalog.visualLegend;
const order = VisualCatalog.visualOrder;

console.log(legend.hierarchy);
console.log(order.amount);
```

```ts
const allPlatforms = VisualCatalog.listPlatforms();
const allVisualItems = VisualCatalog.listAll();
```

## Extensión futura

El diseño está preparado para incorporar nuevas identidades visuales como:

- `Goal`;
- `Expense`;
- `Alert`;
- `AI`;
- `Sync`.

La regla de extensión es mantener el patrón:

1. crear el contrato;
2. registrar la nueva identidad en `catalogs/`;
3. exponer la lectura desde `VisualCatalog` si forma parte de la API pública.

No hace falta cambiar pantallas ni componentes para incorporar nuevas identidades al dominio.
