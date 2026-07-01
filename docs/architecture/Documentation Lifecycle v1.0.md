# Documentation Lifecycle v1.0

## 0. Propósito

Este documento define los estados oficiales de la documentación de TaxiGeo 1.0 y las reglas para cambiar entre ellos.

Su objetivo es evitar contradicciones entre documentos, separar lo normativo de lo histórico y dejar claro qué puede considerarse rector.

---

## 1. Estados documentales

### 1.1. Draft

Documento en construcción.

Puede cambiar libremente.

No tiene autoridad normativa.

### 1.2. Review

Documento sometido a auditoría o revisión.

Puede recibir correcciones antes de aprobarse.

No tiene autoridad normativa.

### 1.3. Approved

Documento validado como coherente con la arquitectura vigente.

Todavía puede requerir una declaración adicional para pasar a estado normativo.

### 1.4. Normative

Documento rector.

Define reglas obligatorias del sistema.

No debe contradecirse desde documentos de menor jerarquía.

### 1.5. Historical

Documento conservado solo como referencia de contexto o evolución.

No tiene autoridad normativa.

### 1.6. Deprecated

Documento todavía legible, pero con sustitución prevista o recomendada.

No debe usarse como base para decisiones nuevas.

### 1.7. Superseded

Documento reemplazado por otro más reciente y más autoritativo sobre el mismo tema.

Su contenido puede mantenerse por trazabilidad, pero su lectura debe ser histórica.

### 1.8. Archived

Documento congelado.

Se conserva como registro final.

No se actualiza salvo para corregir metadatos de estado.

---

## 2. Jerarquía de autoridad

La jerarquía documental oficial es:

1. Normative.
2. Approved.
3. Historical / Deprecated / Superseded / Archived.
4. Draft / Review.

Un documento de menor jerarquía nunca puede anular uno de mayor jerarquía.

---

## 3. Transiciones permitidas

### 3.1. Draft -> Review

Cuando el contenido está suficientemente completo para ser auditado.

### 3.2. Review -> Approved

Cuando la revisión confirma coherencia arquitectónica.

### 3.3. Approved -> Normative

Cuando el documento pasa a ser referencia obligatoria.

### 3.4. Normative -> Superseded

Cuando existe una nueva versión oficial que reemplaza a la anterior.

### 3.5. Normative -> Deprecated

Cuando la sustitución está prevista pero todavía no cerrada.

### 3.6. Deprecated -> Superseded o Archived

Cuando la sustitución se completa o el documento se retira.

### 3.7. Historical -> Archived

Cuando el documento solo debe conservarse como registro cerrado.

---

## 4. Quién puede cambiar el estado

Solo puede cambiar el estado documental quien tenga responsabilidad explícita sobre la arquitectura del proyecto.

Las promociones a Normative requieren validación de coherencia con los documentos rectores vigentes.

Los documentos ya Normative no deben modificarse para reintroducir contradicciones con documentación anterior.

Si un documento rector cambia, la versión anterior debe quedar claramente marcada como Superseded o Historical.

---

## 5. Sustitución de versiones

Cuando un documento reemplaza a otro:

1. El nuevo documento se revisa y aprueba.
2. El documento anterior se marca como Superseded o Archived.
3. El documento anterior deja de usarse como autoridad.
4. El nuevo documento pasa a ser la referencia activa.

No deben coexistir dos documentos con autoridad equivalente sobre el mismo tema si se contradicen.

---

## 6. Prevención de contradicciones

Para evitar contradicciones futuras:

- cada tema arquitectónico debe tener un único documento rector;
- los documentos históricos deben declarar explícitamente su estado;
- las referencias cruzadas deben apuntar a documentos vigentes;
- los cambios normativos deben pasar por auditoría;
- ningún documento histórico puede competir con uno normativo;
- una versión antigua no debe reescribirse como si siguiera siendo rector.

---

## 7. Regla final

Si un documento no indica su estado, debe tratarse como no confiable hasta verificar su contexto y su relación con la arquitectura vigente.

