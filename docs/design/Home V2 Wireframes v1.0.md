# Home V2 Wireframes v1.0

## Propósito

Este documento presenta los primeros wireframes conceptuales de la Home V2 de GeoTaxi para validar visualmente las decisiones ya aprobadas.

La arquitectura, los bloques y el contenido se mantienen exactamente igual en las tres versiones.

La única variable entre versiones es el uso de tarjetas.

---

## Arquitectura compartida

Las tres versiones respetan la misma arquitectura oficial de la jornada abierta:

1. Barra de Contexto Operativo
2. Progreso de la Jornada
3. Acción Principal
4. Registro Operativo
5. Navegación inferior

El contenido también se mantiene estable:

- Barra de Contexto Operativo
  - Fecha operativa
  - Hora de inicio de la jornada
- Progreso de la Jornada
  - Recaudación acumulada
  - Objetivo
  - Importe restante
  - Barra de progreso
  - Porcentaje
- Acción Principal
  - Nuevo servicio
  - Finalizar servicio
- Registro Operativo
  - Viajes y confirmaciones operativas
- Navegación inferior
  - Acceso al resto de módulos

---

## Progreso de la Jornada

El bloque de Progreso de la Jornada debe reflejar las decisiones aprobadas hasta ahora:

- La recaudación es el elemento dominante.
- La etiqueta visible es `Recaudación`.
- En la primera línea de la columna derecha aparecen `Objetivo` y `Restan`.
- En la segunda línea de la columna derecha aparecen la barra y el porcentaje.
- Al llegar al 100 %, aparece `Objetivo alcanzado`.
- El porcentaje puede superar el 100 %.
- La barra se detiene en el 100 %.

Esquema conceptual compartido:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ RECAUDACIÓN                                                                  │
│ 1.245,00 €                                                                   │
│                                                                              │
│                                  Objetivo 1.500 €   Restan 255,00 €         │
│                                  ████████████████░░  83%                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

Cuando se alcanza o supera el objetivo:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ RECAUDACIÓN                                                                  │
│ 1.560,00 €                                                                   │
│                                                                              │
│                                  Objetivo alcanzado                          │
│                                  ██████████████████  104%                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Versión A

Todos los bloques dentro de tarjetas.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [ Barra de Contexto Operativo ]                                              │
│  Sáb, 4 jul                                                   Inicio 07:32   │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ [ Progreso de la Jornada ]                                                   │
│  RECAUDACIÓN                                                                 │
│  1.245,00 €                                                                  │
│                                                                              │
│                                                  Objetivo 1.500 €  Restan   │
│                                                  255,00 €                   │
│                                                  ████████████████░░  83%    │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ [ Acción Principal ]                                                         │
│  Nuevo servicio                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ [ Registro Operativo ]                                                       │
│  07:28  Taxi  ·  🏙️  ·  💳  ·  12,50 €                                         │
│  07:12  Taxi  ·  ✈️  ·  💶  ·  18,00 €                                         │
│  06:54  Uber  ·  ⋯   ·  📱  ·  9,20 €                                          │
│  ...                                                                         │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ [ Navegación inferior ]                                                      │
│  Home     Historial     Estadísticas     Configuración                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Versión B

Solo la Acción Principal dentro de una tarjeta.

```text
Sáb, 4 jul                                                   Inicio 07:32

RECAUDACIÓN
1.245,00 €

                                        Objetivo 1.500 €   Restan 255,00 €
                                        ████████████████░░  83%

┌──────────────────────────────────────────────────────────────────────────────┐
│ Nuevo servicio                                                               │
└──────────────────────────────────────────────────────────────────────────────┘

07:28  Taxi  ·  🏙️  ·  💳  ·  12,50 €
07:12  Taxi  ·  ✈️  ·  💶  ·  18,00 €
06:54  Uber  ·  ⋯   ·  📱  ·  9,20 €
...

Home     Historial     Estadísticas     Configuración
```

---

## Versión C

Ningún bloque utiliza tarjetas.

La jerarquía se consigue únicamente mediante espaciado, alineación, tipografía y tamaño.

```text
Sáb, 4 jul                                                   Inicio 07:32

RECAUDACIÓN
1.245,00 €

                                        Objetivo 1.500 €   Restan 255,00 €
                                        ████████████████░░  83%

Nuevo servicio

07:28  Taxi  ·  🏙️  ·  💳  ·  12,50 €
07:12  Taxi  ·  ✈️  ·  💶  ·  18,00 €
06:54  Uber  ·  ⋯   ·  📱  ·  9,20 €
...

Home     Historial     Estadísticas     Configuración
```

---

## Criterio de comparación

Las tres versiones conservan exactamente:

- la misma arquitectura;
- los mismos bloques;
- el mismo contenido;
- la misma jerarquía funcional;
- el mismo comportamiento del bloque de Progreso de la Jornada;
- la misma relación entre Registro Operativo y Navegación inferior.

La única diferencia evaluable es la presencia o ausencia de tarjetas.

---

## Observación sobre el registro operativo

El Registro Operativo debe seguir reutilizando `Operational Lists Standard v1.0` y `Dominio Visual v1.0`.

Este documento no redefine estructura de fila, densidad, iconografía, colores, jerarquía ni interacción.

---

## Estado del documento

Documento conceptual de wireframes para validación de la Home V2.
