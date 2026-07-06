# 🌿 Diego Nutrición

App web (PWA) para gestionar el plan nutricional de un niño con restricciones
alimentarias (sin gluten, caseína, colorantes ni preservantes) — menú diario, recetas,
lista de compras y control de inventario, todo en un solo lugar y funcionando sin
internet una vez instalada.

**App en vivo:** https://intinabyc.github.io/Alll/

---

## ¿Qué hace?

### 📅 Menú del Día
Muestra automáticamente el menú de hoy según el plan nutricional (2100 kcal, 89g
proteína/día), con recordatorios de vitamina D, agua, y un toggle para días de
natación que ajusta las porciones de proteína en la cena.

### 🍳 Recetas
12 recetas con rotación inteligente: prioriza las del tubérculo del día y las que no
se han preparado hace más tiempo.

### 🛒 Compras
- Lista de compras diaria, semanal o mensual con checkboxes (se resetean solas cada día).
- Registro real de lo que se compró: cantidad en kg, merma en gramos, precio por kg,
  con cálculo automático de costo neto. Incluye carga de foto de factura con
  extracción automática por IA u OCR.
- Gasto por categoría (semanal/mensual) y comparación de mejor precio por lugar de compra.

### 📦 Inventario
- Stock estimado por producto con alertas cuando queda poco (🟡 ≤7 días, 🔴 ≤1 día).
- El consumo estimado respeta los ajustes manuales de cantidades y las excepciones
  puntuales del plan — no se queda pegado al gramaje fijo original.
- Corrección manual de stock cuando la realidad no coincide con el cálculo (mermas
  reales, porciones distintas al plan, algo se dañó, etc.).

### ⚙️ Ajustes
Matriz editable de cantidades por ingrediente × comida, más excepciones puntuales para
un solo día (ej. un cumpleaños), todo editable después de creado.

### ☁️ Respaldo en la nube (opcional)
Sincronización entre dispositivos vía Firebase con un "código de familia" — no
requiere crear cuenta. *(En pausa actualmente, ver `CONTINUIDAD.md`.)*

### 📲 Instalable como app
Funciona como PWA: se puede instalar en el teléfono y usar sin conexión a internet
una vez cargada por primera vez.

---

## Tecnología

- **Frontend:** HTML + CSS + JavaScript vanilla — un solo archivo (`index.html`), sin
  frameworks ni build step.
- **Almacenamiento:** `localStorage` del navegador (todo funciona sin backend).
- **Respaldo opcional:** Firebase (Auth anónimo + Firestore).
- **Extras:** Tesseract.js (OCR de facturas), API de Anthropic (lectura de facturas
  por IA), dolarapi.com (tasa de cambio BCV).
- **Hosting:** GitHub Pages.

## Estructura del repo

```
index.html      → toda la app (HTML + CSS + JS en un solo archivo)
manifest.json   → configuración de la PWA
sw.js           → Service Worker (offline + actualizaciones)
icon-192.png    → íconos de la PWA
icon-512.png
```

## Cómo desplegar tu propia copia

1. Haz un fork de este repo.
2. En **Settings → Pages**, activa GitHub Pages apuntando a la rama principal.
3. *(Opcional)* Si quieres el respaldo en la nube, crea un proyecto en
   [Firebase](https://console.firebase.google.com), activa Firestore + Authentication
   anónimo, y pega tu configuración en `FIREBASE_CONFIG` dentro de `index.html`.
   Ver `DEPLOY.md` para el paso a paso.

## Estado del proyecto

Este es un proyecto personal en desarrollo activo. El historial técnico completo —
qué está hecho, qué está pendiente, decisiones de diseño y bugs conocidos — vive en
[`CONTINUIDAD.md`](./CONTINUIDAD.md).

---

*Hecho a la medida de un plan nutricional real, supervisado por nutricionista.*
