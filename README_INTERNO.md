# README_INTERNO.md  
## Geo taxi aplicación

---

## 1. Propósito del documento

Este documento define las **reglas fijas y no negociables** del desarrollo de la aplicación **Geo taxi aplicación**.

No es documentación técnica ni de usuario.  
Es un **contrato interno de desarrollo**.

Cualquier cambio que contradiga este documento debe:
- justificarse explícitamente
- revisarse conscientemente
- y asumirse como excepción

---

## 2. Principios fundamentales del proyecto

1. **Estabilidad > nuevas funcionalidades**
2. **Los datos históricos nunca se rompen**
3. **Primero se razona, luego se programa**
4. **Cambios mínimos y controlados**
5. **Si algo funciona, no se toca**

---

## 3. Reglas generales de desarrollo

### 3.1 Alcance

- No se añaden funcionalidades nuevas si no se solicitan explícitamente.
- No se aprovecha un cambio para introducir mejoras colaterales.
- Cada chat y cada cambio tiene un objetivo único y definido.

---

### 3.2 Código

Cuando se escriba código, **SIEMPRE**:

- Código **bien comentado y documentado**
- Comentarios orientados a **lógica de negocio**, no obvios
- Sin refactorizaciones por estética o preferencia personal
- Sin cambios de nombres, estructuras o estilos si no es imprescindible

---

### 3.3 Cambios permitidos

- Cambiar solo lo estrictamente necesario
- Evitar reescrituras completas
- Mantener compatibilidad hacia atrás

---

## 4. Rutas de archivos (obligatorio)

Siempre que se proponga modificar código:

- Se indicará la **ruta absoluta del archivo**
- Si hay varios archivos, se listarán y se explicará el cambio en cada uno

Ejemplo:

/src/services/TripService.ts
→ Corrección de la carga inicial de viajes

/src/screens/DayHistoryScreen.tsx
→ Ajuste de estado cuando el día está cerrado


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

## 8. Organización de chats del proyecto

Cada chat debe tener un objetivo claro y único:

- 🔴 **Bugs críticos**  
  - Sin nuevas funcionalidades  
  - Prioridad absoluta a estabilidad

- 🟡 **Lógica de negocio**  
  - Sin tocar UI  
  - Sin escribir código hasta validar lógica

- 🟢 **UI / pantallas**  
  - Sin tocar base de datos

- 🔵 **Base de datos**  
  - Cambios controlados y explicados

- 🟣 **Estadísticas y cálculos**  
  - Solo lectura de datos existentes

Lo que no pertenece al objetivo del chat **no se toca**.

---

## 9. Forma de trabajo

- Respuestas estructuradas
- Pasos claros y numerados
- Lenguaje técnico, directo y sin relleno
- Si algo no está claro, se pregunta antes de actuar

---

## 10. Qué NO se debe hacer

- Refactorizar por estética
- Cambiar nombres existentes sin motivo
- Asumir comportamientos
- Introducir mejoras no solicitadas
- Mezclar responsabilidades (UI / lógica / BD)

---

## 11. Regla final

> **Si algo funciona, no se toca.**  
> **Si hay dudas, se razona.**  
> **Si se cambia algo, se documenta.**

---
