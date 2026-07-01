# Infrastructure Layer v1.0

## 0. Propósito

Este documento define la capa de Infrastructure de TaxiGeo 1.0.

Su función es establecer cómo se implementan los detalles técnicos sin invadir el dominio ni la coordinación de negocio.

Debe leerse junto con:

- `docs/architecture/Project Structure v1.0.md`
- `docs/architecture/Domain Layer v1.0.md`
- `docs/persistence/Persistence Architecture v1.0.md`

---

## 1. Misión

Infrastructure existe para conectar TaxiGeo con el mundo técnico.

Implementa:

- persistencia;
- APIs del dispositivo;
- sistema de archivos;
- geolocalización;
- servicios externos;
- integraciones técnicas.

### 1.1. Responsabilidades

Infrastructure debe:

- implementar puertos definidos por Application;
- aislar detalles técnicos;
- adaptar APIs externas al lenguaje del sistema;
- ejecutar operaciones técnicas reales;
- mantener fuera del dominio las preocupaciones de transporte y almacenamiento.

### 1.2. Responsabilidades que nunca tendrá

Infrastructure nunca debe:

- definir reglas de negocio;
- decidir intenciones;
- cambiar el significado del dominio;
- contener lógica de UI;
- contener presentación;
- contener navegación;
- sustituir a Application;
- sustituir al dominio.

---

## 2. Filosofía

Infrastructure es reemplazable.

### 2.1. Principios

1. El negocio no depende de la tecnología concreta.
2. La tecnología se adapta al negocio, no al revés.
3. Un detalle técnico no debe contaminar el modelo de dominio.
4. Los adaptadores aíslan las APIs externas.
5. La infraestructura no toma decisiones del producto.

### 2.2. Relación con Application

Application define el contrato.

Infrastructure lo implementa.

Eso incluye:

- puertos de persistencia;
- puertos de lectura;
- servicios técnicos;
- adaptadores del dispositivo.

---

## 3. Organización oficial

La estructura oficial de Infrastructure es:

```text
src/infrastructure/
├── persistence/
├── geolocation/
├── filesystem/
└── device/
```

### 3.1. `persistence/`

Implementaciones técnicas de persistencia y sus piezas de apoyo.

### 3.2. `geolocation/`

Adaptadores técnicos de geolocalización.

### 3.3. `filesystem/`

Adaptadores de lectura y escritura de archivos.

### 3.4. `device/`

Adaptadores de capacidades del dispositivo.

---

## 4. Reglas de responsabilidad

### 4.1. Lo que puede hacer

- hablar con SQLite u otro motor técnico;
- ejecutar consultas;
- leer y escribir archivos;
- consumir APIs del sistema;
- transformar datos técnicos en estructuras aptas para Application.

### 4.2. Lo que no puede hacer

- decidir reglas de negocio;
- validar invariantes del dominio;
- inventar datos;
- recalcular significado;
- presentar datos al usuario;
- conocer pantallas o componentes.

---

## 5. Adaptadores

Un adaptador traduce entre dos mundos.

### 5.1. Tipos

- adaptadores de persistencia;
- adaptadores de dispositivo;
- adaptadores de geolocalización;
- adaptadores de sistema de archivos;
- adaptadores de APIs externas.

### 5.2. Reglas

- el adaptador no define el significado;
- el adaptador no es el dominio;
- el adaptador no es Application;
- el adaptador no es Presentation.

---

## 6. Dependencias permitidas

```text
Infrastructure
  ↓
Application ports
  ↓
Domain models
```

Infrastructure puede depender de:

- puertos de Application;
- tipos del dominio necesarios para implementar contratos;
- configuración técnica;
- APIs externas.

Infrastructure no puede depender de:

- UI;
- Presentation;
- navegación;
- hooks;
- componentes React;
- comportamiento de negocio.

---

## 7. Evolución

Infrastructure debe evolucionar cuando cambie la tecnología.

### 7.1. Añadir un adaptador

Se añade cuando aparece una nueva dependencia técnica real.

### 7.2. Sustituir un motor técnico

Se sustituye sin cambiar el significado del dominio.

### 7.3. Evitar acoplamiento

No mezclar:

- acceso a datos con reglas;
- transporte con negocio;
- integración con presentación.

