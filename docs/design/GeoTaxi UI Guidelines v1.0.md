# GeoTaxi UI Guidelines v1.0

## 1. Propósito

Estas Guidelines definen las reglas obligatorias para diseñar cualquier interfaz de GeoTaxi.

Cualquier nueva pantalla deberá respetar estas Guidelines.

---

## 2. Filosofía General

- GeoTaxi es una herramienta de trabajo profesional.
- La aplicación se adapta al taxista, nunca al revés.
- La Home es un Panel de Decisión Operativa.
- La interfaz debe desaparecer para dejar protagonismo al trabajo.
- La calma operativa es un objetivo de diseño.
- La confianza operativa es un requisito funcional.

---

## 3. Organización de la Información

- Cada bloque responde una única pregunta.
- Cada bloque tiene una única responsabilidad.
- La información se ordena por utilidad para decidir.
- La información crítica permanece visible.
- La estructura permanece estable.
- El usuario nunca pierde el contexto.

---

## 4. Interacción

- Una única acción principal por estado.
- Cada pulsación debe aportar valor.
- No pedir confirmaciones innecesarias.
- Automatizar decisiones evidentes.
- Mantener siempre el contexto.
- El cambio de estado confirma la operación.
- Las acciones frecuentes mantienen siempre el mismo comportamiento.
- Prevenir errores antes que corregirlos.

---

## 5. Navegación

- Navegación plana.
- Navegación contextual.
- Las acciones frecuentes siempre visibles.
- La Home concentra la operación diaria.
- La navegación sigue el flujo del taxista.
- Las tareas frecuentes no requieren explorar menús.

---

## 6. Panel de Decisión Operativa

### Estado Operativo

- Misión: orientar al usuario sobre la situación actual de la jornada.
- Pregunta que responde: ¿qué estado tiene la jornada?
- Responsabilidad: mostrar el contexto operativo inmediato.

### Acción Principal

- Misión: indicar la siguiente acción lógica disponible.
- Pregunta que responde: ¿qué debo hacer ahora?
- Responsabilidad: ofrecer una única acción principal por estado.

### Estado Económico

- Misión: ayudar a evaluar cómo va la jornada.
- Pregunta que responde: ¿cómo voy hoy?
- Responsabilidad: mostrar el estado económico operativo necesario para decidir.

### Resumen Operativo

- Misión: mostrar el control operativo de la jornada.
- Pregunta que responde: ¿todo está bajo control?
- Responsabilidad: reunir la información operativa necesaria para verificar la operación.

### Registro Operativo

- Misión: confirmar lo que acaba de ocurrir.
- Pregunta que responde: ¿qué acaba de ocurrir?
- Responsabilidad: registrar y confirmar inmediatamente la operación realizada.

---

## 7. Qué nunca pertenece a la Home

- Bloques de acciones secundarias.
- Configuración.
- Administración.
- Estadísticas complejas.
- Informes históricos.
- Funciones ocasionales.
- Cualquier elemento que no ayude durante la operación diaria.

---

## 8. Criterios para nuevas funcionalidades

Antes de incorporar cualquier elemento nuevo a la Home deberán responderse obligatoriamente estas preguntas:

- ¿Ayuda al taxista a tomar una decisión?
- ¿Se utiliza durante la operación diaria?
- ¿Reduce esfuerzo?
- ¿Reduce carga cognitiva?
- ¿Rompe el Operational Loop?
- ¿Compite con la acción principal?

Si alguna respuesta compromete los principios anteriores, la funcionalidad no deberá incorporarse a la Home.

---

## 9. Checklist de revisión UX

□ ¿Existe una única acción principal?

□ ¿Cada bloque responde una única pregunta?

□ ¿La estructura permanece estable?

□ ¿El usuario nunca pierde el contexto?

□ ¿La pantalla ayuda a decidir?

□ ¿Reduce carga cognitiva?

□ ¿Respeta el Operational Loop?

□ ¿Transmite calma operativa?

□ ¿Transmite confianza?

□ ¿Todo elemento justifica su existencia?

---

## 10. Estado

Estado:

🟢 Aprobado

Documento normativo del sistema de diseño GeoTaxi.

---

## 11. Baseline visual oficial

La Home V2 aprobada queda congelada como baseline visual oficial del producto.

La Home V2 es la referencia para el resto de pantallas y para cualquier evolución futura del Centro Operativo.

Las acciones secundarias de gestión viven fuera de la Home, en la pantalla Más.

La jerarquía visual aprobada no debe romperse:

- Contexto Operativo.
- Progreso de la Jornada.
- Acción Principal.
- Registro Operativo.

Si una evolución futura modifica esta baseline, la documentación deberá actualizarse antes de implementar.
