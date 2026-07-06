# Home V2 Visual Wireframes v1.0

## Objetivo

Este documento muestra visualmente tres propuestas de la Home V2 para comparar la presencia o ausencia de tarjetas.

No es un documento de especificación.

Es un documento de evaluación visual.

Las tres versiones mantienen exactamente la misma arquitectura, el mismo contenido, las mismas proporciones, los mismos márgenes, los mismos textos y la misma navegación.

La única diferencia es el uso de tarjetas.

---

## VERSIÓN A

Todos los bloques utilizan tarjeta.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      HOME V2 · GEO TAXI                                      │
│                              Sáb, 4 jul                                        Inicio 07:32  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ PROGRESO DE LA JORNADA                                                                       │
│                                                                                              │
│ ┌───────────────────────────────┐  ┌──────────────────────────────────────────────────────┐ │
│ │ RECAUDACIÓN                   │  │ Objetivo 1.500 €   Restan 255,00 €                  │ │
│ │                               │  │                                                    │ │
│ │ 1.245,00 €                    │  │ ████████████████░░  83%                            │ │
│ │                               │  │                                                    │ │
│ │                               │  │                                                    │ │
│ └───────────────────────────────┘  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ ACCIÓN PRINCIPAL                                                                             │
│                                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Nuevo servicio                                                                             │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ REGISTRO OPERATIVO                                                                           │
│                                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 07:28   Taxi    ·   🏙️   ·   💳   ·   12,50 €                                             │ │
│ │ 07:12   Taxi    ·   ✈️   ·   💶   ·   18,00 €                                             │ │
│ │ 06:54   Uber    ·   ⋯    ·   📱   ·    9,20 €                                             │ │
│ │ 06:31   Cabify  ·   ⭐    ·   💳   ·   14,80 €                                             │ │
│ │ 06:08   Bolt    ·   📅    ·   💶   ·   22,00 €                                             │ │
│ │ 05:44   Taxi    ·   🛣️   ·   💶   ·   10,50 €                                             │ │
│ │ 05:18   Uber    ·   🏥    ·   📲   ·   16,00 €                                             │ │
│ │ ...                                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ NAVEGACIÓN INFERIOR                                                                          │
│                                                                                              │
│      Home          Historial          Estadísticas          Configuración                    │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## VERSIÓN B

Solo Acción Principal utiliza tarjeta.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      Sáb, 4 jul                               Inicio 07:32  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ PROGRESO DE LA JORNADA                                                                       │
│                                                                                              │
│ RECAUDACIÓN                                                                                  │
│ 1.245,00 €                                                                                   │
│                                                                                              │
│                                                    Objetivo 1.500 €   Restan 255,00 €       │
│                                                    ████████████████░░  83%                   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ ACCIÓN PRINCIPAL                                                                             │
│                                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Nuevo servicio                                                                             │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ REGISTRO OPERATIVO                                                                           │
│                                                                                              │
│ 07:28   Taxi    ·   🏙️   ·   💳   ·   12,50 €                                                │
│ 07:12   Taxi    ·   ✈️   ·   💶   ·   18,00 €                                                │
│ 06:54   Uber    ·   ⋯    ·   📱   ·    9,20 €                                                │
│ 06:31   Cabify  ·   ⭐    ·   💳   ·   14,80 €                                                │
│ 06:08   Bolt    ·   📅    ·   💶   ·   22,00 €                                                │
│ 05:44   Taxi    ·   🛣️   ·   💶   ·   10,50 €                                                │
│ 05:18   Uber    ·   🏥    ·   📲   ·   16,00 €                                                │
│ ...                                                                                            │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ NAVEGACIÓN INFERIOR                                                                          │
│                                                                                              │
│      Home          Historial          Estadísticas          Configuración                    │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## VERSIÓN C

Ningún bloque utiliza tarjeta.

La jerarquía se consigue únicamente mediante tipografía, tamaño, alineación y espaciado.

```text
────────────────────────────────────────────────────────────────────────────────────────────────
                                   Sáb, 4 jul                               Inicio 07:32
────────────────────────────────────────────────────────────────────────────────────────────────

PROGRESO DE LA JORNADA

RECAUDACIÓN
1.245,00 €

                                                  Objetivo 1.500 €   Restan 255,00 €
                                                  ████████████████░░  83%

ACCIÓN PRINCIPAL
Nuevo servicio

REGISTRO OPERATIVO
07:28   Taxi    ·   🏙️   ·   💳   ·   12,50 €
07:12   Taxi    ·   ✈️   ·   💶   ·   18,00 €
06:54   Uber    ·   ⋯    ·   📱   ·    9,20 €
06:31   Cabify  ·   ⭐    ·   💳   ·   14,80 €
06:08   Bolt    ·   📅    ·   💶   ·   22,00 €
05:44   Taxi    ·   🛣️   ·   💶   ·   10,50 €
05:18   Uber    ·   🏥    ·   📲   ·   16,00 €
...

NAVEGACIÓN INFERIOR
Home     Historial     Estadísticas     Configuración
```

---

## Comparación visual

Las tres versiones conservan:

- la misma arquitectura;
- el mismo contenido;
- las mismas proporciones;
- los mismos márgenes;
- los mismos textos;
- la misma navegación.

La diferencia visible entre propuestas es únicamente la presencia o ausencia de tarjetas.

---

## Progreso de la Jornada

En las tres versiones, el bloque de Progreso de la Jornada refleja las decisiones aprobadas:

- La recaudación domina visualmente.
- La etiqueta visible es `Recaudación`.
- `Objetivo` y `Restan` aparecen en la primera línea de la columna derecha.
- La barra y el porcentaje aparecen en la segunda línea.
- Al 100 %, el bloque muestra `Objetivo alcanzado`.
- El porcentaje puede superar el 100 %.
- La barra se detiene en el 100 %.

---

## Estado del documento

Documento de evaluación visual de la Home V2.
