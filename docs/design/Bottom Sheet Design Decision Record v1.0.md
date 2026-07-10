# Bottom Sheet Design Decision Record v1.0

## Estado

Aprobado.

Congelado.

Listo para implementación.

---

## 1. Problema de producto

GeoTaxi necesitaba un flujo para completar un servicio sin romper el contexto operativo de la Home, sin introducir navegación adicional y sin crear un lenguaje visual nuevo.

El objetivo era integrar la finalización del servicio dentro del sistema de diseño existente, manteniendo reconocimiento inmediato, mínima fricción y continuidad visual con la aplicación actual.

---

## 2. Solución aprobada

Se aprueba un bottom sheet contextual para "Completar servicio" que:

- aparece sobre la Home sin reemplazarla;
- reutiliza literalmente el Design System existente de GeoTaxi;
- prioriza el importe como elemento principal;
- muestra únicamente las identidades visuales relevantes ya configuradas;
- mantiene dos acciones explícitas: `Guardar servicio` y `Completar despues`;
- evita títulos de sección innecesarios;
- cierra el sheet al guardar o completar despues;
- no introduce comportamiento funcional nuevo en esta fase.

---

## 3. Principios de diseño

- Minimalismo contextual.
- Continuidad con la Home V2.
- Reutilizacion literal de componentes visuales existentes.
- Reconocimiento antes que reinterpretacion.
- Una decision principal por pantalla.
- Mantener el contexto operativo en todo momento.
- No añadir navegacion donde no la necesita el flujo.

---

## 4. Fuentes de verdad

Los siguientes documentos quedan como fuente oficial y cerrada para este flujo:

- [GeoTaxi Operational Event Model v1.0.md](/C:/Users/monic/Desktop/geo/taxi-liquidacion-app/docs/architecture/GeoTaxi%20Operational%20Event%20Model%20v1.0.md)
- [Bottom-Sheet-Completar-servicio-Fase-1.md](/C:/Users/monic/Desktop/geo/taxi-liquidacion-app/docs/design/Bottom-Sheet-Completar-servicio-Fase-1.md)
- [Bottom-Sheet-Completar-servicio-Fase-2.md](/C:/Users/monic/Desktop/geo/taxi-liquidacion-app/docs/design/Bottom-Sheet-Completar-servicio-Fase-2.md)
- [Bottom-Sheet-Completar-servicio-Mockup-v1.md](/C:/Users/monic/Desktop/geo/taxi-liquidacion-app/docs/design/Bottom-Sheet-Completar-servicio-Mockup-v1.md)

---

## 5. Cierre

La investigacion y definicion visual del flujo "Completar servicio" queda cerrada.

No se esperan nuevas decisiones de producto para este flujo.
