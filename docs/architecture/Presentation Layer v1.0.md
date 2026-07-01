# Presentation Layer v1.0

## 0. Propósito

Este documento define la capa de Presentation de TaxiGeo 1.0.

Su función es transformar conocimiento ya resuelto en contratos adecuados para la UI, sin decidir negocio.

Debe leerse junto con:

- `docs/architecture/Project Structure v1.0.md`
- `docs/architecture/Domain Layer v1.0.md`
- `docs/domain/Trip Domain v2.md`

---

## 1. Misión

Presentation traduce.

No decide.

No ejecuta casos de uso.

No accede a persistencia.

No contiene lógica de interfaz interactiva.

### 1.1. Responsabilidades

- proyectar datos;
- construir view models;
- preparar contratos para pantallas;
- dar forma estable a información derivada;
- aislar la UI de los detalles de negocio y de datos.

### 1.2. Responsabilidades que nunca tendrá

- lógica de negocio;
- acceso a SQLite;
- lógica de repositorios;
- gestión de navegación;
- componentes React;
- hooks;
- estado de pantalla;
- decisiones de renderizado.

---

## 2. Filosofía

Presentation existe para ayudar a ver el negocio, no para crear el negocio.

### 2.1. Principios

1. Presentation no inventa significado.
2. Presentation solo transforma lo que ya existe.
3. Presentation no sustituye al dominio.
4. Presentation no sustituye a Application.
5. Presentation no se convierte en UI.
6. Presentation no se convierte en Infrastructure.

### 2.2. Relación con Visual

El dominio visual define identidades visuales estables del negocio cuando ese lenguaje forma parte de TaxiGeo.

Presentation las consume.

No las redefine.

No las convierte en lógica de UI.

---

## 3. Organización oficial

La estructura recomendada es:

```text
src/presentation/
├── trips/
├── workdays/
├── summaries/
├── goals/
├── geo/
└── visual/
```

### 3.1. `trips/`

Proyecciones y contratos de representación para viajes.

### 3.2. `workdays/`

Proyecciones y contratos de representación para jornadas.

### 3.3. `summaries/`

Proyecciones derivadas para resúmenes o informes.

### 3.4. `goals/`

Contratos de representación para objetivos si el producto los expone.

### 3.5. `geo/`

Proyecciones geográficas y contratos de lectura espacial.

### 3.6. `visual/`

Contratos visuales derivados del dominio visual.

---

## 4. Qué puede contener

- view models;
- formatters;
- projectors;
- mappers de representación;
- contratos de salida para UI.

### 4.1. Qué no debe contener

- entidades;
- agregados;
- value objects del dominio;
- repositorios;
- puertos de persistencia;
- casos de uso;
- componentes React;
- hooks.

---

## 5. Modelos derivados

Una representación derivada no pertenece automáticamente al dominio.

Puede derivarse del dominio y seguir sin ser dominio.

Esto aplica a:

- summaries;
- informes;
- exportaciones;
- proyecciones;
- view models;
- estructuras pensadas para pantalla.

---

## 6. Dependencias permitidas

```text
Presentation
  ↓
Domain
  ↓
Application outputs / contracts
```

Presentation puede depender de:

- dominio cuando solo proyecta significado;
- DTOs o resultados de Application;
- primitives neutrales;
- catálogos visuales del dominio.

Presentation no puede depender de:

- UI;
- Infrastructure;
- persistencia;
- SQLite;
- navegación;
- hooks.

