# Testing Strategy v1.0

## 0. Propósito

Este documento define la estrategia oficial de pruebas de TaxiGeo 1.0.

Su función es proteger el dominio, la arquitectura y los flujos de usuario sin convertir los tests en una segunda implementación del sistema.

---

## 1. Principio general

Los tests deben seguir la arquitectura.

No deben combatirla.

### 1.1. Objetivo

- proteger reglas puras;
- validar coordinación;
- comprobar integración técnica;
- verificar flujos de usuario;
- detectar regresiones de arquitectura.

---

## 2. Niveles de prueba

### 2.1. Unit tests

Validan:

- entidades;
- value objects;
- domain services;
- policies;
- specifications;
- factories;
- casos de uso aislados.

### 2.2. Integration tests

Validan:

- aplicación con infraestructura;
- repositorios concretos;
- mappers;
- persistencia;
- integraciones técnicas.

### 2.3. E2E tests

Validan:

- flujos completos de usuario;
- navegación real;
- integración de pantalla con runtime real.

---

## 3. Ubicación

La ubicación sigue `Project Structure v1.0`.

### 3.1. Reglas

- unit tests cerca del código o en `tests/unit/`;
- integration tests en `tests/integration/`;
- E2E tests en `tests/e2e/`;
- fixtures en `tests/fixtures/`.

---

## 4. Qué se debe probar

- invariantes del dominio;
- casos de uso;
- traducción de errores;
- persistencia;
- proyecciones;
- rutas críticas de usuario;
- bootstrap y composición de dependencias si aportan valor.

---

## 5. Qué no se debe probar

- detalles internos irrelevantes;
- implementación accidental;
- código de UI sin valor funcional;
- estructura privada si no afecta comportamiento;
- lógica duplicada por cada capa.

---

## 6. Pirámide

```text
Muchos unit tests
  ↓
Menos integration tests
  ↓
Aún menos E2E tests
```

La base debe ser amplia.

La cima debe ser pequeña.

---

## 7. Anti-patrones

- tests frágiles por acoplamiento a detalles de UI;
- tests que repiten la implementación;
- tests que mezclan demasiadas responsabilidades;
- tests de integración que solo prueban mocks;
- tests e2e innecesarios para reglas puras.

