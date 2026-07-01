# Error Handling v1.0

## 0. Propósito

Este documento define la estrategia oficial de manejo de errores de TaxiGeo 1.0.

Su función es mantener la semántica del fallo clara, predecible y coherente entre capas.

---

## 1. Principio general

Cada capa debe expresar sus propios errores.

Los errores no deben perder significado al pasar de una capa a otra.

### 1.1. Regla base

- el dominio emite errores de dominio;
- Application traduce o envuelve errores de coordinación;
- Infrastructure emite errores técnicos;
- Presentation y UI convierten errores en mensajes o estados de interfaz.

---

## 2. Errores del dominio

El dominio usa errores para expresar que una operación rompe una regla del negocio.

### 2.1. Propiedades

- semánticos;
- explícitos;
- estables;
- independientes del framework.

### 2.2. Qué nunca debe lanzar el dominio

- errores de red;
- errores de base de datos;
- errores de UI;
- errores de permisos;
- errores genéricos sin significado.

---

## 3. Errores de Application

Application puede:

- validar precondiciones de uso;
- envolver errores de dominio;
- expresar fallos de coordinación;
- traducir fallos técnicos a una salida más estable.

Application no debe ocultar errores del dominio.

---

## 4. Errores de Infrastructure

Infrastructure emite fallos técnicos:

- persistencia;
- conectividad;
- permisos;
- archivos;
- APIs externas.

Esos errores se traducen hacia arriba.

No se convierten en reglas del negocio.

---

## 5. Errores de Presentation y UI

Presentation y UI deben transformar errores en:

- mensajes;
- estados vacíos;
- banners;
- modales;
- alertas;
- reintentos.

No deben inventar significado.

---

## 6. Reglas de traducción

- no perder contexto;
- no ocultar causa;
- no duplicar mensajes en capas distintas;
- no usar errores técnicos como mensajes de negocio;
- no usar mensajes de negocio como fallos técnicos.

---

## 7. Anti-patrones

- lanzar excepciones genéricas por comodidad;
- atrapar todo y silenciarlo;
- convertir un error técnico en una regla;
- usar una pantalla para decidir semántica del fallo;
- repetir la misma traducción en varias capas.

