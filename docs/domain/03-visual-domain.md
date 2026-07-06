# Dominio Visual v1.0 — TaxiGeo

**Estado:** Aprobado
**Versión:** 1.0
**Tipo de documento:** Dominio del producto
**Ámbito:** Todo TaxiGeo

---

# 1. Propósito

El Dominio Visual define el lenguaje visual oficial de TaxiGeo.

Su objetivo es garantizar que cualquier concepto importante del negocio tenga una representación visual única, consistente y reutilizable en toda la aplicación.

No es una guía de estilos.

No es un documento de diseño gráfico.

Es un documento del dominio del producto.

Mientras el dominio de negocio responde a la pregunta:

> ¿Qué es?

El Dominio Visual responde a:

> ¿Cómo se representa?

---

# 2. Misión

Construir un lenguaje visual que permita al taxista reconocer inmediatamente la información importante sin necesidad de leer toda la pantalla.

El usuario no debe aprender pantallas.

Debe aprender un lenguaje visual.

Ese lenguaje deberá mantenerse estable durante toda la vida del producto.

---

# 3. Alcance

Este documento es obligatorio para cualquier pantalla, componente, informe, estadística, gráfico, exportación o futura funcionalidad de TaxiGeo.

Toda representación visual deberá respetar este contrato.

---

# 4. Principios fundamentales

## Principio 1 — Un significado por canal visual

Cada canal visual comunica una única información.

| Canal               | Significado             |
| ------------------- | ----------------------- |
| 🎨 Color            | Plataforma              |
| 🚖 Icono principal  | Tipo de servicio        |
| 💳 Icono secundario | Método de pago          |
| 📝 Texto            | Información descriptiva |
| 💶 Importe          | Resultado económico     |

Un mismo canal nunca comunicará dos conceptos distintos.

---

## Principio 2 — Una única fuente de verdad

Toda identidad visual debe estar definida en un único lugar.

Nunca podrán existir colores o iconos duplicados en componentes.

Toda la aplicación consultará el Dominio Visual.

---

## Principio 3 — Consistencia

Un concepto siempre tendrá exactamente la misma representación.

Nunca dependerá de la pantalla donde aparezca.

---

## Principio 4 — Continuidad visual

El usuario debe reconocer un concepto inmediatamente.

Si aprende que Taxi es amarillo, seguirá siendo amarillo en:

* historial;
* detalle;
* estadísticas;
* gráficos;
* exportaciones;
* futuras pantallas.

Nunca cambiará.

---

## Principio 5 — Accesibilidad

El color nunca será el único mecanismo de identificación.

Cada concepto importante deberá poder identificarse mediante:

* color;
* icono;
* texto;
* inicial cuando proceda.

---

## Principio 6 — Escalabilidad

El sistema debe permitir incorporar nuevos conceptos sin modificar el resto de la aplicación.

Añadir una plataforma nueva únicamente requerirá registrar su identidad visual.

---

# 5. Leyes del Dominio Visual

## Ley 1

Todo concepto importante del dominio debe tener una identidad visual única.

---

## Ley 2

La representación visual nunca modifica el significado del dominio.

Únicamente lo comunica.

---

## Ley 3

Una identidad visual nunca podrá representar dos conceptos distintos.

---

## Ley 4

Toda identidad visual pertenece al Dominio Visual.

Nunca a un componente.

Nunca a una pantalla.

Nunca a la lógica de presentación.

---

## Ley 5

Toda decisión visual tendrá un único propietario.

---

# 6. Identidad visual de plataformas

| Plataforma | Color       | Surface | On surface |
| ---------- | ----------- | ------- | ---------- |
| Taxi       | 🟨 Amarillo | Amarillo | Negro     |
| Uber       | ⬛ Negro     | Negro   | Blanco     |
| Cabify     | 🟣 Morado   | Morado  | Blanco     |
| Bolt       | 🟢 Verde    | Verde   | Negro      |
| Free Now   | 🔴 Rojo     | Rojo    | Blanco     |
| Otra       | ⚪ Gris      | Gris    | Negro      |

Estos colores de superficie y contraste son oficiales.

No podrán modificarse salvo decisión excepcional del producto.

---

# 7. Identidad visual de tipos de servicio

| Servicio         | Icono |
| ---------------- | ----- |
| Aeropuerto       | ✈️    |
| Urbano           | 🏙️   |
| Estación         | 🚉    |
| Reserva          | 📅    |
| Largo recorrido  | 🛣️   |
| Hospital         | 🏥    |
| Cliente habitual | ⭐     |
| Paquetería       | 📦    |
| Otro             | ⋯     |

Los iconos nunca cambian de significado.

---

# 8. Identidad visual de métodos de pago

Los métodos de pago no utilizarán colores.

Únicamente iconografía.

| Método       | Icono |
| ------------ | ----- |
| Efectivo     | 💶    |
| Tarjeta      | 💳    |
| Bizum        | 📱    |
| App          | 📲    |
| Bono empresa | 💼    |
| Otro         | ✏️    |

Esto evita que el usuario tenga que aprender dos sistemas de colores diferentes.

---

# 9. Jerarquía visual

La información deberá recorrerse siempre en el mismo orden.

```
Color plataforma

↓

Tipo de servicio

↓

Método de pago

↓

Horario

↓

Descripción

↓

Importe
```

La posición también comunica significado.

Debe mantenerse constante.

---

# 10. Ámbitos de aplicación

Este dominio se aplicará, como mínimo, a:

* Historial
* Detalle del viaje
* Estadísticas
* Resúmenes
* Gráficos
* Filtros
* Exportaciones
* Inteligencia Artificial
* Sincronización
* Futuras funcionalidades

---

# 11. Evolución del Dominio Visual

En el futuro podrán incorporarse nuevas identidades visuales para conceptos como:

* objetivos;
* incidencias;
* alertas;
* gastos;
* mantenimiento;
* IA;
* sincronización;
* promociones;
* recompensas.

Cada nueva identidad deberá respetar este documento.

---

# 12. Arquitectura

El Dominio Visual forma parte del dominio del producto.

No pertenece a:

* React;
* Expo;
* Theme;
* Componentes.

Su implementación deberá vivir en un módulo específico del dominio.

La interfaz nunca decidirá colores ni iconos.

Siempre consultará el Dominio Visual.

---

# 13. Gobernanza

Modificar este documento implica modificar el lenguaje visual oficial de TaxiGeo.

Por tanto:

* los cambios deberán ser excepcionales;
* deberán preservar el aprendizaje del usuario;
* deberán mantener compatibilidad visual siempre que sea posible.

---nn   

# 14. Visión a largo plazo

TaxiGeo no pretende únicamente mostrar información.

Pretende construir un lenguaje visual propio.

Con el tiempo, un taxista deberá ser capaz de comprender el estado de su jornada con solo unos segundos de observación, gracias a la consistencia del Dominio Visual.

El objetivo final no es que el usuario aprenda cada pantalla.

El objetivo es que aprenda el lenguaje de TaxiGeo.

Ese lenguaje será estable, coherente y reutilizable durante toda la vida del producto.
