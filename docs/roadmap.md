# 📱 Estado del Proyecto – App Taxi

Este documento describe **en qué punto está el proyecto**, qué se considera **MVP**, y **cuáles son los siguientes pasos**, para no perder el rumbo ni tomar decisiones prematuras (UI, features, etc.).

---

## 🟢 FASE 1 · MVP FUNCIONAL (COMPLETADA)

**Objetivo:**  
La aplicación debe ser **usable en el día a día** y reflejar fielmente la realidad del trabajo del taxista.

### Alcance
- Registro de viajes
- Apertura y cierre de día
- Historial diario y navegación entre días
- Separación clara entre:
  - recaudación real
  - propinas
  - extras
- Estabilidad en carga de datos (sin reinicios)

### Estado
✅ Funcional  
✅ Estable  
✅ Usable en producción personal  

> En esta fase la **UI no es prioritaria**. La app cumple su función principal.

---

## 🟡 FASE 2 · MVP+ (BASE DE DATOS INTELIGENTE)

**Objetivo:**  
Recoger datos clave de forma silenciosa para permitir **análisis y estadísticas avanzadas en el futuro**, sin cambiar el flujo diario del usuario.

### Alcance previsto
- Geolocalización automática:
  - lugar de recogida
  - lugar de destino
  - sin intervención del usuario
- Registro de kilómetros:
  - al iniciar la jornada
  - al finalizar la jornada
- Lógica de bonos e incentivos:
  - no computan como recaudación
  - se registran como extras
- Preparación de datos para estadísticas futuras

### Estado
🟡 En desarrollo  
📌 Fase crítica: define el futuro del proyecto

> Esta fase **no se ve**, pero condiciona todo lo que vendrá después.

---

## 🔵 FASE 3 · REDISEÑO UI / UX

**Objetivo:**  
Reorganizar la interfaz para **mostrar correctamente los datos que ya existen**.

### Cuándo empezar esta fase
✔ Cuando los datos importantes ya se estén recogiendo  
✔ Cuando las estadísticas “pidan” pantallas propias  
❌ No por motivos estéticos  
❌ No antes de cerrar la Fase 2  

### Alcance típico
- Nuevas pantallas de estadísticas
- Mejor jerarquía visual
- Flujos más claros
- Optimización de navegación

### Estado
⏳ Pendiente (NO iniciar todavía)

---

## ⚪ FASE 4 · APP INTELIGENTE (FUTURO)

**Objetivo:**  
Ayudar a tomar mejores decisiones de trabajo.

### Posibilidades
- Zonas calientes
- Rentabilidad por zona
- €/km
- Comparativas entre plataformas
- Recomendaciones operativas

> Esta fase **solo es posible si la Fase 2 está bien hecha**.

---

## 🧭 REGLAS DEL PROYECTO

- La **UI se cambia cuando los datos lo piden**, no cuando “se ve fea”.
- Todo lo que afecta a:
  - dinero
  - tiempo
  - kilómetros  
  es **estructural y prioritario**.
- No se añaden funcionalidades nuevas si hay **bugs críticos activos**.

---

## 📌 Siguiente foco inmediato
👉 **FASE 2 – MVP+**
1. Geolocalización automática
2. Km inicio / fin de jornada
3. Bonos e incentivos


**ahora toca trabajar en este orden:**

Orden recomendado (decisión final)
🥇 Geolocalización (origen / destino automática)

Base para zonas calientes y rendimiento.

Cuanto antes empiece a recoger datos, mejor.
→ PRIORIDAD MUY ALTA (estructural)

🥈 Km inicio / fin de jornada

Necesario para €/km, eficiencia, análisis real.

Depende del tiempo acumulado.
→ PRIORIDAD MUY ALTA (estructural)

🥉 Contador de servicios

Sencillo.

Muy útil para resúmenes y estadísticas.

No rompe nada.
→ PRIORIDAD MEDIA-ALTA

🟡 Bonos e incentivos

Concepto ya cerrado.

Lógica clara.

Puede esperar sin perder valor.
→ PRIORIDAD MEDIA

🟡 Botón finalizar con emisoras + botón libre

Mejora UX.

No afecta a datos ni estadísticas.
→ PRIORIDAD MEDIA / BAJA

🔵 Estadísticas

NO ahora.

Dependen de geolocalización + km + tiempo.
→ PRIORIDAD BAJA (bloqueada por datos)

🎯 Decisión clara de ejecución

1️⃣ Geolocalización
2️⃣ Km inicio/fin
3️⃣ Contador de servicios
4️⃣ Bonos e incentivos
5️⃣ Emisoras / botón libre
6️⃣ Estadísticas



## GEO – Estado del bloque

- [x] Modelos y tipos
- [x] Catálogo de zonas
- [x] Motor de evaluación de reglas
- [x] Evaluador de zonas (AND estricto)
- [x] Tests unitarios del motor GEO
- [ ] Geocodificación administrativa
- [ ] Integración con viajes
- [ ] Explotación en estadísticas y metas
- [ ] Edición manual controlada

y el git commit que he hecho es: 
Se completa y blinda el motor de geolocalización oficial:

- Implementada evaluación AND estricta de reglas por zona
- Zonas sin reglas se consideran inválidas (fail-safe)
- Reglas desconocidas invalidan la zona
- Contrato explícito GeoRuleEvaluator con supportedType
- Orquestación correcta de evaluadores en GeoZoneEvaluator
- Añadida tolerancia GPS controlada en reglas circulares

Tests añadidos:
- CircleRuleEvaluator (dentro / fuera / borde)
- GeoZoneEvaluator (regla válida, inválida, AND, fallo parcial,
  regla desconocida, zona vacía)

Resultado:
- Motor GEO aislado, extensible y matemáticamente coherente
- Lógica protegida por tests reales
- Bloque GEO cerrado y listo para integración futura

