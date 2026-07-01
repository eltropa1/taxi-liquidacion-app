# Security Principles v1.0

## 0. Propósito

Este documento define los principios de seguridad de TaxiGeo 1.0.

Su función es proteger datos, usuarios y operación sin convertir la seguridad en un sustituto de la arquitectura.

---

## 1. Principio general

La seguridad debe ser explícita, mínima y coherente con el negocio.

No debe invadir el dominio.

No debe mezclar autorización con representación.

---

## 2. Principios

1. Reducir la exposición de datos.
2. Proteger secretos fuera del código.
3. Validar entradas en los bordes.
4. No confiar en la UI como mecanismo de seguridad.
5. No confiar en Presentation como mecanismo de seguridad.
6. No confiar en el dominio para guardar secretos.
7. Aplicar permisos en los bordes técnicos.

---

## 3. Ámbitos

### 3.1. UI

La UI puede ocultar opciones, pero no define seguridad real.

### 3.2. Application

Application puede verificar precondiciones y permisos de caso de uso.

### 3.3. Infrastructure

Infrastructure aplica mecanismos técnicos: almacenamiento seguro, permisos del dispositivo, acceso a servicios.

### 3.4. Domain

El dominio modela negocio, no permisos técnicos.

---

## 4. Reglas

- no guardar secretos en el código;
- no duplicar credenciales;
- no exponer datos innecesarios;
- no confiar en la pantalla para proteger información;
- no mover reglas de seguridad al dominio si son técnicas;
- no mover reglas de negocio a seguridad técnica.

---

## 5. Anti-patrones

- seguridad dispersa;
- validar permisos solo en UI;
- exponer más datos de los necesarios;
- usar el dominio para ocultar fallos de control;
- mezclar autenticación con representación.

