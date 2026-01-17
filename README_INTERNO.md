
---

## 5. Base de datos y persistencia

### 5.1 Normas

- No modificar la base de datos sin análisis previo
- No romper datos ya almacenados
- Los históricos deben seguir siendo accesibles

---

### 5.2 Separación de responsabilidades

- UI → no contiene lógica de negocio
- Servicios → concentran la lógica
- Base de datos → acceso encapsulado (repositorios / servicios)

---

## 6. Estados críticos de la aplicación

Estos puntos se consideran **sensibles** y requieren especial cuidado:

- Carga inicial de viajes al abrir la app
- Navegación entre días abiertos y cerrados
- Historiales
- Cierres de caja
- Recaudación, propinas e incentivos

Nunca se asume comportamiento:  
**se comprueba y se razona**.

---

## 7. Decisiones de negocio cerradas

Las siguientes decisiones están **cerradas** y no se rediscuten salvo decisión explícita:

- Las **propinas no cuentan como recaudación**
- Los **incentivos / ofertas no cuentan como recaudación**
- Los días cerrados **no impiden** ver el historial
- Los cierres son **inmutables**
- Los ajustes manuales negativos siguen siendo posibles cuando ya existían

---

## 8. Organización de chats y flujo de trabajo

Para cualquier nueva funcionalidad o modificación relevante se usarán
**DOS CHATS DIFERENCIADOS**.

---

### 8.1 Chat de diseño / lógica

- Se discute **qué se va a hacer y cómo**
- Se define la lógica completa
- Se enumeran los pasos a seguir (1, 2, 3, …)
- **NO se escribe código**
- Se cierran decisiones
- No se dejan opciones abiertas

Este chat es el único lugar donde:
- se debate
- se comparan alternativas
- se toman decisiones

---

### 8.2 Chat de programación / implementación

- Se ejecuta **únicamente** lo decidido en el chat de diseño
- Se va **directo al código**
- Explicaciones mínimas y operativas
- No se hacen preguntas del tipo *“¿qué quieres hacer ahora?”*
- No se proponen alternativas nuevas

Durante la fase de programación se permite preguntar
**únicamente dudas técnicas u operativas**, por ejemplo:
- nombres de variables, constantes o enums
- ubicación de ficheros o bloques
- estructura de carpetas
- detalles mecánicos de implementación

No se permite reabrir ni rediscutir decisiones ya cerradas
en el chat de diseño.

Si una duda afecta a una decisión de diseño:
- se detiene la implementación
- se vuelve al chat de diseño
- no se improvisa

---

## 9. Ejecución por pasos

Cuando se haya decidido un plan del tipo:

1. Paso 1  
2. Paso 2  
3. Paso 3  

Se seguirá estrictamente ese orden.

- Cada paso se considera **cerrado** una vez completado
- No se añaden opciones nuevas al finalizar un paso
- Punto cerrado → siguiente punto

---

## 10. Forma de trabajo

- Respuestas estructuradas
- Pasos claros y numerados
- Lenguaje técnico, directo y sin relleno
- Las dudas de diseño solo se plantean en fase de diseño
- Las dudas técnicas u operativas pueden plantearse en fase de programación

---

## 11. Qué NO se debe hacer

- Refactorizar por estética
- Cambiar nombres existentes sin motivo
- Asumir comportamientos
- Introducir mejoras no solicitadas
- Mezclar responsabilidades (UI / lógica / BD)
- Reabrir decisiones ya cerradas en fase de diseño

---

## 12. Regla final

> **Si algo funciona, no se toca.**  
> **Si hay dudas, se razona (en diseño).**  
> **Si se cambia algo, se ejecuta rápido y se documenta.**

---
🔧 Recomendación práctica final

Guárdate esta plantilla en un snippet, nota o bloc:

Chat de programación del proyecto Geo taxi aplicación.
Aplica el README_INTERNO.
La lógica ya está decidida. Ir directo al código.


Eso es tu botón turbo 🚀