# Research 05 — Actions & Interaction

## Objetivo

Responder a la pregunta:

"¿Cómo diseñan los mejores productos las interacciones para que el usuario haga más con menos esfuerzo?"

Esta investigación se centra exclusivamente en las acciones e interacciones del usuario con la interfaz.

No habla de identidad visual.

No habla de colores.

No habla de navegación entre pantallas.

---

## Estado del arte

Los sistemas de diseño modernos buscan:

- minimizar el esfuerzo del usuario;
- reducir pulsaciones innecesarias;
- mantener el contexto;
- automatizar decisiones evidentes;
- ofrecer respuesta inmediata;
- prevenir errores antes que corregirlos;
- conseguir que la interfaz desaparezca y el usuario se concentre únicamente en su trabajo.

---

## Consenso encontrado

### Hallazgo 1

La acción principal debe ser siempre evidente.

---

### Hallazgo 2

Las acciones habituales no deben pedir confirmación.

---

### Hallazgo 3

Cada pulsación debe aportar valor.

---

### Hallazgo 4

La aplicación debe decidir automáticamente cuando exista una única opción lógica.

---

### Hallazgo 5

Toda interacción debe mantener el contexto operativo.

---

### Hallazgo 6

El tiempo de respuesta forma parte de la interacción.

---

### Hallazgo 7

El propio cambio de estado debe confirmar que la acción se ha realizado correctamente.

---

### Hallazgo 8

Es mejor prevenir errores que obligar al usuario a corregirlos.

---

### Hallazgo 9

Las acciones frecuentes deben aprovechar la memoria muscular.

---

### Hallazgo 10

La interacción debe sentirse natural.

---

### Hallazgo 11

Las acciones destructivas deben diferenciarse claramente.

---

### Hallazgo 12

Solo deben mostrarse acciones posibles para el estado actual.

---

### Hallazgo 13

No interrumpir el flujo con mensajes innecesarios.

---

### Hallazgo 14

Las acciones relacionadas deben permanecer agrupadas.

---

### Hallazgo 15

La aplicación debe anticiparse cuando exista una opción claramente previsible.

---

### Hallazgo 16

Las interacciones deben ser consistentes en toda la aplicación.

---

### Hallazgo 17

La automatización nunca debe hacer perder el control al usuario.

---

### Hallazgo 18

La interfaz debe favorecer que el usuario experto trabaje cada vez más rápido.

---

### Hallazgo 19

Corregir un error debe ser siempre sencillo.

---

### Hallazgo 20

Las acciones frecuentes deben poder realizarse cómodamente con una mano.

---

### Hallazgo 21

Solo debe exigirse la información imprescindible para continuar.

---

### Hallazgo 22

Toda interacción debe producir una respuesta visual inmediata.

---

### Hallazgo 23

Las acciones repetitivas deben minimizar el esfuerzo físico.

---

### Hallazgo 24

Cada interacción debe aumentar la confianza del usuario.

---

### Hallazgo 25

La mejor interacción es aquella que el usuario deja de percibir.

---

## Adaptación a GeoTaxi

Estos principios afectan al diseño de GeoTaxi de forma directa.

- La acción principal cambiará según el estado operativo.
- Registrar un viaje deberá requerir el menor número posible de pulsaciones.
- GeoTaxi eliminará confirmaciones innecesarias.
- El flujo operativo nunca deberá romperse por información secundaria.
- La interfaz favorecerá la memoria muscular del taxista.
- El usuario siempre conservará el control sobre sus acciones.

---

## Reglas candidatas

Las conclusiones anteriores se traducen en reglas candidatas para `GeoTaxi UI Guidelines`.

Todavía no son reglas oficiales.

---

## Impacto esperado

| Hallazgo | Regla candidata | Pantallas afectadas |
|---|---|---|
| La acción principal debe ser siempre evidente. | La acción principal será siempre evidente. | Home; Registro de viaje; Historial; Formularios; Toda la aplicación |
| Las acciones habituales no deben pedir confirmación. | Las acciones habituales no solicitarán confirmación. | Home; Registro de viaje; Historial; Formularios; Toda la aplicación |
| Cada pulsación debe aportar valor. | Cada pulsación deberá aportar valor. | Home; Registro de viaje; Historial; Formularios; Toda la aplicación |
| La aplicación debe decidir automáticamente cuando exista una única opción lógica. | GeoTaxi automatizará las decisiones evidentes. | Home; Registro de viaje; Formularios; Toda la aplicación |
| Toda interacción debe mantener el contexto operativo. | Toda interacción mantendrá el contexto operativo. | Home; Registro de viaje; Historial; Toda la aplicación |
| El tiempo de respuesta forma parte de la interacción. | La respuesta visual será inmediata. | Toda la aplicación |
| El propio cambio de estado debe confirmar que la acción se ha realizado correctamente. | El cambio de estado será la principal confirmación de una acción. | Home; Registro de viaje; Historial; Toda la aplicación |
| Es mejor prevenir errores que obligar al usuario a corregirlos. | GeoTaxi priorizará prevenir errores frente a corregirlos. | Registro de viaje; Formularios; Toda la aplicación |
| Las acciones frecuentes deben aprovechar la memoria muscular. | Las acciones frecuentes mantendrán siempre el mismo comportamiento. | Home; Registro de viaje; Historial; Toda la aplicación |
| La interacción debe sentirse natural. | La interacción será natural y directa. | Toda la aplicación |
| Las acciones destructivas deben diferenciarse claramente. | Las acciones destructivas se diferenciarán claramente. | Formularios; Toda la aplicación |
| Solo deben mostrarse acciones posibles para el estado actual. | Solo se mostrarán acciones posibles para el estado actual. | Home; Registro de viaje; Historial; Toda la aplicación |
| No interrumpir el flujo con mensajes innecesarios. | Las interrupciones innecesarias serán eliminadas. | Toda la aplicación |
| Las acciones relacionadas deben permanecer agrupadas. | Las acciones relacionadas permanecerán agrupadas. | Home; Registro de viaje; Formularios; Toda la aplicación |
| La aplicación debe anticiparse cuando exista una opción claramente previsible. | La aplicación podrá anticipar información cuando aumente la velocidad sin reducir el control del usuario. | Home; Registro de viaje; Toda la aplicación |
| Las interacciones deben ser consistentes en toda la aplicación. | Las interacciones serán consistentes en toda la aplicación. | Toda la aplicación |
| La automatización nunca debe hacer perder el control al usuario. | El usuario mantendrá siempre el control sobre sus acciones. | Toda la aplicación |
| La interfaz debe favorecer que el usuario experto trabaje cada vez más rápido. | La interfaz favorecerá que el usuario experto trabaje cada vez más rápido. | Toda la aplicación |
| Corregir un error debe ser siempre sencillo. | Corregir un error será siempre sencillo. | Registro de viaje; Historial; Formularios; Toda la aplicación |
| Las acciones frecuentes deben poder realizarse cómodamente con una mano. | Las acciones frecuentes se optimizarán para una mano. | Home; Registro de viaje; Toda la aplicación |
| Solo debe exigirse la información imprescindible para continuar. | Solo se solicitará la información imprescindible. | Registro de viaje; Formularios; Toda la aplicación |
| Toda interacción debe producir una respuesta visual inmediata. | La respuesta visual será inmediata. | Toda la aplicación |
| Las acciones repetitivas deben minimizar el esfuerzo físico. | Las acciones repetitivas serán optimizadas como prioridad absoluta. | Registro de viaje; Formularios; Toda la aplicación |
| Cada interacción debe aumentar la confianza del usuario. | Cada interacción aumentará la confianza del usuario. | Toda la aplicación |
| La mejor interacción es aquella que el usuario deja de percibir. | La interfaz deberá desaparecer para que el taxista solo piense en trabajar. | Toda la aplicación |

---

## Estado de la investigación

Estado actual:

🟢 Aprobada

---

## Decisiones adoptadas

Las siguientes decisiones quedan aprobadas:

✓ La acción principal siempre representará la siguiente acción lógica del usuario.

✓ Las acciones habituales no solicitarán confirmación.

✓ Cada pulsación deberá aportar valor.

✓ GeoTaxi automatizará las decisiones evidentes.

✓ Toda interacción mantendrá el contexto operativo.

✓ La respuesta visual será inmediata.

✓ El cambio de estado será la principal confirmación de una acción.

✓ GeoTaxi priorizará prevenir errores frente a corregirlos.

✓ Las acciones frecuentes mantendrán siempre el mismo comportamiento.

✓ Solo se mostrarán acciones posibles para el estado actual.

✓ Las acciones relacionadas permanecerán agrupadas.

✓ La aplicación podrá anticipar información cuando aumente la velocidad sin reducir el control del usuario.

✓ La interfaz favorecerá la memoria muscular.

✓ Corregir un error será siempre sencillo.

✓ Solo se solicitará la información imprescindible.

✓ Las acciones repetitivas serán optimizadas como prioridad absoluta.

✓ Cada interacción aumentará la confianza del usuario.

✓ La interfaz deberá desaparecer para que el taxista solo piense en trabajar.

"Estas decisiones quedan aprobadas para su futura incorporación a GeoTaxi UI Guidelines v1.0."

---

## Próximos pasos

La siguiente investigación oficial será:

`Research 06 — Mobile Operational Dashboards`
