# Trip Domain v2

## 1. Naturaleza del dominio

El Trip Domain constituye el dominio central de TaxiGeo.

Su misión es representar de forma fiel, consistente y duradera cada viaje que TaxiGeo decide conservar como parte de la actividad operativa del conductor.

TaxiGeo no crea los viajes.

Los viajes ocurren en la realidad con independencia de TaxiGeo.

TaxiGeo únicamente conserva una representación de esos viajes cuando decide registrarlos.

El viaje es el concepto central del dominio.

El viaje constituye la unidad fundamental de la actividad operativa del conductor.

Por esta razón, el Trip Domain debe describir la realidad del trabajo del taxista y no el funcionamiento de la aplicación.

Toda definición del dominio debe preservar este principio.

## 2. Misión

La misión del Trip Domain consiste en representar correctamente el viaje para que el resto del sistema trabaje sobre una definición común, estable y protegida del mismo hecho operativo.

El dominio no calcula estadísticas.

El dominio no realiza análisis.

El dominio no toma decisiones.

El dominio no interpreta la conveniencia de un viaje.

El dominio no establece objetivos.

El dominio no describe la interfaz.

El dominio no resuelve cuestiones de infraestructura.

Su responsabilidad es representar el viaje como hecho del negocio y conservar la integridad de esa representación a lo largo del tiempo.

## 3. Definición del viaje

Un viaje representa un único viaje ocurrido en la realidad.

Todo viaje posee identidad propia.

Esa identidad se mantiene durante toda su existencia.

El viaje admite conocimiento parcial.

El viaje puede enriquecerse.

El viaje puede corregirse.

El viaje puede completarse posteriormente.

Ninguna de estas evoluciones lo convierte en otro viaje.

Un viaje nunca deja de representar el mismo viaje.

Registrar un viaje no significa crear un viaje.

Registrar un viaje significa incorporar al sistema la representación de un viaje ya ocurrido.

El dominio debe mantener esta distinción de manera explícita y estable.

## 4. Ciclo de vida

### 4.1 Existencia del viaje

El viaje existe primero en la realidad operativa del conductor.

Su existencia no depende de que haya sido registrado.

Su existencia tampoco depende del nivel de información disponible en un momento concreto.

### 4.2 Representación por TaxiGeo

TaxiGeo representa el viaje cuando decide conservarlo como parte de la actividad operativa del conductor.

La representación puede comenzar durante la operativa diaria o con posterioridad, cuando el conductor reconstruye un viaje ya ocurrido.

El flujo principal del dominio es el registro durante la operativa diaria.

El registro diferido es un comportamiento permitido del dominio, pero no constituye su flujo principal.

### 4.3 Evolución de la representación

Una vez representado, el viaje puede evolucionar sin perder identidad.

Esa evolución responde al aumento de conocimiento, a la corrección de datos o a la incorporación de información que no estaba disponible en el momento inicial del registro.

La evolución de la representación no modifica el hecho ocurrido.

Únicamente mejora la fidelidad con la que el sistema lo conserva.

## 5. Invariantes

El Trip Domain queda sometido, como mínimo, a los siguientes invariantes:

- un viaje representa un único viaje;
- un viaje conserva siempre su identidad;
- un viaje admite conocimiento parcial;
- un viaje puede evolucionar;
- la representación nunca altera el viaje ocurrido.

Estos invariantes no son opcionales.

Constituyen el marco de validez del dominio.

Toda evolución futura del sistema deberá respetarlos de manera estricta.

## 6. Información del viaje

La información asociada a un viaje no pertenece toda al mismo nivel conceptual.

El Trip Domain debe distinguir con claridad la naturaleza de cada tipo de información.

### 6.1 Información esencial

La información esencial es la que permite afirmar que la representación corresponde a un viaje real y singular.

Esta información sostiene la identidad del viaje y su continuidad a lo largo del tiempo.

Sin información esencial no existe una representación válida del viaje.

### 6.2 Información operativa

La información operativa describe el viaje como unidad de actividad del conductor.

Permite situar el viaje dentro de la jornada, del trabajo realizado y del contexto ordinario de la operativa diaria.

Esta información forma parte natural del dominio del viaje porque describe el hecho operativo conservado.

### 6.3 Información opcional

La información opcional es aquella que puede faltar sin destruir la validez de la representación.

Su ausencia no implica que el viaje no exista ni que deje de ser el mismo viaje.

Su incorporación posterior constituye una evolución legítima del conocimiento del viaje.

### 6.4 Información derivada

La información derivada no define el viaje.

Proviene de operaciones realizadas sobre viajes ya representados o sobre información asociada a ellos.

Puede ser útil para otros dominios, pero no constituye el núcleo del Trip Domain.

Cuando una información es derivada, el Trip Domain no debe confundirla con la definición del viaje.

### 6.5 Información visual

La información visual no pertenece al Trip Domain.

Su finalidad es facilitar la presentación, la identificación perceptiva o la lectura operativa del viaje dentro de la experiencia de uso.

La información visual pertenece al Dominio Visual.

El Trip Domain puede ser consumido por el Dominio Visual, pero no debe redefinirse mediante criterios visuales.

### 6.6 Información de infraestructura

La información de infraestructura no pertenece al dominio del viaje.

No describe la realidad del trabajo del taxista.

Describe únicamente mecanismos utilizados por el sistema para conservar, transportar o procesar la representación.

Por definición, la infraestructura queda fuera del Trip Domain.

## 7. Límites

El Trip Domain representa el viaje y únicamente el viaje como hecho operativo conservado por TaxiGeo.

Por tanto, el Trip Domain no representa:

- estadísticas;
- objetivos;
- inteligencia artificial;
- informes;
- decisiones;
- interfaz;
- infraestructura.

Estos elementos pueden utilizar el viaje como base común, pero no forman parte de su definición.

El respeto a estos límites protege el lenguaje del negocio y evita que el viaje absorba responsabilidades ajenas.

## 8. Relaciones

### 8.1 Jornada

La jornada constituye el marco operativo en el que los viajes se consultan, se organizan y se interpretan como actividad de trabajo.

La jornada utiliza el viaje como unidad operativa básica.

El viaje no redefine la jornada y la jornada no redefine el viaje.

Ambos conceptos deben permanecer distinguibles.

### 8.2 Dominio Visual

El Dominio Visual utiliza el viaje para construir una representación visual coherente y estable.

La forma visual de mostrar un viaje no altera su definición de negocio.

El viaje existe con independencia de su representación visual.

### 8.3 Plataforma

La plataforma constituye una información asociable al viaje cuando forma parte de la realidad operativa conservada.

La plataforma no redefine qué es un viaje.

El viaje sigue siendo el concepto principal y la plataforma actúa como información asociada al mismo.

### 8.4 Tipo de servicio

El tipo de servicio puede describir la naturaleza operativa del viaje.

Su función es caracterizar un viaje ya representado.

No sustituye la identidad del viaje ni modifica su definición.

### 8.5 Método de pago

El método de pago puede formar parte de la información del viaje cuando describe cómo se resolvió operativamente dicho viaje.

Es información del viaje, pero no es el viaje.

La representación del método de pago nunca debe desplazar el concepto central del dominio.

### 8.6 Geolocalización

La geolocalización puede aportar información relevante sobre el viaje.

Sin embargo, la geolocalización no define por sí sola la existencia del viaje.

Su función es enriquecer la representación del mismo cuando esa información resulta disponible y útil dentro del marco del negocio.

### 8.7 Registro por voz

El registro por voz es un medio de incorporación de información al sistema.

No forma parte de la definición del viaje.

Su papel consiste en facilitar la captura o reconstrucción del conocimiento del viaje sin alterar la naturaleza del dominio.

### 8.8 Inteligencia Artificial

La Inteligencia Artificial puede asistir en tareas de interpretación, ayuda, sugerencia o procesamiento complementario.

No redefine el viaje.

No decide qué es un viaje.

No sustituye la definición canónica del Trip Domain.

### 8.9 Estadísticas

Las estadísticas utilizan viajes ya representados para producir conocimiento agregado.

Las estadísticas dependen del viaje.

El viaje no depende de las estadísticas.

El Trip Domain no debe incorporar lógica estadística ni lenguaje de análisis agregado.

### 8.10 Objetivos

Los objetivos utilizan viajes ya conservados para evaluar progreso o cumplimiento.

Los objetivos no forman parte de la definición del viaje.

El Trip Domain no se orienta a metas.

Se orienta a la representación fiel de la actividad realizada.

## 9. Contextos de uso

El viaje no cambia según el contexto desde el que se consulte.

Lo único que cambia es el propósito de consulta.

El Trip Domain debe permanecer idéntico en todos los contextos.

### 9.1 Operativo

En el contexto operativo, el viaje se consulta como unidad inmediata de la actividad diaria del conductor.

Predomina la necesidad de registrar, completar, corregir o revisar la actividad reciente con rapidez y fidelidad.

### 9.2 Reconstrucción

En el contexto de reconstrucción, el viaje se consulta para recuperar, completar o corregir la representación de un hecho ya ocurrido cuya información no quedó plenamente incorporada en el momento inicial.

El viaje no cambia.

Cambia únicamente el momento y la finalidad de la consulta.

### 9.3 Análisis

En el contexto de análisis, el viaje se utiliza como base estable para producir lecturas posteriores del trabajo realizado.

El viaje sigue siendo el mismo.

El análisis se apoya en él, pero no lo redefine.

## 10. Principios arquitectónicos

El Trip Domain queda regido por los siguientes principios arquitectónicos:

- la realidad prevalece sobre la implementación;
- existe una única representación válida del viaje;
- el dominio protege el lenguaje del negocio;
- el dominio permanece pequeño;
- nuevas capacidades deben convertirse en nuevos dominios cuando corresponda;
- el modelo representa el trabajo del taxista, no la aplicación.

Estos principios imponen una disciplina arquitectónica concreta.

El dominio no debe crecer mediante acumulación de responsabilidades ajenas.

Cuando una nueva necesidad no pertenezca de forma estricta a la representación del viaje, deberá resolverse fuera del Trip Domain mediante un dominio distinto.

## 11. Glosario

### Viaje

Hecho operativo real ocurrido en la actividad del conductor y conservado por TaxiGeo mediante una representación fiel, consistente y duradera.

### Jornada

Marco operativo en el que la actividad del conductor puede agruparse, consultarse e interpretarse sin alterar la identidad de cada viaje que la compone.

### Memoria operativa

Conjunto de representaciones que TaxiGeo decide conservar para recordar, consultar y trabajar sobre la actividad real del conductor.

### Representación

Forma mediante la cual TaxiGeo incorpora a su memoria un viaje real sin crearlo, sin sustituirlo y sin alterar el hecho ocurrido.

## 12. Conclusión

El Trip Domain constituye uno de los pilares arquitectónicos de TaxiGeo.

Su función es proteger la definición canónica del viaje como unidad fundamental de la actividad operativa del conductor.

Toda evolución futura del sistema deberá respetar las definiciones establecidas en este documento.

Ninguna capacidad nueva, ninguna necesidad operativa y ninguna expansión funcional podrá redefinir el viaje fuera del marco aquí fijado.
