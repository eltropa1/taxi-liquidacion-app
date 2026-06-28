Arquitectura de TaxiGeo
Visión Arquitectónica

TaxiGeo no es una aplicación para registrar servicios.

TaxiGeo aspira a convertirse en el sistema operativo del taxista profesional.

La arquitectura debe reflejar esa visión.

No organizamos el software alrededor de pantallas.

No organizamos el software alrededor de la base de datos.

No organizamos el software alrededor de React.

Organizamos el software alrededor del negocio.

La arquitectura debe responder a una única pregunta:

¿Dónde pertenece realmente este conocimiento?

Cada concepto del negocio posee un propietario claro.

Cada regla existe una única vez.

Cada responsabilidad vive en un único lugar.

Cuando aparece una nueva funcionalidad, la primera decisión nunca es:

¿En qué archivo lo escribo?

La primera decisión siempre es:

¿A qué concepto del dominio pertenece?

La respuesta determina automáticamente dónde debe vivir el código.

El dominio es el centro

El dominio representa el conocimiento del taxi.

Todo aquello que seguiría existiendo aunque mañana cambiáramos React, Expo, SQLite o incluso el lenguaje de programación pertenece al dominio.

Ejemplos:

qué es una jornada;
qué es un viaje;
cómo se calcula una liquidación;
qué significa un método de pago;
qué representa una plataforma;
qué color identifica cada plataforma;
cómo se interpreta una propina.

Nada de esto depende de la tecnología.

La tecnología es reemplazable

React puede cambiar.

Expo puede desaparecer.

SQLite puede sustituirse por PostgreSQL.

La arquitectura debe permitir que esos cambios afecten lo menos posible al conocimiento del negocio.

Por eso el dominio nunca debe depender de la infraestructura.

Nunca.

Un único propietario del conocimiento

Cada conocimiento tiene un único responsable.

Nunca debe haber dos lugares distintos que sepan la misma regla.

Ejemplos:

Solo un módulo sabe resolver qué jornada corresponde a una fecha.

Solo un módulo sabe calcular un resumen.

Solo un módulo sabe interpretar un método de pago.

Solo un módulo sabe qué color representa Uber.

Si una regla aparece duplicada, existe deuda técnica.

Las pantallas no piensan

Las pantallas muestran información.

Recogen acciones del usuario.

Conectan componentes.

Nada más.

Las pantallas no contienen reglas del negocio.

No calculan liquidaciones.

No interpretan jornadas.

No normalizan pagos.

No conocen cómo funciona un viaje.

Los hooks coordinan

Los hooks representan la coordinación de la interfaz.

Gestionan estado.

Gestionan efectos.

Llaman a casos de uso o servicios.

Nunca contienen conocimiento del negocio.

Los servicios representan capacidades

Un servicio implementa una capacidad concreta.

No representa una intención del usuario.

No mezcla varias responsabilidades.

Cuando un servicio empieza a conocer demasiados conceptos distintos, debe dividirse siguiendo el dominio.

Los casos de uso representan intenciones

Abrir jornada.

Cerrar jornada.

Iniciar viaje.

Finalizar viaje.

Editar viaje.

Crear viaje manual.

No son simples llamadas a servicios.

Son intenciones completas del negocio.

Cuando la complejidad lo justifique existirán como una capa propia de Application.

La arquitectura evoluciona desde el dominio

Nunca añadimos una carpeta porque sí.

Nunca introducimos un patrón porque esté de moda.

Cada decisión arquitectónica debe responder a una necesidad real del dominio.

La arquitectura debe descubrirse.

No inventarse.

La deuda técnica

La deuda técnica no se mide por el número de líneas.

Se mide por la pérdida de claridad.

Existe deuda técnica cuando:

una responsabilidad tiene varios propietarios;
una pantalla conoce reglas del negocio;
un servicio mezcla conceptos distintos;
una regla aparece duplicada;
la infraestructura empieza a decidir comportamiento.

Mientras esas reglas se respeten, TaxiGeo podrá crecer durante años sin perder coherencia.

Para terminar...

Hay algo que me gustaría proponerte.

Yo no llamaría a este documento "Arquitectura".

Lo llamaría:

Constitución Arquitectónica de TaxiGeo

Porque eso es exactamente lo que es.

No explica cómo está implementado el sistema hoy.

Define las leyes que el sistema deberá seguir siempre, aunque dentro de cinco años haya cambiado completamente la implementación.

Y, sinceramente, creo que es uno de los documentos más importantes que puede tener un proyecto de larga vida como TaxiGeo.