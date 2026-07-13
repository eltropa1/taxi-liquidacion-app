# Detalle del Servicio Registrado - White Design v1.0

## 1. Estado

Estado: Approved.

Este documento define el White Design visual y funcional aprobado para la pantalla `Detalle del servicio`.

No modifica la especificacion funcional normativa ni reabre decisiones ya certificadas en Android.

## 2. Contexto

`Detalle del servicio` ya permite consultar y corregir un servicio registrado, gestionar notas y adjuntos, eliminar el registro completo y preservar la separacion entre servicio pendiente y registrado.

La pantalla actual es correcta funcionalmente, pero visualmente conserva forma de formulario vertical. El importe, que debe dominar la lectura, aparece como una fila mas dentro de una seccion. Las acciones usan botones nativos extensos, notas y adjuntos ocupan demasiado peso relativo y el modo correccion obliga a recorrer pantalla para guardar o cancelar.

## 3. Objetivo

Convertir `Detalle del servicio` en una superficie profesional de consulta y correccion:

- comprensible en menos de un segundo;
- densa sin parecer comprimida;
- clara para jornadas largas;
- consistente con Home V2, Operational Lists y Visual Domain;
- preparada para Android con teclado sin reintroducir hacks de foco.

## 4. Principios

1. La economia domina.
2. La consulta no parece un formulario deshabilitado.
3. La correccion es un modo explicito y reversible.
4. GEO automatico es referencia, no entrada editable.
5. Notas y adjuntos son enriquecimiento, no flujo principal.
6. La accion destructiva queda al final y separada.
7. Cada bloque responde una pregunta.
8. Cada estado debe poder entenderse sin depender solo del color.

## 5. Problemas actuales

| Severidad | Problema | Evidencia |
|---|---|---|
| Critico | El importe no domina visualmente. | En consulta aparece como fila `Importe / 12,50 EUR`, con el mismo peso que metodo y clasificacion. |
| Importante | La pantalla parece un formulario de lectura. | `Servicio`, `Viaje` y `Ubicacion detectada` usan tarjetas y filas simetricas repetidas. |
| Importante | Las acciones de correccion no son persistentes. | `Guardar correcciones` y `Cancelar` quedan en el flujo vertical y pueden alejarse del campo activo. |
| Importante | Adjuntos ocupan demasiado espacio basal. | Tres botones permanentes compiten con economia y viaje aun cuando no se va a adjuntar nada. |
| Importante | Chips muestran codigos internos en correccion. | `CASH`, `CARD`, `APP`, `TAXI`, `UBER` aparecen como valores tecnicos. |
| Menor | `Registrado` tiene presencia de chip demasiado alta para un estado normal. | Se ubica antes del titulo y compite con la cabecera. |
| Menor | GEO ausente usa guion simple. | No comunica si no existe dato o si no se ha detectado. |
| Aceptable MVP | Botones nativos certificados funcionan. | Se mantienen hasta implementar componentes visuales propios. |

## 6. Jerarquia de informacion

La pantalla DEBE comunicar tres niveles:

1. Resultado economico: importe, pago, plataforma, cobro y propina.
2. Contexto del viaje: horario, zonas manuales y referencia GEO.
3. Enriquecimiento y gestion: nota, adjuntos y acciones destructivas.

La jerarquia visual DEBE ser:

```text
Cabecera compacta
Resumen economico dominante
Servicio / Viaje corregibles
Ubicacion detectada secundaria
Notas y adjuntos compactos
Zona destructiva separada
```

## 7. Estructura general

La pantalla DEBE usar un fondo neutro claro y superficies blancas controladas. No DEBE apilar tarjetas identicas para todos los bloques. El resumen economico PUEDE ser una superficie principal; las secciones siguientes DEBEN ser bandas o grupos con divisores ligeros.

Wireframe de consulta:

```text
[ < ] Detalle del servicio                         [Corregir]
      Registrado - 18:10 - 18:10

12,50 EUR
Efectivo - Taxi
Total cobrado: sin registrar        Propina: sin registrar

SERVICIO
Pago                         Efectivo
Clasificacion                Taxi

VIAJE
18:10 -> 18:10
Recogida manual              Sin corregir
Destino manual               Sin corregir

UBICACION DETECTADA
Inicio                       Sin GEO
Fin                          Sin GEO

NOTAS Y ADJUNTOS                                      0/5
Sin nota
Sin adjuntos                                      [Anadir]

ZONA DESTRUCTIVA
Eliminar registro completo
```

## 8. Cabecera

La cabecera DEBE ser compacta.

Elementos:

- navegacion atras con icono o texto corto;
- titulo `Detalle del servicio`;
- estado `Registrado` como chip discreto o texto secundario;
- horario breve;
- accion `Corregir` en modo consulta.

`Registrado` NO DEBE ocupar el primer golpe visual. Es el estado normal del registro.

En modo correccion, la cabecera DEBE indicar `Corrigiendo servicio` o mostrar un indicador claro de modo. La accion principal no DEBE competir con la cabecera si existe barra inferior persistente.

La cabecera NO DEBE ser sticky en MVP salvo que la implementacion demuestre que no interfiere con teclado y scroll. La barra de acciones de correccion si DEBE mantenerse accesible.

## 9. Resumen economico

El resumen economico DEBE ser el bloque principal.

Debe mostrar:

- importe como texto dominante;
- metodo de pago;
- plataforma o clasificacion;
- cobro auxiliar cuando aplique;
- propina cuando aplique.

Reglas:

- el importe nunca se trunca;
- cero y negativos se muestran como valores validos;
- el signo negativo DEBE ser textual y no solo cromatico;
- customSource largo DEBE envolver o truncar con elipsis controlada sin tapar el importe;
- pago y plataforma usan identidad del Visual Domain cuando exista.

Wireframe:

```text
12,50 EUR
[icono efectivo] Efectivo        [chip Taxi]
Total cobrado: sin registrar     Propina: sin registrar
```

Para tarjeta:

```text
44,00 EUR
[icono tarjeta] Tarjeta          [chip Taxi]
Cobrado por tarjeta: 45,00 EUR
```

Para aplicacion:

```text
44,00 EUR
[icono app] Aplicacion           [chip Taxi]
Sin cobros auxiliares
```

## 10. Servicio

En consulta, `Servicio` DEBE mostrar datos utiles sin aspecto de input:

1. metodo de pago;
2. cobro auxiliar aplicable;
3. propina;
4. clasificacion;
5. clasificacion personalizada si existe.

En correccion:

- `Importe` aparece como primer campo;
- metodo de pago usa control segmentado con etiquetas de producto: `Efectivo`, `Tarjeta`, `Aplicacion`;
- plataforma usa chips del Visual Domain con etiquetas legibles;
- campos condicionales aparecen bajo el metodo correspondiente.

La relacion efectivo DEBE verse asi:

```text
Importe del servicio       [12,50]
Total cobrado en efectivo  [15,00]
Propina resultante          2,50 EUR
```

La propina resultante PUEDE ser lectura calculada si ya existe en la proyeccion visual. Si no existe, queda como requisito de Presentation antes de implementar.

## 11. Viaje

En consulta, `Viaje` DEBE priorizar lectura rapida:

```text
18:10 -> 18:10
Recogida   Sin correccion manual
Destino    Sin correccion manual
```

Si existe zona manual:

```text
Recogida   Abrantes        Manual
Destino    Acacias         Manual
```

En correccion:

- hora inicio y fin PUEDEN ir en una fila de dos columnas en pantallas medianas;
- en pantallas pequenas DEBEN apilarse;
- zonas manuales usan selector con valor visible y accion secundaria `Limpiar`;
- `Limpiar` DEBE estar cerca del valor pero no competir con `Cambiar`.

No se debe inventar duracion si no existe proyeccion fiable.

## 12. GEO

`Ubicacion detectada` DEBE ser secundaria, compacta y de solo lectura.

Tratamiento:

- titulo: `Ubicacion detectada`;
- subtitulo discreto: `Automatica - solo lectura`;
- inicio y fin diferenciados;
- fallback: `Sin ubicacion detectada`, no solo `-`;
- iconografia discreta de ubicacion automatica.

La seccion PUEDE ser colapsable despues de MVP si el contenido ocupa demasiado. En MVP debe permanecer visible cuando exista GEO y compacta cuando no exista.

## 13. Notas

La nota DEBE ser facil de leer sin dominar.

Estados:

- sin nota: texto secundario `Sin nota` y accion `Anadir nota`;
- con nota: bloque de texto con maximo inicial de lineas y accion `Editar`;
- editando: campo multilinea, `Guardar nota`, `Cancelar`;
- error: mensaje junto a la nota, no global.

La UI DEBE dejar claro que `Guardar nota` es independiente de `Guardar correcciones`.

Para nota larga:

- consulta muestra hasta 3 o 4 lineas y accion `Ver completa` si se implementa expansion;
- edicion permite crecer con scroll interno limitado o crecimiento hasta altura maxima.

## 14. Adjuntos

La seccion DEBE ser compacta.

No deben existir tres botones permanentes (`Tomar foto`, `Galeria`, `Adjuntar PDF`) en estado normal.

Decision aprobada:

- una accion principal de seccion: `Anadir`;
- al pulsar, selector compacto o action sheet con:
  - `Tomar foto`;
  - `Elegir imagen`;
  - `Adjuntar PDF`.

Cada adjunto se muestra como fila compacta:

```text
[icono] recibo.pdf
PDF - 128 KB - Disponible                  [menu]
```

Acciones del menu:

- abrir;
- compartir;
- eliminar.

No se usan miniaturas grandes en MVP. Los adjuntos se presentan como filas compactas con icono, nombre, metadata, estado y menu de acciones. Puede existir una miniatura pequena solo si aporta reconocimiento sin romper densidad, pero no una galeria visual.

## 15. Estados de adjuntos

| Estado | Texto | Icono | Acciones |
|---|---|---|---|
| `pending` | `Importando...` | progreso | ninguna o cancelar si existe contrato futuro |
| `ready` | `Disponible` | tipo de archivo | abrir, compartir, eliminar |
| `failed` | `No se pudo anadir` | alerta | eliminar; reintentar solo si existe fuente valida |
| `missing` | `Archivo no disponible` | alerta | eliminar referencia |
| `deleting` | `Eliminando...` | progreso | sin acciones |

Los estados NO DEBEN depender solo del color.

## 16. Modo consulta

Consulta DEBE sentirse como detalle, no como formulario deshabilitado.

Reglas:

- los valores no son inputs;
- no hay bordes de campo;
- se usan textos, chips, iconos y filas compactas;
- `Corregir` es la accion principal visible;
- notas y adjuntos permanecen disponibles como operaciones independientes;
- zona destructiva aparece solo al final.

## 17. Modo correccion

Modo correccion DEBE tener una marca visual clara:

- cabecera con `Corrigiendo servicio`;
- resumen economico sigue visible en forma compacta;
- solo campos autorizados son editables;
- GEO sigue en lectura;
- notas y adjuntos no entran en dirty state de correcciones.

Los campos editables DEBEN usar controles profesionales:

- inputs con alto minimo tactil;
- controles segmentados para pago;
- chips del Visual Domain para plataforma;
- selectores de zona con accion `Cambiar`;
- accion secundaria `Limpiar`.

## 18. Acciones persistentes

En modo correccion DEBE existir una barra inferior persistente:

```text
[Cancelar]                         [Guardar correcciones]
```

Requisitos:

- respeta safe area;
- no tapa el campo activo;
- con teclado abierto se mantiene por encima si Android `adjustResize` lo permite;
- no usa `keyboardDidShow`, `keyboardDidHide`, `setTimeout`, refocus ni estado manual de altura;
- el contenido tiene padding final suficiente para que el ultimo campo no quede oculto.

Si la barra persistente demostrara conflicto con Android, alternativa aprobable: bloque de acciones no sticky pero duplicado visualmente en cabecera no permitido. Debe existir una unica accion principal.

## 19. Errores

Errores de campo:

- se muestran bajo el campo;
- usan icono o marcador textual;
- no dependen solo del rojo;
- reservan espacio minimo o animacion estable para evitar saltos grandes.

Errores globales:

- error de guardado;
- error de carga de enriquecimientos;
- sharing no disponible;
- permiso denegado;
- archivo ausente.

Textos recomendados:

- Importe vacio: `Introduce un importe. Cero y negativos son validos.`
- Hora fin anterior: `La hora de fin no puede ser anterior a la de inicio.`
- Archivo grande: `El archivo supera 10 MB.`
- Tipo no permitido: `Usa JPEG, PNG, WebP o PDF.`
- Permiso denegado: `Permiso denegado. Puedes cambiarlo en ajustes de Android.`

## 20. Confirmaciones

### Descartar correcciones

Titulo: `Descartar correcciones?`

Texto: `Se perderan los cambios del servicio que no hayas guardado.`

Acciones:

- `Seguir corrigiendo`;
- `Descartar cambios`.

### Nota sin guardar

Titulo: `Descartar nota?`

Texto: `La nota escrita no se guardara.`

Acciones:

- `Seguir editando`;
- `Descartar nota`.

Si coinciden nota sucia y correcciones sucias, DEBE mostrarse una unica confirmacion:

Titulo: `Descartar cambios sin guardar?`

Texto: `Se perderan las correcciones del servicio y la nota no guardada.`

### Eliminar adjunto

Titulo: `Eliminar adjunto?`

Texto: `Se quitara de este servicio.`

### Eliminar registro completo

Titulo: `Eliminar registro completo?`

Texto: `Se eliminara el servicio registrado, el viaje operativo asociado y sus enriquecimientos dependientes. Esta accion no se puede deshacer.`

Acciones:

- `Cancelar`;
- `Eliminar registro completo`.

## 21. Zona destructiva

La zona destructiva DEBE ir al final.

Presentacion:

```text
Zona destructiva
Eliminar registro completo
Elimina el servicio, el viaje operativo asociado y sus enriquecimientos.
[Eliminar registro completo]
```

Debe usar color semantico destructivo, icono de alerta o papelera, y separacion vertical suficiente respecto a notas/adjuntos.

No debe competir con `Guardar correcciones`.

## 22. Teclado y scroll

La implementacion DEBE mantener Android `adjustResize` como responsable principal.

Permitido:

- `KeyboardAvoidingView` solo con comportamiento especifico iOS;
- `ScrollView` con `keyboardShouldPersistTaps`;
- padding final estable;
- barra inferior que respete insets.

Prohibido:

- listeners redundantes de teclado;
- estado manual de altura;
- `setTimeout` para foco;
- refocus automatico;
- `Keyboard.dismiss()` como parche.

Con teclado abierto:

- campo activo visible;
- error del campo visible o alcanzable con scroll inmediato;
- `Guardar correcciones` accesible;
- nota larga no debe tapar acciones.

## 23. Accesibilidad

Requisitos:

- targets tactiles minimos de 44 px;
- contraste suficiente en texto y chips;
- estados con texto e icono, no solo color;
- nombres largos truncados con elipsis;
- importe nunca truncado;
- botones destructivos claramente nombrados;
- lenguaje sin codigos internos (`CASH`, `CARD`, `APP`) en UI final.

## 24. Tokens y Visual Domain

Reutilizar:

- identidades de plataforma del Visual Domain;
- identidades de metodo de pago si existen;
- colores semanticos destructivos existentes;
- baseline de Home V2 para calma, densidad y neutralidad.

Tokens faltantes o a formalizar:

- `surface.primary`;
- `surface.subtle`;
- `text.primary`;
- `text.secondary`;
- `text.muted`;
- `border.subtle`;
- `action.primary`;
- `action.secondary`;
- `danger.surface`;
- `danger.text`;
- `warning.surface`;
- `radius.section = 8`;
- `spacing.screen.horizontal`;
- `spacing.section.gap`;
- `font.amount`;
- `font.sectionTitle`;

No se debe crear un cambio global del Design System en este bloque. Si los tokens no existen, la implementacion debe centralizarlos localmente o en el Visual Domain conforme a la arquitectura vigente.

## 25. Componentizacion

La implementacion posterior NO DEBE seguir aumentando `app/trip/edit.tsx` como pantalla monolitica.

Estructura propuesta:

| Componente | Responsabilidad | Estado |
|---|---|---|
| `RegisteredServiceDetailScreen` | carga, modo, navegacion, composicion | estado de pantalla |
| `RegisteredServiceHeader` | titulo, estado, horario, acciones de modo | visual |
| `ServiceEconomicSummary` | importe, pago, plataforma, cobro, propina | visual |
| `ServiceCorrectionSection` | campos economicos editables | controlado por form |
| `TripCorrectionSection` | horas y zonas manuales | controlado por form |
| `DetectedLocationSection` | GEO solo lectura | visual |
| `RecordNoteSection` | nota y dirty propio | estado local |
| `RecordAttachmentsSection` | listado y acciones de adjuntos | estado local |
| `CorrectionActionBar` | cancelar y guardar | visual con callbacks |
| `DestructiveRecordSection` | eliminar registro completo | visual con callback |

Presentation debe preparar:

- resumen economico;
- etiquetas visuales de pago/plataforma;
- rows de viaje;
- rows GEO;
- estados de adjuntos.

Visual Domain debe resolver:

- identidad de plataforma;
- identidad de pago;
- iconografia semantica cuando se formalice.

## 26. Casos limite

La pantalla DEBE mantenerse correcta con:

- importe `0`;
- importe negativo;
- importe grande;
- customSource largo;
- efectivo sin total cobrado;
- efectivo con propina;
- tarjeta con chargedAmount;
- aplicacion sin auxiliares;
- sin GEO;
- con GEO inicio y fin;
- con zonas manuales;
- zonas manuales limpiadas;
- sin nota;
- nota larga;
- cinco adjuntos;
- adjuntos con nombres largos;
- estados `failed`, `missing`, `pending`, `deleting`;
- teclado abierto;
- pantalla pequena.

## 27. Criterios de aceptacion visual

1. El importe se reconoce en menos de un segundo.
2. Pago y plataforma se identifican sin leer toda la pantalla.
3. Consulta no parece un formulario deshabilitado.
4. Correccion se distingue claramente de consulta.
5. Guardar y Cancelar permanecen accesibles.
6. GEO no parece editable.
7. Zona manual se distingue de GEO.
8. Nota no se confunde con `Guardar correcciones`.
9. Adjuntos no desplazan la economia fuera de contexto.
10. Cinco adjuntos siguen siendo manejables.
11. Estados no dependen solo del color.
12. Error de campo aparece junto al campo.
13. Teclado no oculta la accion principal.
14. Zona destructiva no compite con el flujo normal.
15. Targets tactiles son adecuados.
16. Nombres largos no rompen layout.
17. Cero y negativos se muestran correctamente.
18. Pantalla funciona con customSource largo.
19. Pantalla funciona sin GEO.
20. Pantalla funciona sin nota ni adjuntos.
21. Pantalla funciona con nota larga y cinco adjuntos.
22. No cambia ninguna regla funcional certificada.

## 28. Plan de implementacion

1. Extraer componentes visuales sin cambiar contratos.
2. Crear proyeccion visual de resumen economico.
3. Sustituir cabecera y resumen superior.
4. Convertir consulta en detalle no editable.
5. Redisenar modo correccion con barra inferior persistente.
6. Compactar notas y adjuntos con accion unica `Anadir`.
7. Redisenar estados y errores.
8. Redisenar zona destructiva.
9. Validar Android con teclado, cinco adjuntos, nota larga y errores.
10. Ejecutar suite completa.

## 29. Fuera de alcance

FUERA DE ALCANCE:

- cambiar reglas funcionales;
- cambiar persistencia;
- cambiar contratos de Application;
- cambiar navegacion certificada;
- cambiar Bottom Sheet;
- instalar dependencias;
- implementar visor propio;
- cambiar arquitectura de notas y adjuntos;
- redisenar Home o Summary;
- resolver cruce de medianoche.

## 30. Relacion con otros documentos

Este documento depende de:

- `docs/design/Detalle del Servicio Registrado - Especificacion Funcional v1.0.md`;
- `docs/architecture/Record Notes and Attachments Architecture Proposal v1.0.md`;
- `docs/architecture/Record Notes and Attachments UI Integration Notes v1.0.md`;
- `docs/design/GeoTaxi UI Guidelines v1.0.md`;
- `docs/design/Operational Lists Standard v1.0.md`;
- `src/domain/visual/VisualCatalog.ts`.

Si este documento contradice la especificacion funcional normativa, prevalece la especificacion funcional.

Si este documento contradice la arquitectura aprobada de notas y adjuntos, prevalece la arquitectura aprobada.
