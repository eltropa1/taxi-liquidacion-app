# Configuration v1.0

## 0. Propósito

Este documento define la estrategia oficial de configuración de TaxiGeo 1.0.

Su función es establecer qué pertenece a configuración y cómo debe organizarse sin mezclarlo con negocio ni con infraestructura concreta.

---

## 1. Principio general

La configuración describe cómo se ejecuta el sistema.

No describe el negocio.

No describe la UI.

No describe el dominio.

---

## 2. Ámbitos

### 2.1. Configuración raíz

Los archivos raíz como `package.json`, `tsconfig.json`, `eslint.config.js`, `jest.config.js`, `metro.config.js`, `eas.json` y `app.json` describen la forma de construir y ejecutar el proyecto.

### 2.2. Configuración runtime

`src/config/` contiene configuración tipada, entorno, feature flags, metadatos declarativos de wiring y valores calculados al arranque.

`src/config/` no es un composition root.

La composición real del sistema vive en `src/bootstrap/`.

---

## 3. Reglas

- la configuración no contiene reglas de negocio;
- la configuración no contiene UI;
- la configuración no contiene persistencia;
- la configuración no contiene datos que pertenezcan al dominio;
- la configuración debe ser explícita y trazable.

---

## 4. Organización oficial

```text
src/config/
├── env/
├── di/
├── feature-flags/
└── runtime/
```

### 4.1. `env/`

Lectura y validación del entorno.

### 4.2. `di/`

Metadatos declarativos de composición de dependencias consumidos por `src/bootstrap/`.

`di/` no instancia objetos ni construye el grafo de dependencias por sí mismo.

### 4.3. `feature-flags/`

Activadores de comportamiento.

### 4.4. `runtime/`

Valores calculados durante la inicialización.

---

## 5. Anti-patrones

- usar configuración para esconder lógica;
- duplicar valores de dominio;
- repartir constantes de negocio por archivos técnicos;
- mezclar flags con reglas del producto.
