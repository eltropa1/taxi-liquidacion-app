# Logging & Observability v1.0

## 0. Propósito

Este documento define los principios de logging y observability de TaxiGeo 1.0.

Su función es permitir diagnóstico, trazabilidad y control operativo sin contaminar el dominio ni exponer datos sensibles.

---

## 1. Principio general

La observabilidad sirve para entender el sistema.

No debe cambiar su comportamiento.

No debe revelar datos innecesarios.

---

## 2. Qué se observa

- arranque del sistema;
- composición de dependencias;
- persistencia;
- errores;
- integraciones externas;
- flujos críticos de usuario;
- eventos técnicos relevantes.

---

## 3. Qué no se observa

- secretos;
- credenciales;
- datos personales innecesarios;
- contenido sensible que no aporte valor operativo;
- ruido de diagnóstico sin utilidad.

---

## 4. Reglas de logging

- logs claros y consistentes;
- un evento relevante por línea;
- sin duplicación excesiva;
- sin logging en el dominio por defecto;
- sin logs que sustituyan al error handling.

---

## 5. Reglas de capa

### 5.1. Domain

No debe depender de logging.

### 5.2. Application

Puede registrar eventos de coordinación si aportan valor.

### 5.3. Infrastructure

Puede registrar eventos técnicos, fallos y métricas.

### 5.4. UI

Solo registra trazas de interacción si ayudan a diagnóstico.

---

## 6. Observability

La observability puede incluir:

- logs;
- métricas;
- trazas;
- diagnósticos de arranque;
- reportes de error.

Debe implementarse sin invadir el dominio.

---

## 7. Anti-patrones

- loggear secretos;
- loggear ruido;
- usar logs como lógica de negocio;
- depender del log para entender una regla;
- convertir la consola en una API implícita.

