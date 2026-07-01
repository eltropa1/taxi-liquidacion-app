# Dependency Rules v1.0

## 0. Propósito

Este documento define las reglas de dependencia oficiales de TaxiGeo 1.0.

Su función es proteger la arquitectura evitando acoplamientos que destruyan la separación entre dominio, aplicación, presentación e infraestructura.

Debe leerse junto con:

- `docs/architecture/Project Structure v1.0.md`
- `docs/architecture/Domain Layer v1.0.md`
- `docs/architecture/Application Layer v1.0.md`
- `docs/architecture/Infrastructure Layer v1.0.md`
- `docs/architecture/Presentation Layer v1.0.md`

---

## 1. Regla base

Las dependencias siempre apuntan hacia dentro.

Nunca al revés.

### 1.1. Orden de protección

```text
UI
  ↓
Presentation
  ↓
Application
  ↓
Domain

Infrastructure ───► implementa contratos definidos hacia dentro
```

### 1.2. Regla

Una capa externa puede depender de una interna.

Una capa interna no depende de una externa.

---

## 2. Dependencias permitidas

- `app/` → `src/ui/`, `src/bootstrap/`
- `src/ui/` → `src/presentation/`, `src/application/` a través de coordinación
- `src/presentation/` → `src/domain/` cuando solo proyecta significado
- `src/application/` → `src/domain/`
- `src/infrastructure/` → contratos de `src/application/`

---

## 3. Dependencias prohibidas

- `src/domain/` → `src/application/`
- `src/domain/` → `src/presentation/`
- `src/domain/` → `src/ui/`
- `src/domain/` → `src/infrastructure/`
- `src/application/` → `src/ui/`
- `src/application/` → `src/infrastructure/`
- `src/presentation/` → `src/ui/`
- `src/presentation/` → `src/infrastructure/`
- `src/ui/` → `src/infrastructure/`
- `app/` → `src/infrastructure/` directamente

---

## 4. Dependencias internas del dominio

Las dependencias entre subdominios son excepcionales.

### 4.1. Regla

- un subdominio no debe importar otro por defecto;
- solo se permiten relaciones semánticas estables y documentadas;
- se prohíben dependencias circulares;
- `money`, `distance`, `date-time`, `identity`, `platform` y `payment` pueden actuar como lenguaje común si el significado lo justifica;
- `Trip` y `Workday` no deben contaminarse con detalles internos de subdominios futuros.

### 4.2. Criterio de aceptación

Una dependencia interna solo se admite si:

- existe relación semántica real;
- está documentada;
- mejora claridad;
- no introduce ciclo;
- no puede resolverse mejor con un value object o primitive común.

---

## 5. Shared

`src/shared/` es excepcional.

No es el lugar normal de reutilización.

No puede contener lógica de negocio.

No puede contener conceptos ambiguos.

Si algo tiene significado de negocio, pertenece a un subdominio.

Si algo pertenece a un caso de uso, pertenece a `src/application/`.

---

## 6. Visual

`visual` puede existir como lenguaje de representación estable del negocio.

No es lógica de UI.

No decide pantallas.

No contiene componentes React.

No sustituye a Presentation.

---

## 7. Regla de corrección

Si una dependencia obliga a romper una regla superior, la dependencia es incorrecta.

Si una dependencia solo existe por comodidad, es sospechosa.

Si una dependencia no mejora claridad, debe evitarse.

