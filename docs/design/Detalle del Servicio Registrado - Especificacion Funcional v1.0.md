# Detalle del Servicio Registrado - Especificacion Funcional v1.0

## 1. Estado y autoridad

Estado: Normative.

Este documento es la autoridad funcional para la futura pantalla `Detalle del servicio` de GeoTaxi.

DEBE guiar la implementacion posterior de la pantalla de consulta y correccion de servicios registrados.

NO DEBE usarse para modificar el flujo de servicios pendientes ni el Bottom Sheet `Completar servicio`.

## 2. Proposito

Definir las reglas funcionales verificables de la pantalla `Detalle del servicio`.

La pantalla DEBE permitir consultar un servicio registrado y, mediante una accion explicita `Corregir`, modificar solo los datos autorizados.

## 3. Alcance

Este documento aplica al flujo:

Historial operativo -> servicio registrado -> `Detalle del servicio`.

Incluye:

- responsabilidad de la pantalla;
- modos de consulta y correccion;
- campos visibles y editables;
- reglas economicas;
- reglas temporales;
- zonas manuales y GEO;
- dirty state;
- guardado;
- navegacion;
- eliminacion del registro completo;
- criterios de aceptacion.

## 4. Fuera de alcance

FUERA DE ALCANCE:

- implementar codigo;
- redisenar visualmente la pantalla;
- aplicar White Design;
- modificar SQLite;
- crear tabla `services`;
- crear arquitectura definitiva de notas y adjuntos;
- implementar comentarios, fotos o archivos;
- modificar el Bottom Sheet de pendientes;
- cambiar foco o teclado;
- resolver servicios que cruzan medianoche.

## 5. Terminologia

`Servicio registrado`: servicio con documentacion economica completada y `serviceStatus = completed`.

`Servicio pendiente`: servicio con `serviceStatus = incomplete`.

`Detalle del servicio`: pantalla de consulta de un servicio registrado, con capacidad de correccion controlada.

`Importe del servicio`: valor economico principal del servicio.

`Total cobrado`: cantidad total recibida o registrada como cobrada.

`Propina`: diferencia o valor adicional cuando corresponda.

`chargedAmount`: campo persistido actual que representa el importe cobrado por tarjeta cuando aplica.

`cashTip`: campo persistido actual que representa la propina en efectivo, no el total cobrado en efectivo.

`GEO automatico`: informacion de ubicacion obtenida por snapshots, coordenadas o geocodificacion automatica.

`Zona manual`: correccion introducida por el usuario para recogida o destino.

## 6. Flujo de entrada

Un servicio registrado DEBE abrir `Detalle del servicio` en modo consulta.

Un servicio pendiente NO DEBE abrir `Detalle del servicio`.

Un servicio pendiente DEBE continuar abriendo:

- `CompleteServiceFlowController`;
- `CompleteServiceBottomSheet`.

La decision de entrada DEBE basarse en `serviceStatus`, no en `amount === null`.

## 7. Responsabilidad de la pantalla

`Detalle del servicio` DEBE representar un registro completado que combina:

- datos economicos y administrativos del Service;
- contexto operativo corregible del Trip;
- enriquecimiento GEO de solo lectura.

La pantalla NO DEBE presentar Trip y Service como sinonimos aunque la persistencia fisica actual use principalmente la tabla `trips`.

La pantalla DEBE separar consulta de correccion.

## 8. Modo consulta

Modo consulta es el estado inicial.

En modo consulta:

- los campos DEBEN mostrarse como no editables;
- DEBE existir una accion explicita `Corregir`;
- DEBE existir navegacion atras;
- la zona destructiva DEBE estar visible o accesible, pero separada de las acciones normales;
- la futura seccion `Notas y adjuntos` PUEDE mostrarse como consulta cuando exista.

NO DEBE existir edicion accidental al tocar un valor en modo consulta.

## 9. Modo correccion

Modo correccion se activa solo mediante `Corregir`.

En modo correccion:

- solo los campos autorizados DEBEN pasar a edicion;
- DEBE mostrarse `Guardar correcciones`;
- DEBE permitirse cancelar;
- DEBE activarse dirty state;
- los errores DEBEN mostrarse por campo cuando corresponda;
- si falla la persistencia, los datos introducidos DEBEN conservarse.

## 10. Secciones funcionales

### 10.1. Cabecera de consulta

DEBE mostrar como minimo:

- estado `Registrado`;
- horario;
- importe;
- metodo de pago;
- plataforma o clasificacion.

### 10.2. Servicio

DEBE contemplar:

- importe;
- metodo de pago;
- importe cobrado cuando corresponda;
- total cobrado en efectivo cuando corresponda;
- propina calculada o registrada;
- plataforma o clasificacion;
- clasificacion personalizada, si existe.

### 10.3. Viaje

DEBE contemplar como correcciones permitidas:

- hora de inicio;
- hora de fin;
- zona manual de recogida;
- zona manual de destino.

### 10.4. Ubicacion detectada

DEBE mostrar como solo lectura:

- ubicacion GEO de inicio;
- ubicacion GEO de fin;
- procedencia automatica claramente diferenciada de la correccion manual.

### 10.5. Notas y adjuntos

DEBE reservarse conceptualmente una seccion `Notas y adjuntos`.

Esta seccion NO DEBE bloquear el guardado principal.

### 10.6. Zona destructiva

DEBE incluir la accion `Eliminar registro completo`.

DEBE estar separada de las acciones normales de consulta y correccion.

## 11. Inventario de campos

| Campo funcional | Concepto | Capa | Consulta | Correccion | Regla |
|---|---|---|---|---|---|
| Estado Registrado | `serviceStatus` | Service | visible | no editable | DEBE permanecer `completed` |
| Importe | `amount` | Service | visible | editable | obligatorio, finito, cero y negativo validos |
| Metodo de pago | `payment` | Service | visible | editable | normaliza campos incompatibles |
| Importe cobrado por tarjeta | `chargedAmount` | Service | visible si aplica | editable si tarjeta | representa cobro por tarjeta |
| Total cobrado en efectivo | valor de formulario | Service | visible si aplica | editable si efectivo | NO es sinonimo de `cashTip` |
| Propina | derivada o persistida | Service | visible si aplica | derivada o editable segun UI futura | no debe ocultar incoherencias |
| Plataforma/clasificacion | `source` | Service | visible | editable | debe preservar valores existentes |
| Clasificacion personalizada | `customSource` | Service | visible si existe | editable solo si UI lo soporta | no debe borrarse silenciosamente |
| Hora inicio | `startTime` | Trip | visible | editable | formato valido requerido |
| Hora fin | `endTime` | Trip | visible | editable | requerida y no anterior a inicio en MVP |
| Zona manual de recogida | `manualPickupZone` | Trip | visible si existe | editable/limpiable | correccion del usuario |
| Zona manual de destino | `manualDropoffZone` | Trip | visible si existe | editable/limpiable | correccion del usuario |
| GEO inicio | snapshot START | Enriquecimiento | visible | no editable | solo lectura |
| GEO fin | snapshot END | Enriquecimiento | visible | no editable | solo lectura |
| Identidad | `id` | Trip/Service persistido | puede usarse internamente | no editable | estable |
| Jornada | `workdayId` | relacion operativa | no editable | no editable | no se reasigna en esta pantalla |

## 12. Reglas economicas

El importe del servicio DEBE ser obligatorio.

Campo vacio NO DEBE equivaler a cero.

DEBEN ser validos:

- importes positivos;
- `0`;
- `0,00`;
- importes negativos como `-33` o `-33,00`.

El importe DEBE ser un numero finito.

Si el importe es invalido, `Guardar correcciones` NO DEBE persistir y DEBE mostrar error visible junto al campo.

Pulsar Guardar con error NO DEBE producir silencio.

## 13. Semantica de cobro y propina

La interfaz y el modelo de formulario DEBEN distinguir:

- importe del servicio;
- total cobrado;
- importe cobrado por tarjeta;
- propina;
- campos persistidos actuales.

Para efectivo:

- la interfaz PUEDE mostrar `Total cobrado en efectivo`;
- ese valor NO DEBE tratarse como sinonimo conceptual de `cashTip`;
- la transformacion funcional DEBE ser: importe del servicio -> total recibido -> propina resultante;
- `cashTip` representa la propina persistida actual cuando aplica.

Para tarjeta:

- `chargedAmount` representa el importe cobrado por tarjeta;
- si existe diferencia entre `chargedAmount` e importe, la UI DEBE hacer comprensible si esa diferencia se interpreta como cobro adicional o propina segun el contrato de aplicacion.

Para pago por aplicacion:

- los importes auxiliares no aplicables DEBEN quedar vacios o normalizados segun el contrato de aplicacion;
- NO DEBEN conservarse silenciosamente valores incompatibles de un metodo anterior.

Al cambiar metodo de pago:

- los campos incompatibles DEBEN limpiarse o recalcularse de forma explicita;
- la interfaz DEBE hacer visible el cambio;
- NO DEBE producirse perdida silenciosa de datos.

No se fija en este documento una migracion de persistencia ni renombre de columnas SQLite.

## 14. Reglas temporales

Hora de inicio DEBE ser requerida.

Hora de fin DEBE ser requerida para un servicio registrado.

Ambas horas DEBEN tener formato valido.

En el MVP, hora de fin NO DEBE ser anterior a hora de inicio.

El sistema NO DEBE inferir automaticamente que el servicio termino al dia siguiente.

Servicios que cruzan medianoche quedan FUERA DE ALCANCE y DEBEN resolverse en un bloque funcional posterior.

## 15. Zonas manuales y GEO

GEO automatico DEBE ser solo lectura.

NO DEBEN editarse:

- coordenadas;
- snapshots;
- geocodificacion automatica cruda;
- datos tecnicos de ubicacion.

Las zonas manuales DEBEN tratarse como correcciones del usuario.

Las zonas manuales DEBEN poder modificarse.

Las zonas manuales DEBEN poder limpiarse para volver a mostrar y utilizar el GEO automatico como referencia visual.

La pantalla DEBE diferenciar claramente una zona manual de una ubicacion detectada automaticamente.

## 16. Dirty state

La pantalla DEBE detectar cambios reales.

La comparacion DEBE ser semantica cuando corresponda, no solo textual.

Ejemplos:

- `0`, `0,00` y `0.00` PUEDEN representar el mismo importe;
- espacios sin significado NO DEBEN activar cambios;
- un cambio de metodo de pago que normaliza campos auxiliares SI DEBE considerarse cambio si altera el modelo final.

Guardar sin cambios NO DEBE ejecutar persistencia.

Cancelar sin cambios DEBE volver a modo consulta.

Cancelar o salir con cambios DEBE pedir confirmacion.

La regla DEBE aplicarse a:

- boton atras de cabecera;
- boton fisico atras de Android;
- gestos de navegacion;
- acciones de cancelar.

Confirmacion recomendada:

Titulo: `Descartar las correcciones realizadas?`

Acciones:

- `Seguir corrigiendo`;
- `Descartar cambios`.

NO DEBE perderse informacion silenciosamente.

## 17. Guardado

`Guardar correcciones` DEBE validar el formulario completo antes de persistir.

El guardado DEBE mantener una transaccion coherente para los datos que se actualizan juntos.

Despues de guardar correctamente:

- DEBE volver a la pantalla de origen;
- la pantalla de origen DEBE refrescar sus datos;
- historial, resumen y totales DEBEN reflejar la correccion.

La implementacion NO DEBE sobrescribir datos no incluidos en el formulario.

La implementacion NO DEBE convertir `null`, `undefined`, cadena vacia o campo omitido en cero.

La implementacion DEBE preservar `serviceStatus = completed`.

## 18. Errores

Los errores de validacion DEBEN mostrarse junto al campo correspondiente cuando exista campo.

Un error de persistencia DEBE:

- mantener la pantalla abierta;
- conservar los valores del formulario;
- mostrar feedback comprensible;
- permitir reintentar;
- evitar navegacion atras falsa.

Los errores de enriquecimiento futuro NO DEBEN bloquear la correccion principal del servicio.

## 19. Navegacion

Entrar desde un servicio registrado DEBE abrir modo consulta.

Guardar correctamente DEBE volver al origen.

Cancelar en modo correccion sin cambios DEBE volver a consulta.

Cancelar o salir con cambios DEBE pedir confirmacion.

La pantalla NO DEBE modificar el comportamiento aprobado de servicios pendientes.

## 20. Eliminacion del registro completo

La accion destructiva DEBE llamarse `Eliminar registro completo`.

La confirmacion DEBE explicar que actualmente elimina:

- el servicio registrado;
- el viaje operativo asociado;
- los enriquecimientos dependientes asociados.

La eliminacion DEBE exigir confirmacion destructiva explicita.

La eliminacion NO DEBE dejar snapshots GEO huerfanos.

Despues de eliminar correctamente:

- DEBE volver a la pantalla de origen;
- la pantalla de origen DEBE refrescar historial, resumen y totales.

## 21. Notas y adjuntos como capacidad futura

La pantalla DEBE reservar conceptualmente una seccion `Notas y adjuntos`.

Esta capacidad futura:

- DEBE ser transversal;
- DEBE poder reutilizarse para servicios, gastos y otros movimientos;
- NO DEBE modelarse con campos `photo1`, `photo2` o `fileUri` dentro de `Trip`;
- NO DEBE bloquear el guardado principal;
- NO DEBE pertenecer al Bottom Sheet de completar pendiente.

El esquema fisico definitivo de notas y adjuntos queda FUERA DE ALCANCE.

## 22. Invariantes

DEBEN cumplirse siempre:

- un pendiente nunca abre `Detalle del servicio`;
- un registrado abre `Detalle del servicio` en modo consulta;
- `serviceStatus` permanece `completed`;
- `serviceStatus` no es editable;
- el importe requerido distingue vacio de cero;
- cero y negativos siguen siendo validos;
- `customSource` no se pierde silenciosamente;
- datos incompatibles de metodo de pago no quedan ocultos;
- GEO automatico no se edita;
- zonas manuales son correcciones limpiables;
- guardar sin cambios no persiste;
- salir con cambios no descarta sin confirmacion;
- el borrado no deja enriquecimientos huerfanos;
- no se requiere tabla `services` para implementar el MVP.

## 23. Casos limite

La implementacion posterior DEBE cubrir:

- importe vacio;
- importe `0`;
- importe `0,00`;
- importe negativo;
- cambio de efectivo a tarjeta;
- cambio de tarjeta a efectivo;
- cambio desde efectivo o tarjeta a aplicacion;
- servicio con `customSource`;
- zona manual existente;
- limpieza de zona manual;
- snapshots GEO ausentes;
- error de persistencia al guardar;
- error de persistencia al eliminar;
- intento de salida con cambios;
- guardar sin cambios;
- servicio pendiente tocado desde historial.

## 24. Criterios de aceptacion

1. Un pendiente nunca abre `Detalle del servicio`.
2. Un registrado abre `Detalle del servicio` en modo consulta.
3. `Corregir` activa unicamente los campos permitidos.
4. Importe positivo, cero y negativo son validos.
5. Importe vacio produce error visible.
6. `customSource` se conserva.
7. Cambiar metodo de pago no deja datos incompatibles ocultos.
8. El total cobrado en efectivo no se confunde conceptualmente con `cashTip`.
9. Guardar sin cambios no persiste.
10. Salir con cambios pide confirmacion.
11. Un error de guardado mantiene datos y pantalla.
12. El estado permanece `completed`.
13. GEO automatico es solo lectura.
14. Zonas manuales se pueden limpiar.
15. Guardar refresca origen, historial, resumen y totales.
16. `Eliminar registro completo` requiere confirmacion.
17. El borrado no deja enriquecimientos huerfanos.
18. Notas y adjuntos no bloquean la correccion principal.
19. No se modifica el Bottom Sheet de pendientes.
20. No se requiere tabla `services`.

## 25. Deuda aplazada

Queda aplazado:

- modelo funcional de servicios que cruzan medianoche;
- arquitectura transversal de notas y adjuntos;
- posible separacion futura de casos de uso Service y Trip;
- auditoria de cambios;
- esquema fisico definitivo para enriquecimientos adjuntos;
- rediseno visual definitivo.

## 26. Relacion con otros documentos

Este documento se apoya en:

- `docs/architecture/GeoTaxi Operational Event Model v1.0.md`;
- `docs/design/Operational Lists Standard v1.0.md`;
- `docs/domain/Trip Domain v2.md`;
- `docs/persistence/Persistent Model v1.0.md`;
- `docs/architecture/Application Layer v1.0.md`;
- `docs/design/GeoTaxi UI Guidelines v1.0.md`;
- `docs/architecture/Prioridad Operativa y Enriquecimiento de Datos v1.0.md`;
- `docs/architecture/Critical vs Enrichment Domain Data Review v1.0.md`;
- `docs/architecture/Documentation Lifecycle v1.0.md`.

Si existe contradiccion entre este documento y documentos historicos o mockups antiguos, este documento DEBE prevalecer para la pantalla `Detalle del servicio`.

Este documento NO reemplaza la especificacion aprobada del Bottom Sheet `Completar servicio`.
