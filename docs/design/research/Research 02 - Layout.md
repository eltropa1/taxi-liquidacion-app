# Research 02 — Layout

## Objetivo

Responder a la pregunta:

"¿Cómo estructuran una pantalla móvil los mejores sistemas de diseño actuales y cómo debe adaptarse ese conocimiento a GeoTaxi?"

---

## Estado del arte

### Apple Human Interface Guidelines

El enfoque favorece la claridad inmediata, la organización por secciones y la lectura natural de arriba abajo.

La estructura visual prioriza la orientación rápida del usuario y reserva el espacio principal para la información y la acción relevantes.

### Material Design

Se observan layouts basados en jerarquía clara, bloques funcionales bien definidos y una distribución que facilita el escaneo rápido.

La pantalla se entiende mejor cuando cada región cumple una función reconocible.

### Microsoft Fluent

El patrón común es una composición ordenada, con separación explícita entre contenido principal, información auxiliar y acciones.

La interfaz favorece la legibilidad y el uso eficiente del espacio.

### IBM Carbon

Destaca una organización sistemática del contenido, con fuerte disciplina en alineación, agrupación y consistencia.

La claridad estructural tiene prioridad sobre el ornamento.

---

## Consenso

Los seis hallazgos comunes identificados son:

1. Las pantallas se diseñan por zonas funcionales.
2. La parte superior orienta al usuario.
3. El centro contiene la decisión principal.
4. La información secundaria aparece después.
5. La acción principal nunca debe requerir scroll.
6. El primer pantallazo contiene todo lo necesario para comenzar la siguiente acción.

---

## Adaptación a GeoTaxi

En una aplicación operativa para taxistas, el layout no puede ser decorativo ni exploratorio.

Debe facilitar lectura inmediata, decisión rápida y ejecución sin fricción durante la jornada.

Eso implica:

- separar con claridad la orientación general, el estado operativo y la acción disponible;
- reservar la parte superior para contexto y estado;
- colocar en el centro la decisión que el taxista necesita tomar ahora;
- relegar la información secundaria a zonas posteriores;
- evitar que la acción principal dependa del scroll;
- asegurar que el primer pantallazo permita entender qué ocurre y qué puede hacerse.

---

## Reglas candidatas

Los hallazgos anteriores pueden convertirse más adelante en reglas para `GeoTaxi UI Guidelines`.

Todavía no son reglas oficiales.

### 1. Zonas funcionales

La interfaz de GeoTaxi debe estructurarse por zonas funcionales claramente diferenciadas.

### 2. Orientación superior

La zona superior debe orientar al usuario antes de cualquier acción.

### 3. Decisión central

La decisión principal debe ocupar la zona visual central de la pantalla.

### 4. Secundario después

La información secundaria debe aparecer tras la capa operativa principal.

### 5. Acción sin scroll

La acción principal debe ser accesible sin necesidad de hacer scroll.

### 6. Primer pantallazo completo

El primer pantallazo debe contener lo necesario para comprender el estado y comenzar la siguiente acción.

---

## Impacto esperado

| Hallazgo | Regla candidata | Pantallas afectadas |
|---|---|---|
| Las pantallas se diseñan por zonas funcionales. | La interfaz debe estructurarse por zonas funcionales claramente diferenciadas. | Home; Historial; Estadísticas; Todas las pantallas |
| La parte superior orienta al usuario. | La zona superior debe orientar al usuario antes de cualquier acción. | Home; Historial; Estadísticas; Todas las pantallas |
| El centro contiene la decisión principal. | La decisión principal debe ocupar la zona visual central de la pantalla. | Home; Historial; Estadísticas; Todas las pantallas |
| La información secundaria aparece después. | La información secundaria debe aparecer tras la capa operativa principal. | Historial; Estadísticas; Todas las pantallas |
| La acción principal nunca debe requerir scroll. | La acción principal debe ser accesible sin necesidad de hacer scroll. | Home; Todas las pantallas operativas |
| El primer pantallazo contiene todo lo necesario para comenzar la siguiente acción. | El primer pantallazo debe contener lo necesario para comprender el estado y comenzar la siguiente acción. | Home; Historial; Todas las pantallas |

---

## Próximos pasos

La siguiente investigación será:

`Research 03 — Visual Hierarchy`

---

## Estado de la investigación

Estado actual:

🟢 Aprobada

Esta investigación ha finalizado y sus conclusiones han sido aceptadas como base para la construcción de `GeoTaxi UI Guidelines`.

---

## Decisiones adoptadas

Las decisiones aprobadas tras esta investigación son:

- GeoTaxi diseñará sus pantallas por zonas funcionales.
- La parte superior de la pantalla estará dedicada a orientar al usuario.
- La acción principal nunca requerirá desplazamiento para ser visible.
- La acción principal ocupará la máxima prioridad visual.
- La información secundaria nunca competirá con la acción principal.
- El primer pantallazo contendrá toda la información necesaria para realizar la siguiente decisión operativa.

Estas decisiones quedan aprobadas para su futura incorporación a:

`GeoTaxi UI Guidelines v1.0`
