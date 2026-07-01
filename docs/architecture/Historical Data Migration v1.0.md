# Historical Data Migration v1.0

## Estado

Documento normativo sobre una tarea puntual de transición.

No define negocio.

No define dominio.

No define arquitectura de runtime.

---

## 1. Propósito

Definir la migración única de los datos históricos del prototipo al modelo oficial de TaxiGeo 1.0.

Esta migración existe para preservar el patrimonio de datos reales generado durante el prototipo sin contaminar el dominio ni las migraciones técnicas normales.

---

## 2. Alcance

La migración histórica puede importar únicamente información que tenga una correspondencia clara con el modelo oficial.

Como mínimo puede tratar:

- viajes;
- jornadas;
- referencias y catálogos necesarios para reconstrucción;
- datos derivados que deban conservarse por valor histórico explícito.

No debe intentar reconstruir conceptos que no existan en la arquitectura oficial.

---

## 3. Separación respecto a migraciones normales

Las migraciones normales:

- evolucionan el esquema técnico de TaxiGeo 1.0;
- viven en `src/infrastructure/persistence/migrations/`;
- forman parte del ciclo normal del producto.

La migración histórica:

- importa datos desde el prototipo;
- vive fuera del runtime normal, en `scripts/migration/` o una subcarpeta equivalente;
- se ejecuta una sola vez por objetivo de transición;
- no debe mezclarse con seeds;
- no debe confundirse con una migración técnica ordinaria.

---

## 4. Responsabilidades

La migración histórica debe:

- leer el origen antiguo;
- transformar datos al modelo oficial;
- validar correspondencias explícitas;
- registrar pérdidas de información cuando no exista equivalencia;
- escribir en el nuevo modelo sin introducir reglas de negocio nuevas.

No debe:

- crear comportamiento de dominio;
- depender de UI;
- depender de casos de uso del producto;
- convertirse en una vía paralela de acceso al dominio;
- decidir semántica nueva para datos antiguos.

---

## 5. Reglas

1. La migración histórica no modifica el dominio oficial.
2. La migración histórica no redefine agregados.
3. La migración histórica no debe ejecutarse en runtime normal.
4. La migración histórica debe ser idempotente o explícitamente controlada como tarea única.
5. La migración histórica debe ser trazable y revisable.
6. La migración histórica debe conservar solo lo que pueda justificarse ante el modelo oficial.

---

## 6. Limitaciones

Si un dato del prototipo no tiene lugar en TaxiGeo 1.0:

- no se inventa un nuevo modelo para retenerlo;
- no se infiltra en el dominio;
- no se convierte en una excepción de arquitectura.

La prioridad es preservar el núcleo válido del producto, no transportar todas las decisiones históricas.

