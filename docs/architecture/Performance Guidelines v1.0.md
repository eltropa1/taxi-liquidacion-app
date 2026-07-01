# Performance Guidelines v1.0

## 0. Propósito

Este documento define las guías de rendimiento de TaxiGeo 1.0.

Su función es orientar decisiones de rendimiento sin sacrificar claridad arquitectónica ni introducir optimización prematura.

---

## 1. Principio general

Primero claridad.

Luego medición.

Luego optimización.

No al revés.

---

## 2. Reglas

- no optimizar sin evidencia;
- no sacrificar el modelo del dominio por rendimiento hipotético;
- no duplicar datos sin motivo;
- no mover lógica de negocio a capas técnicas para acelerar;
- no introducir cachés sin necesidad real;
- no convertir presentación en motor de cálculo.

---

## 3. Qué medir

- arranque;
- navegación;
- lectura y escritura;
- rendering de listas;
- generación de proyecciones;
- operaciones repetidas;
- tamaño de datos históricos.

---

## 4. Cómo optimizar

- medir antes de cambiar;
- aislar el cuello de botella;
- preferir claridad sobre microoptimización;
- usar caches solo con evidencia;
- simplificar rutas de datos;
- mantener el dominio intacto.

---

## 5. Anti-patrones

- prematura optimización;
- cache sin criterio;
- duplicar reglas por velocidad;
- mover decisiones de negocio a infraestructura por performance;
- sobrefragmentar modelos para ahorrar ciclos.

