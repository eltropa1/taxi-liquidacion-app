# Persistence Layer v1.0

## 0. Propósito

Este documento define la capa de persistencia de TaxiGeo 1.0 desde el punto de vista arquitectónico.

Su función es fijar cómo se conserva la memoria operativa del sistema sin convertir la persistencia en fuente de verdad.

Debe leerse junto con:

- `docs/persistence/Persistent Model v1.0.md`
- `docs/persistence/Persistence Architecture v1.0.md`
- `docs/architecture/Domain Layer v1.0.md`
- `docs/architecture/Project Structure v1.0.md`

---

## 1. Misión

La persistencia existe para conservar hechos del negocio.

No decide comportamiento.

No redefine el modelo.

No corrige el dominio.

### 1.1. Qué conserva

- `Trip`;
- `Workday`;
- conocimiento parcial válido;
- referencias necesarias para reconstrucción;
- datos derivados solo cuando sean necesarios como soporte técnico, nunca como verdad primaria.

### 1.2. Qué no conserva como verdad primaria

- estadísticas;
- objetivos;
- informes;
- proyecciones;
- identidad visual;
- reglas de presentación;
- geolocalización cruda si no forma parte del núcleo persistente aprobado.

---

## 2. Filosofía

Persistencia representa al dominio, no al revés.

### 2.1. Principios

1. La persistencia guarda hechos, no interpretaciones.
2. Lo derivable no se persiste como conocimiento primario.
3. La ausencia de información opcional no invalida la identidad.
4. La persistencia no toma decisiones de negocio.
5. La reconstitución devuelve al dominio el mismo hecho, no uno nuevo.

### 2.2. Relación con Application

Application coordina lectura y escritura mediante puertos.

Infrastructure implementa esos puertos.

La persistencia no pertenece a Domain.

---

## 3. Organización oficial

La persistencia vive dentro de Infrastructure:

```text
src/infrastructure/persistence/
├── database/
├── mappers/
├── repositories/
└── migrations/
```

### 3.1. `database/`

Inicialización técnica, conexión y acceso de bajo nivel.

### 3.2. `mappers/`

Traducción entre representaciones técnicas y objetos del dominio.

### 3.3. `repositories/`

Implementaciones concretas de los puertos de Application.

### 3.4. `migrations/`

Evolución técnica del esquema de TaxiGeo 1.0.

---

## 4. Reglas de persistencia

### 4.1. Qué puede hacer

- leer representaciones técnicas;
- reconstituir agregados;
- guardar cambios válidos;
- evolucionar el esquema técnico;
- conservar conocimiento parcial.

### 4.2. Qué no puede hacer

- decidir significado;
- inventar información;
- combinar reglas de negocio;
- convertir datos técnicos en dominio alternativo;
- corregir el negocio silenciosamente.

---

## 5. Mappers

Los mappers convierten entre el modelo físico y el modelo del dominio.

### 5.1. Regla

- traducen;
- no calculan negocio;
- no alteran identidad;
- no redefinen estados.

### 5.2. Riesgo a evitar

Un mapper no debe convertirse en una segunda capa de dominio.

---

## 6. Reposición de modelos

La persistencia debe mantener:

- identidad estable;
- conocimiento parcial;
- relación por identidad entre agregados;
- reconstrucción coherente.

No debe mantener como verdad primaria:

- estados derivados;
- agregaciones;
- vistas;
- informes;
- exportaciones.

---

## 7. Migración histórica

La migración histórica del prototipo no es una migración técnica normal.

### 7.1. Convención

- las migraciones normales evolucionan el esquema de TaxiGeo 1.0;
- la migración histórica importa datos del prototipo al nuevo modelo;
- la migración histórica vive en scripts o infraestructura específica;
- la migración histórica no introduce reglas de negocio nuevas.

### 7.2. Regla

No mezclar migración histórica con seeds ni con migraciones técnicas de rutina.

