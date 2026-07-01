# Architectural Decision Process v1.0

## 0. Propósito

Este documento define el proceso oficial para tomar decisiones arquitectónicas en TaxiGeo 1.0.

Su función es asegurar que la arquitectura evolucione de forma coherente con el dominio y con los documentos rectores ya aprobados.

---

## 1. Fuente de verdad

La base de decisión es:

- `docs/00-product-construction-principles.md`
- `docs/domain/Trip Domain v2.md`
- `docs/persistence/Persistent Model v1.0.md`
- `docs/persistence/Persistence Architecture v1.0.md`
- `docs/architecture/Project Structure v1.0.md`
- `docs/architecture/Domain Layer v1.0.md`

Si una decisión contradice esos documentos, la decisión es incorrecta.

---

## 2. Proceso

### 2.1. Identificar

Definir qué problema existe realmente.

### 2.2. Clasificar

Determinar si el problema pertenece a:

- dominio;
- aplicación;
- presentación;
- infraestructura;
- persistencia;
- configuración;
- seguridad;
- rendimiento;
- test.

### 2.3. Justificar

Explicar por qué la solución propuesta es coherente con el negocio y con la arquitectura.

### 2.4. Validar contra documentos rectoras

Comprobar que no contradice los principios ya aprobados.

### 2.5. Aprobar o rechazar

Solo se aprueba si la coherencia está clara.

---

## 3. Criterios de aprobación

Una decisión arquitectónica es aceptable si:

- mejora claridad;
- respeta fronteras;
- evita duplicación;
- no infla el core;
- no crea dependencias innecesarias;
- deja el dominio intacto.

---

## 4. Criterios de rechazo

Una decisión debe rechazarse si:

- existe solo por comodidad;
- contradice el modelo del dominio;
- mezcla capas;
- crea un cajón de sastre;
- multiplica conceptos sin necesidad;
- convierte un derivado en núcleo.

---

## 5. Gobernanza

Toda decisión relevante debe:

- documentarse;
- ser rastreable;
- ser revisable;
- tener dueño claro;
- poder justificarse con lenguaje del negocio.

---

## 6. Regla final

Si una decisión no puede explicarse en términos de negocio, arquitectura y límites de capa, no debe adoptarse.

