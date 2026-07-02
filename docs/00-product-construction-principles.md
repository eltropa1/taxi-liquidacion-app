# Product Construction Principles

## Misión

Este documento define cómo debe construirse TaxiGeo.

Su objetivo es evitar que las decisiones de implementación se basen en las limitaciones del prototipo existente en lugar de en el dominio y la arquitectura aprobados.

Todo cambio realizado en TaxiGeo debe respetar estos principios.

---

# 1. TaxiGeo no se está refactorizando

TaxiGeo no está siendo refactorizado.

Tampoco está migrando un sistema legado.

El código actual fue un prototipo de descubrimiento.

Ese prototipo cumplió perfectamente su misión:

- descubrir el trabajo real del taxista;
- validar funcionalidades;
- descubrir reglas de negocio;
- identificar necesidades reales;
- aprender cómo debe funcionar el producto.

El objetivo actual no es mejorar ese código.

El objetivo es construir correctamente el producto utilizando todo el conocimiento obtenido durante el prototipo.

---

# 2. El verdadero patrimonio del proyecto

El patrimonio de TaxiGeo no es el código.

El patrimonio del proyecto es:

- el conocimiento del negocio;
- el conocimiento del trabajo diario del taxista;
- las reglas descubiertas;
- las decisiones de producto ya validadas;
- los datos históricos registrados por los usuarios.

Todo lo demás puede cambiar.

---

# 3. El dominio es la fuente de verdad

El dominio aprobado representa la realidad del negocio.

Si aparece un conflicto entre:

- el dominio;
- el código existente;

siempre prevalece el dominio.

Nunca se modifica el dominio para adaptarlo a una implementación anterior.

Siempre se adapta la implementación al dominio.

---

# 4. La arquitectura también es la fuente de verdad

La arquitectura aprobada no describe el código existente.

Describe el producto que queremos construir.

Si una implementación contradice la arquitectura:

la implementación debe cambiar.

No la arquitectura.

---

# 5. El código no tiene privilegios

El hecho de que una solución ya exista no constituye un motivo para conservarla.

Cada componente debe responder únicamente a esta pregunta:

"¿Es ésta la forma correcta de construir TaxiGeo hoy, con todo lo que sabemos?"

Si la respuesta es no:

debe rehacerse.

Aunque ya funcione.

Aunque implique eliminar grandes cantidades de código.

---

# 6. La base de datos forma parte de la arquitectura

La base de datos no es intocable.

Puede:

- cambiar;
- reorganizarse;
- renombrarse;
- normalizarse;
- simplificarse;
- rediseñarse completamente.

Debe representar correctamente el dominio.

No al revés.

---

# 7. Los únicos datos que deben conservarse

Lo único que debe sobrevivir al prototipo son los datos históricos de los usuarios.

Especialmente:

- viajes;
- jornadas;
- información registrada.

Si es necesario se desarrollará una migración única desde el modelo antiguo al nuevo.

La compatibilidad permanente no es un objetivo.

---

# 8. Las funcionalidades sí se conservan

Las funcionalidades que aportan valor al taxista deben mantenerse o mejorarse.

La implementación histórica de esas funcionalidades no tiene por qué conservarse.

---

# 9. La interfaz también puede cambiar

La interfaz actual forma parte del prototipo.

Puede rediseñarse completamente.

La prioridad actual es construir correctamente el núcleo del producto.

Posteriormente se desarrollará la experiencia de usuario definitiva.

---

# 10. Cómo debe tomarse cada decisión

Ante cualquier decisión técnica debe responderse únicamente a esta pregunta:

"Si hoy empezáramos TaxiGeo desde cero, con todo el conocimiento adquirido durante el prototipo, ¿cómo lo construiríamos?"

Esa respuesta debe guiar la implementación.

Nunca la estructura heredada.

---

# Regla de oro

Siempre que exista un conflicto entre:

- adaptar el dominio al código existente;

o

- adaptar el código al dominio;

siempre se adaptará el código al dominio.

Nunca al contrario.

---

# Declaración oficial del proyecto

TaxiGeo no se está refactorizando.

TaxiGeo se está construyendo correctamente por primera vez utilizando todo el conocimiento obtenido durante el prototipo.

Este principio tiene prioridad sobre cualquier decisión de implementación.

---

# 11. La operativa del taxista tiene prioridad sobre el enriquecimiento de datos

La misión principal de TaxiGeo es registrar de forma rápida, estable y fiable la actividad económica del taxista.

Los datos de enriquecimiento aportan un enorme valor para estadísticas, análisis, inteligencia artificial y evolución futura del producto, pero nunca pueden bloquear la operativa diaria.

Este principio se desarrolla como norma arquitectónica en `docs/architecture/Prioridad Operativa y Enriquecimiento de Datos v1.0.md`.
