# Dependency Injection v1.0

## 0. Propósito

Este documento define la estrategia oficial de Dependency Injection y composition root de TaxiGeo 1.0.

Su función es explicar dónde se crean las dependencias y cómo se conectan contratos con implementaciones sin dispersar la composición por el proyecto.

El único composition root oficial vive en `src/bootstrap/`.

`src/config/di/`, `src/ui/providers/` y `src/bootstrap/providers/` no son composition roots; solo consumen el runtime ya compuesto o aportan metadatos declarativos.

Debe leerse junto con:

- `docs/architecture/Project Structure v1.0.md`
- `docs/architecture/Dependency Rules v1.0.md`
- `docs/architecture/Application Layer v1.0.md`
- `docs/architecture/Infrastructure Layer v1.0.md`

---

## 1. Misión

La inyección de dependencias existe para ensamblar el sistema.

No existe para ocultar arquitectura.

No existe para repartir lógica de negocio.

No existe para crear un segundo centro de decisiones.

---

## 2. Composition root

El composition root oficial vive en `src/bootstrap/`.

`app/_layout.tsx` solo inicia la integración con providers y navegación.

### 2.1. Qué se hace en bootstrap

- cargar configuración;
- inicializar persistencia;
- crear implementaciones concretas;
- conectar puertos con adaptadores;
- crear casos de uso;
- preparar runtime.

### 2.2. Qué no se hace fuera de bootstrap

- instanciar repositorios directamente en componentes;
- crear casos de uso en pantallas;
- resolver persistencia en hooks;
- construir infraestructura fuera del arranque;
- distribuir composición por múltiples lugares.

---

## 3. Providers de React

Los providers de React viven en la UI o en la composición de arranque, pero nunca construyen el grafo de dependencias por sí mismos.

### 3.1. Regla

- los providers consumen runtime ya resuelto;
- no crean infraestructura;
- no crean casos de uso;
- no deciden negocio;
- no actúan como composition root.

---

## 4. Contratos e implementaciones

### 4.1. Contrato

Un contrato define lo que la aplicación necesita.

### 4.2. Implementación

La implementación concreta vive en Infrastructure.

### 4.3. Regla

Application define.

Infrastructure implementa.

UI consume.

---

## 5. Inyección por capa

### 5.1. Application

Recibe puertos y servicios necesarios para ejecutar casos de uso.

### 5.2. Infrastructure

Recibe configuración y dependencias técnicas para construir adaptadores.

### 5.3. UI

Recibe el runtime ya compuesto.

---

## 6. Anti-patrones

- crear dependencias en el componente;
- resolver el motor técnico dentro de la pantalla;
- crear singletons de negocio dispersos;
- acoplar UI e infraestructura por conveniencia;
- mezclar composición con lógica de negocio.

