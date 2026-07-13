# GeoTaxi Operational Event Model v1.0

## 0. Propósito

Este documento define el modelo operativo oficial de GeoTaxi para interpretar los hechos del mundo real y su posterior transformación en información administrativa.

Su objetivo es fijar una referencia estable para futuras capacidades del producto, especialmente aquellas que dependan de la correcta distinción entre el instante real de un hecho y el momento en que ese hecho queda completamente documentado.

Este documento no describe pantallas.

No describe UX.

No describe wireframes.

No describe implementación técnica.

Su alcance es exclusivamente arquitectónico y semántico.

---

## 1. Principio rector

> GeoTaxi distingue entre el momento en que ocurre un hecho del mundo real y el momento en que ese hecho queda completamente documentado.

La documentación administrativa nunca modifica el instante en que ocurrió el hecho real.

Esta distinción es estructural.

No es una convención visual.

No es una preferencia de entrada de datos.

No es una decisión de interfaz.

Es la base sobre la que GeoTaxi interpreta su realidad operativa.

---

## 2. Filosofía

GeoTaxi no es una aplicación para introducir datos.

GeoTaxi es una aplicación que registra hechos operativos reales y posteriormente enriquece esos hechos con información administrativa.

Esta diferencia es esencial porque el trabajo de un taxista profesional no sucede como una secuencia de formularios, sino como una secuencia de eventos reales que ocurren bajo presión, en movimiento y con continuidad operativa.

El conductor no espera a terminar de documentar para que el hecho exista.

Primero ocurre el hecho.

Después se completa su documentación.

Este modelo representa mejor la realidad del trabajo porque:

- preserva la verdad temporal del evento;
- evita que una tarea administrativa distorsione el hecho real;
- respeta el ritmo operativo del conductor;
- permite registrar la actividad aunque la información complementaria llegue más tarde;
- separa claramente la realidad operativa de la completitud administrativa.

En GeoTaxi, el sistema no obliga al taxista a reescribir la realidad para adaptarla al producto.

La aplicación se adapta al trabajo real.

---

## 3. Modelo de eventos

GeoTaxi registra eventos.

Un evento es un hecho operativo que ocurre en un instante único, concreto e irreversible.

Ejemplos de eventos:

- inicio de viaje;
- fin de viaje;
- fin de jornada.

Cada uno de estos eventos existe en el momento exacto en que sucede en el mundo real.

Ese instante debe registrarse cuando ocurre.

Nunca cuando el usuario termina de rellenar un formulario.

Nunca cuando termina la documentación asociada.

Nunca cuando la información administrativa queda completa.

La documentación posterior puede añadir contexto, completar atributos o cerrar la información administrativa del evento, pero no puede redefinir su momento real.

### 3.1. Propiedades de un evento

Todo evento operativo en GeoTaxi comparte las siguientes propiedades:

- ocurre una sola vez;
- tiene un instante real;
- ese instante no puede alterarse después;
- puede requerir enriquecimiento posterior;
- puede depender de información adicional para quedar administrativamente completo;
- conserva su validez aunque parte de su documentación se complete más tarde.

### 3.2. Consecuencia arquitectónica

La arquitectura de GeoTaxi debe permitir que el sistema capture primero el hecho y resuelva después su documentación.

Eso significa que la validez operativa no puede depender de que toda la información administrativa esté disponible en el mismo instante.

La exactitud temporal del hecho es prioritaria sobre la completitud inmediata del expediente.

### 3.3. Estados

Los eventos producen transiciones de estado.

El evento ocurre una única vez.

El estado describe la situación actual del objeto de negocio en un momento dado.

Por tanto, el evento pertenece a la historia.

El estado pertenece al presente operativo del registro.

Ejemplos conceptuales:

- Viaje: Iniciado, Finalizado;
- Servicio: Pendiente de completar, Completo;
- Jornada: Activa, Finalizada, Conciliada.

Los estados no sustituyen al evento.

Lo resumen desde la perspectiva de su situación actual.

Un evento puede producir un cambio de estado y, a la vez, dejar abierto un proceso de documentación posterior.

Eso permite representar correctamente que algo ya ocurrió, aunque su expediente todavía no esté completo.

---

## 4. Diferenciación entre Viaje y Servicio

La investigación de producto mostró que GeoTaxi debe distinguir con precisión entre Viaje y Servicio.

No son sinónimos.

No representan la misma capa de información.

No tienen la misma función semántica.

### 4.1. Viaje

El Viaje representa la realidad operativa del desplazamiento.

Está compuesto por información como:

- horas;
- duración;
- GPS;
- información geográfica;
- inicio y final reales del desplazamiento.

El Viaje describe lo que ocurrió en la actividad física del taxi.

Es un hecho operativo.

### 4.2. Servicio

El Servicio representa el registro económico y administrativo de una prestación realizada.

El hecho ocurre en el mundo real.

GeoTaxi registra administrativamente ese hecho como Servicio.

Incluye, cuando corresponda, la documentación de:

- el viaje;
- la plataforma;
- la forma de pago;
- el importe;
- el importe cobrado;
- la propina, cuando exista.

Regla económica:

- un importe introducido explícitamente puede ser positivo, cero o negativo;
- `0` y `0,00` son importes válidos cuando el taxista los introduce;
- importes negativos como `-33` o `-33,00` son válidos para reflejar movimientos correctores;
- un campo de importe vacío no equivale a cero;
- el registro económico debe distinguir entre ausencia de importe e importe numérico explícito.

El Servicio describe cómo queda documentado económicamente un hecho operativo.

Es una construcción administrativa sobre uno o varios hechos operativos relacionados.

### 4.3. Separación semántica

Un viaje puede existir antes de que el servicio esté completamente documentado.

Esto ocurre cuando el hecho operativo ya ha sucedido, pero aún falta completar información administrativa asociada.

Por tanto:

- el viaje puede estar finalizado;
- el servicio puede seguir incompleto;
- la documentación del servicio puede completarse después sin alterar el instante real del viaje.

### 4.4. Servicio sin viaje

GeoTaxi también debe admitir que exista un Servicio sin Viaje.

Esto cubre escenarios de negocio en los que hay un resultado económico documentable aunque no exista un desplazamiento operativo tradicional, como cancelaciones remuneradas u otros supuestos equivalentes.

En estos casos, el Servicio sigue siendo válido aunque no haya Viaje asociado.

### 4.5. Implicación arquitectónica

La relación entre Viaje y Servicio no es de equivalencia.

Es una relación de documentación y contexto.

El Viaje narra la realidad operativa.

El Servicio narra la realidad administrativa y económica que se construye a partir de esa operativa, o en ocasiones sin ella.

---

## 5. Diferenciación entre Fin de Jornada y Conciliación

La misma separación conceptual aplica a la jornada.

GeoTaxi debe distinguir entre:

- Fin de jornada;
- Conciliación administrativa.

### 5.1. Fin de jornada

El Fin de jornada es el momento real en que el conductor decide dejar de prestar servicio.

Ese momento pertenece a la realidad operativa.

Es un hecho temporal único.

No depende de completar después la documentación administrativa.

### 5.2. Conciliación administrativa

La Conciliación administrativa es el proceso posterior mediante el cual se revisa, completa o valida la información económica y documental de la jornada.

Puede realizarse más tarde.

Puede requerir información adicional.

Puede consolidar múltiples hechos ya ocurridos.

Pero nunca modifica la hora real de finalización de la jornada.

### 5.3. Principio de separación

La jornada termina cuando el conductor deja de trabajar.

La conciliación puede producirse después.

La conciliación no redefine el instante del fin de jornada.

Esto protege la verdad operativa y evita que una tarea administrativa altere un hecho ya ocurrido.

---

## 6. Patrón general

GeoTaxi sigue el mismo patrón en todos sus procesos:

Cliente baja
↓
Fin del viaje
↓
Completar servicio

Conductor deja de trabajar
↓
Fin de jornada
↓
Conciliación

La lógica común en ambos casos es la misma:

1. ocurre un hecho real;
2. el hecho se registra en su instante real;
3. la información administrativa se completa después.

Este patrón no es accidental.

Es la expresión general del modelo operativo de GeoTaxi.

Viaje y jornada comparten exactamente la misma filosofía.

La diferencia está en el objeto que se documenta, no en la lógica de fondo.

---

## 7. Principios arquitectónicos

Los siguientes principios son vinculantes para la evolución futura del modelo operativo de GeoTaxi.

### 7.1. Registrar los hechos cuando ocurren

El sistema debe capturar el instante real del hecho operativo en el momento exacto en que sucede.

### 7.2. No retrasar un evento por tareas administrativas

Una tarea administrativa no puede posponer la existencia ni el registro del evento real.

### 7.3. La aplicación se adapta al trabajo del taxista

GeoTaxi debe reflejar la operativa natural del conductor, no imponer una secuencia artificial de documentación previa.

### 7.4. La aplicación no obliga al taxista a trabajar contra la realidad

El producto no debe requerir que el conductor altere el orden natural de los hechos para poder registrar su actividad.

### 7.5. La información administrativa puede completarse posteriormente

La documentación puede ampliarse más tarde sin comprometer la validez temporal del evento.

### 7.6. El instante del hecho nunca cambia

Una vez ocurrido, el momento real del evento es inmutable.

La administración posterior no reescribe la historia.

### 7.7. Verdad operativa

Existe una única verdad temporal para cada hecho operativo.

GeoTaxi puede enriquecer posteriormente la información asociada a ese hecho.

Pero nunca puede modificar la verdad temporal del hecho ocurrido.

### 7.8. La aplicación se adapta al trabajo real del conductor

GeoTaxi debe adaptarse al trabajo real del conductor.

Nunca debe obligar al conductor a modificar su operativa únicamente para satisfacer una limitación del software.

### 7.9. La simplicidad para el usuario tiene prioridad sobre la complejidad interna

La carga interna del modelo debe absorber la complejidad semántica para que la experiencia operativa siga siendo simple y fiel al trabajo real.

### 7.10. El hecho real y su expediente no son lo mismo

GeoTaxi debe mantener separada la verdad operativa del estado administrativo del registro.

### 7.11. La documentación es derivada, no fundacional

El expediente administrativo existe para representar el hecho, no para definirlo.

### 7.12. La ausencia de completitud no invalida el hecho

Un evento puede ser real y válido aunque su documentación posterior todavía esté incompleta.

---

## 8. Regla general del modelo

Siempre que en GeoTaxi exista diferencia entre cuándo ocurre un hecho y cuándo queda completamente documentado, el sistema deberá preservar siempre el instante real del hecho como única verdad temporal.

Este patrón no se limita a Viajes o Jornadas.

Debe reutilizarse en futuras funcionalidades siempre que aparezca la misma separación entre hecho real y documentación completa.

La documentación posterior puede ampliar, clasificar o completar el expediente.

No puede sustituir la verdad temporal del evento.

---

## 9. Implicaciones futuras

Este modelo facilita futuras capacidades porque establece una base semántica estable: el sistema puede separar con claridad el hecho real de su documentación posterior sin romper la verdad operativa.

### 9.1. Automatización

La automatización se apoya en eventos con instante real bien definido.

Eso permite construir procesos automáticos sobre hechos confiables y no sobre estados administrativos ambiguos.

### 9.2. Registro por voz

El registro por voz encaja mejor cuando el sistema entiende que primero ocurre el hecho y después se completa su documentación.

### 9.3. Enriquecimiento GEO

El enriquecimiento geográfico puede añadirse sin alterar el instante real del hecho.

### 9.4. Integraciones e IA

Las integraciones externas y las capacidades de IA se benefician de una separación clara entre evento y documentación.

Eso facilita enriquecer, clasificar o completar información sin confundir el hecho con su expediente.

### 9.5. Conciliación y automatizaciones futuras

La conciliación inteligente y otras automatizaciones futuras podrán apoyarse en la misma separación entre hecho y documentación.

Esto reduce ambigüedad y mejora la extensibilidad del producto.

---

## 10. Consecuencias de diseño

Este modelo impone una consecuencia central:

GeoTaxi debe representar la realidad operativa como una secuencia de hechos, no como una secuencia de formularios.

Por tanto:

- la lógica de negocio debe respetar la irreversibilidad temporal de los eventos;
- la documentación posterior debe tratarse como enriquecimiento o completitud administrativa;
- el sistema no debe confundir el cierre real de un hecho con el cierre administrativo del expediente;
- las futuras capacidades deben construirse alrededor de esta separación, no en contra de ella.

La calidad del modelo depende de preservar la fidelidad temporal del mundo real.

Esa fidelidad es la base de la confianza operativa del producto.

---

## 11. Resumen normativo

GeoTaxi registra hechos operativos reales.

Los eventos ocurren una sola vez y en un instante inmutable.

La documentación administrativa puede completarse después, pero no altera el instante real del hecho.

Viaje y Servicio no son lo mismo.

Fin de jornada y Conciliación administrativa no son lo mismo.

El patrón general es siempre el mismo:

hecho real primero;
documentación completa después.

Este es el modelo operativo oficial de GeoTaxi.
