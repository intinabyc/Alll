# 📋 Proyecto Diego Nutrición — Continuidad (v15)

## ✅ COMPLETADO — Compras reestructurado en súper-pestañas

Se hizo la reestructuración que había quedado pendiente en `VERIFICAR_BUGS.md`
(sección 6): "Registrar compra" ya no vive en el mismo scroll largo que "Lista de
compras" — ahora son dos súper-pestañas dentro de Compras:
- **📋 Lista de compras**: Diaria / Semanal / Mensual / Por días (todo lo que ya
  existía en esa parte, sin tocar su contenido).
- **🧾 Registrar compra**: banner de tasa BCV, formulario de lote, factura,
  gasto, mejor precio por lugar, historial (todo lo que ya existía, sin tocar su
  contenido).

Se hizo en 3 pasos, verificando sintaxis después de cada uno:
1. CSS: `.compras-super-selector` / `.compras-super-tab` / `.compras-super-tab.active`.
2. HTML: agregado el selector de 2 pestañas + envueltos los dos bloques existentes en
   `<div id="compras-super-lista">` y `<div id="compras-super-registrar"
   style="display:none;">` — SIN reescribir el contenido interno de ninguno de los
   dos, solo se envolvió.
3. JS: nueva función `cambiarSuperTabCompras(tab, btn)`, que alterna la visibilidad de
   ambos divs y, al entrar a "Registrar compra", llama a `renderComprasRegistro()` +
   `poblarLugaresInv()` + `actualizarTasaBCV(true)` si no hay tasa cargada (mismas
   funciones que ya existían, confirmados sus nombres reales antes de usarlas).

**Validado:** sintaxis de los 4 bloques `<script>` sin errores, los IDs
`compras-super-lista` / `compras-super-registrar` aparecen exactamente una vez cada
uno en el HTML, y la función `cambiarSuperTabCompras` está definida.

### Qué falta probar en vivo
- Que al tocar "🧾 Registrar compra" se vea el formulario completo (tasa BCV,
  selector de productos, historial) y que el botón "Guardar" siga funcionando igual
  que antes (no se tocó su lógica, solo se envolvió visualmente).
- Que "📋 Lista de compras" (con sus 4 sub-pestañas Diaria/Semanal/Mensual/Por días)
  se vea igual que antes de este cambio.

---



## 🐞 BUG CORREGIDO — La calculadora "Por días" también usaba promedio plano

Diego detectó, probando en vivo, que para "1 día" la calculadora decía "necesitas
457g de Ocumo" — un número que no corresponde a ningún día real. Causa: al portar la
función desde `index-1.html` (v13) usé `consumoSemanal.valor / 7 × días`, el MISMO
tipo de promedio plano que ya habíamos corregido para el cálculo de stock. Para un
período de 1 día esto es casi siempre incorrecto: un producto que solo se usa
martes/viernes necesita 0 la mayoría de los días y su ración COMPLETA esos días, no
"un poquito parejo cada día".

**Corregido:** `renderCalculadoraComprasPorDias(dias)` ahora recorre los próximos
`dias` días A PARTIR DE HOY (`DIAS_ES[fecha.getDay()]` día por día) y suma el consumo
real de cada uno, usando exactamente las mismas funciones que ya usa el cálculo de
stock (`getConsumoDiaProducto` para tubérculo/vegetal/fruta, `getPorcionesDiaPlan`
para proteínas — proteínas ahora SÍ aparecen en la calculadora, antes se excluían).
Si un producto no toca en ninguno de esos días, no aparece en la lista (antes
siempre aparecía con un número inventado).

**Validado con datos reales (hoy = miércoles):**
- Ocumo: 1 día → 0g (miércoles no es día de Ocumo) · 7 días → 2560g (total real de
  la semana completa)
- Auyama: 1 día → 0g · 7 días → 450g
- Pollo: 1 día → 2 porciones

### ⚠️ Inconsistencia de fondo que queda anotada (no es un bug de esta función)
Para 7 días, esta calculadora ahora da el total REAL del PLAN (Ocumo: 2560g), que
puede no coincidir con lo que muestra la pestaña "Semanal" de Compras (Ocumo: 3200g),
porque esa pestaña sigue usando el estimado independiente de `COMPRAS_SEMANALES` (una
lista de compras curada a mano), no el PLAN exacto. Son dos fuentes de datos que ya
sabíamos que no coinciden siempre (ver v13/v11) — unificar TODA la pestaña de
Compras (Diaria/Semanal/Mensual) para que use el PLAN real en vez de
`COMPRAS_SEMANALES`/`COMPRAS_MENSUALES` sería un cambio más grande, pendiente si
Diego lo pide en otra sesión.

---



## 🔀 FUSIÓN DE ESTA SESIÓN — Se detectó una bifurcación de archivos y se resolvió

Diego subió dos archivos distintos en la misma sesión (`index-1.html` e `index.html`)
que resultaron ser ramas divergentes del proyecto:

- **`index-1.html`**: tenía mejoras nuevas de Compras (súper-pestañas, calculadora
  "Por días", limpieza automática de checkboxes viejos) pero **le faltaba TODO el
  sistema de v9 "Proteínas por porciones"** (sin `keysGrupo`, sin `protKey`, proteínas
  todavía en gramos con promedio aplanado) — es decir, partía de una base bastante
  más antigua que con la que veníamos trabajando hoy.
- **`index.html`** (re-subido): resultó ser exactamente el archivo que yo mismo había
  entregado con los fixes v10/v11 de esta sesión (comprobado con diff, idéntico).

Se decidió fusionar quedándose con `index.html` (v9+v10+v11, la base más avanzada en
Inventario) como base, y portarle ENCIMA las piezas nuevas y seguras de Compras de
`index-1.html`. **No se portó** la reestructuración de súper-pestañas (mover
"Registrar compra" a una sub-pestaña dentro de Compras) porque en `index.html` esa
sección ya vivía dentro del panel de Compras (solo que en un solo scroll largo, no en
sub-pestañas) — reestructurar esa UI es un cambio más invasivo que se dejó fuera por
precaución, se puede retomar en otra sesión si Diego lo quiere.

### Lo que SÍ se portó a `index.html`
- **Calculadora "Por días"** en Compras (presets 1/7/15/30 + input personalizado):
  `calcularComprasPorDias()`, `calcularComprasPorDiasInput()`,
  `formatearCantidadCompras()`, `renderCalculadoraComprasPorDias()`. Usa a propósito
  el consumo semanal simple (`consumoSemanal.valor/7 × días`), no el consumo real
  día-a-día — para decidir cuánto comprar de cara al futuro un promedio es lo que
  corresponde. Se le agregó un guard (`if (!p.consumoSemanal...) return`) para saltar
  proteínas (que ya no tienen `consumoSemanal`, usan `porcionesSemana`) sin romper.
- **`limpiarComprasViejas()`**: borra automáticamente al abrir la app las claves
  `diaria_<fecha>_i` de días anteriores que quedaban huérfanas en localStorage.
- **v12 aplicado**: el fix documentado la sesión pasada (`actualizarFilaInv` ahora
  llama a `renderFilasInv()` al cambiar de producto) — el recuadro de porciones de
  proteína ya aparece correctamente.

### 🐞 Bug adicional encontrado y corregido al probar la calculadora portada
`parsearCantidadInv()` promediaba el peso entre paréntesis junto con el conteo de
unidades: `"1 racimo (400-500 g)"` (Uvas) daba **301 "unidades"** en vez de 1, y
`"1 trozo (500-600 g)"` (Lechoza) daba 367 en vez de 1. Corregido para ignorar los
números entre paréntesis SOLO cuando la unidad detectada es "unidades" — validado
que casos como "3-4 unidades" (huevos, sin paréntesis) siguen promediando bien (3.5).

### Validación hecha antes de entregar
- Sintaxis de los 4 bloques `<script>` verificada sin errores.
- Catálogo completo iterado en Node simulando la calculadora "Por días": ningún
  crash en proteínas/despensa sin `consumoSemanal`, y los valores de Uvas/Lechoza ya
  salen correctos (1 unidad) tras el fix de `parsearCantidadInv`.

---



## 🐞 BUG PENDIENTE PARA LA PRÓXIMA SESIÓN — El recuadro de "porciones" no aparece al registrar compra de proteína

### Síntoma reportado por Diego
Al registrar una compra de una proteína, la app no deja guardar porque dice "falta
indicar cuántas porciones sacaste de esto" — pero el recuadro para escribir esas
porciones no aparece en pantalla.

### Causa raíz (diagnosticada, NO corregida todavía)
El recuadro de porciones SÍ existe en el código (`renderFilasInv()`, se muestra
cuando `esProteina = prodFila.categoria === 'proteina'` es true) y la validación en
`guardarLoteInventario()` también existe y funciona. El problema está en
`actualizarFilaInv()`:

```js
function actualizarFilaInv(i, campo, valor) {
  window._loteInv[i][campo] = valor;
  // Si es el selector de producto, actualizar el DOM inmediatamente sin re-renderizar
  if (campo === 'producto') {
    const filas = document.querySelectorAll('.inv-fila-producto');
    if (filas[i]) {
      const sel = filas[i].querySelector('select');
      if (sel) sel.value = valor;
    }
  }
}
```

Cuando el usuario elige el producto en el `<select>`, esta función actualiza el dato
en memoria pero **nunca vuelve a llamar a `renderFilasInv()`** — solo toca el DOM del
`<select>` (una operación redundante, porque el select ya tiene ese valor por el
propio evento `onchange` del usuario). Como el bloque condicional del recuadro de
porciones solo se decide dentro de `renderFilasInv()`, y esa función no se vuelve a
ejecutar al seleccionar el producto, el recuadro nunca se pinta — aunque la fila ya
"sabe" en memoria que es una proteína.

### Solución propuesta para la próxima sesión
Reemplazar el bloque `if (campo === 'producto')` para que llame a `renderFilasInv()`
en vez de solo parchear el DOM del select:

```js
function actualizarFilaInv(i, campo, valor) {
  window._loteInv[i][campo] = valor;
  if (campo === 'producto') {
    renderFilasInv(); // recalcula esProteina y muestra/oculta el recuadro de porciones
  }
}
```

Esto es seguro porque elegir un producto del `<select>` ya le quita el foco (no hay
riesgo de "perder foco a mitad de tecleo" como sí lo hay en los campos de
cantidad/merma/precio, que por eso usan `recalcularFilaInv()` para un update parcial
en vez de un re-render completo). No hace falta tocar nada más: una vez que el
recuadro aparezca, el resto de la lógica (guardar la compra con `porciones`, sumarla
al stock desde su fecha en `calcularStockProducto`) ya funciona correctamente — Diego
confirmó que el comportamiento esperado ("el recuadro debería sumar directamente al
stock") ya es exactamente lo que hace el código actual.

### Qué probar después de aplicar el fix
- Elegir una proteína en el select del lote → el recuadro "¿Cuántas porciones
  sacaste de esto?" debe aparecer inmediatamente.
- Guardar la compra sin llenarlo → debe seguir bloqueando con el mismo mensaje de
  error (la validación en sí no se toca).
- Cambiar de un producto no-proteína a uno proteína y viceversa en la misma fila →
  el recuadro debe aparecer/desaparecer correctamente sin romper los demás campos
  de esa fila (cantidad, merma, precio) que sí se actualizan con
  `recalcularFilaInv()`.

---



## 📅 CAMBIO DE ESTA SESIÓN (continuación) — Bug crítico en VEGETALES + inconsistencia del "g/día" mostrado

Diego detectó, probando en vivo, que el Ocumo "gasta un poco más de un kilo en un día"
pero la app mostraba un número que parecía "solo lo de una comida" (457 g/día). Al
verificar TODOS los productos de gramos se encontraron dos problemas:

### 1) El "g/día" mostrado no coincidía con el que usa el cálculo de stock
El motor de stock (día a día, de la sesión anterior) SÍ calculaba bien: Ocumo gasta
1280 g el lunes (arepa 480g + ocumo 480g + puré 320g, las 3 comidas de ese día) y
1280 g el viernes, 0 el resto — coincide exacto con lo que reportó Diego. Pero el
número que se MOSTRABA en la tarjeta ("Consumo: ~457 g/día") salía de una fuente
distinta (`consumoSemanal.valor` derivado de COMPRAS_SEMANALES, no del PLAN día a
día), así que aunque el stock se calculaba bien, el texto en pantalla era engañoso.
**Corregido:** `dailyAvg` ahora se calcula sumando `getConsumoDiaProducto()` de los 7
días y dividiendo entre 7 — siempre el mismo número que efectivamente usa el stock.

### 2) BUG GRAVE — Vegetales calculaban ~100x menos de lo real
El PLAN anota tubérculos y frutas con cantidades reales ("480 g", "1 unidad", "6
unidades"), pero los **vegetales están anotados en TAZAS** ("1 taza"), que no es una
unidad de peso. `getGramosDiaParaKey()` (de la sesión anterior) leía el "1" de "1
taza" como si fuera "1 gramo", así que el modelo calculaba ~0.4-1.3 g/día para
vegetales en vez de los ~50-450 g/día reales. Esto significaba que, en la app real,
**el stock de vegetales casi nunca se agotaría** — peor que el bug original de
promedio aplanado que motivó todo este trabajo.

**Corregido con un modelo distinto para vegetales** (nueva función
`getAparicionesDiaParaKey()` + rama especial en `getConsumoDiaProducto()`): en vez de
inventar un gramaje que el PLAN no registra, se distribuye el total semanal confiable
(`consumoSemanal.valor`, de la lista de compras COMPRAS_SEMANALES) proporcional a
CUÁNTAS VECES aparece esa key cada día. Validado con datos reales: Auyama (aparece 1
vez/semana en el PLAN) ahora calcula 450 g exactos el viernes (el único día que se
usa) en vez de ~0.4 g/día repartidos parejo. Chayota (aparece 3 veces/semana) calcula
266.7 g cada uno de esos 3 días (800 g total, coincide con su consumoSemanal).

Tubérculos y frutas NO se tocaron en este punto — sí tienen gramos/unidades reales en
el PLAN, así que `getGramosDiaParaKey()` sigue siendo correcta para ellos.

### ⚠️ Riesgo relacionado, detectado pero NO resuelto todavía (queda pendiente)
El "factor de Ajustes" (`sumarPlanSemanal`, usado en `construirEntradaCatalogo` para
escalar `consumoSemanal` cuando el usuario edita la matriz de Ajustes) también suma
gramos del PLAN de la misma forma rota para vegetales — es decir, si Diego alguna vez
edita un override de un vegetal en ⚙️ Ajustes, el "original" con el que se compara
(basado en "1 taza" → 1) sigue siendo minúsculo, y el factor resultante
(`override real / 1`) podría dispararse absurdamente alto. **Mientras no se hayan
guardado overrides de vegetales en Ajustes esto no afecta nada** (factor = 1 por
defecto), pero si Diego edita algún vegetal en la matriz de Ajustes y el stock de ese
producto se dispara o se agota de forma rara, este es el sospechoso número uno a
revisar la próxima sesión.

---



## 📅 CAMBIO DE ESTA SESIÓN — Inventario: el consumo diario ya NO se aplana en un promedio, se calcula día por día real

### El problema que se corrigió (confirmado por el usuario, venía de otra conversación)
El cálculo de stock (`calcularStockProducto()`) tomaba el consumo semanal total y lo
dividía entre 7 (`dailyAvg = valor / 7`), y luego asumía que **cada día transcurrido
gasta exactamente ese promedio**. Esto está mal para un plan real donde algunos días
una proteína aparece 2 veces (ej. martes: pollo en desayuno Y cena) y otros días 0
veces (ej. martes: carne de res no aparece nada) — el promedio aplanado no refleja
eso. Afectaba tanto a Proteínas (porciones) como a Tubérculos/Vegetales/Frutas
(gramos), es decir, a **todo** el módulo de Inventario.

### El nuevo modelo — consumo real por día de la semana
- **`getPorcionesDiaPlan(protKey, diaKey)`** — nueva: cuenta cuántas comidas de UN día
  específico (lunes, martes...) usan esa proteína, en vez del total semanal/7.
  `getPorcionesSemanaPlan()` ahora solo sirve de "referencia visual" (suma los 7 días).
- **`getGramosDiaParaKey(grupo, key, diaKey)`** — nueva: gramos reales que el PLAN (con
  overrides de Ajustes ya aplicados) asigna a una key en UN día específico, sumando
  todas las comidas de ese día que la usen.
- **`getConsumoDiaProducto(prod, diaKey)`** — combina las dos anteriores según la
  categoría del producto (proteína → porciones del día; tubérculo/vegetal/fruta →
  gramos del día vía `keysGrupo`).
- **`sumarConsumoRealDesde(fechaInicio, diasTranscurridos, getConsumoDiaFn)`** —
  reemplaza `diasTranscurridos * dailyAvg`: recorre día por día desde la compra/ajuste
  hasta hoy, sumando el consumo real de cada día de la semana exacto (usando
  `DIAS_ES[fecha.getDay()]`).
- **`proyectarAgotamiento(stockInicial, getConsumoDiaFn, hoy)`** — reemplaza
  `stock / dailyAvg`: simula hacia adelante día por día (respetando el patrón real de
  la semana, no un promedio) para saber cuándo se agota. Devuelve días fraccionarios
  para que el badge "≤1 día" siga siendo preciso.
- `dailyAvg` se conserva solo como dato visual ("Consumo: ~X/día" en la tarjeta de
  Inventario) — ya no interviene en ningún cálculo real de stock ni de días restantes.
- Se validó con un caso simulado (proteína consumida solo lunes/miércoles/viernes):
  el modelo nuevo da el consumo exacto según los días realmente transcurridos, contra
  un número distinto (más alto o más bajo según el caso) que daba el promedio plano.

### Qué se tocó en el código (`index.html`)
- `calcularStockProducto()` — las dos ramas (proteína y tubérculo/vegetal/fruta)
  reescritas para usar `sumarConsumoRealDesde()` / `proyectarAgotamiento()` en vez de
  la multiplicación/división plana. `aplicarAjustes()` ahora recibe una función
  `getConsumoDiaFn` en vez de un número `dailyAvg`.
- Nuevas funciones: `getPorcionesDiaPlan`, `getGramosDiaParaKey`,
  `getConsumoDiaProducto`, `sumarConsumoRealDesde`, `proyectarAgotamiento`.
- `getPorcionesSemanaPlan()` refactorizada para reusar `getPorcionesDiaPlan()` por
  cada día en vez de recorrer el PLAN dos veces con lógica duplicada.

### ⚠️ Limitaciones que quedan (conscientes, no bloqueantes)
- **Productos personalizados sin mapeo al PLAN** (`keysGrupo` vacío, ej. un producto
  agregado a mano con "consumo semanal en gramos" manual) siguen usando el promedio
  plano — no hay patrón de día real que calcular para ellos, es la única excepción.
- **Las Excepciones puntuales solo afectan el día de HOY**, no se recalculan
  retroactivamente para fechas pasadas dentro del rango de una compra vieja. Si hubo
  cambios de menú importantes en el pasado, el stock estimado de esos productos puede
  quedar levemente desalineado para ese tramo. Documentado ya en la auditoría de
  julio 2026 más abajo (punto 11), sigue como pendiente si hace falta más adelante.
- **El campo de fecha al registrar compras es por LOTE, no por fila** — si el usuario
  carga varias compras de distintos días del mes de una sola vez, tiene que hacer un
  lote separado por cada fecha real (esto ya funcionaba así antes, no es nuevo de
  esta sesión, pero quedó confirmado explícitamente en esta conversación como el
  requisito para que la carga retroactiva de un mes calcule bien el stock).

---



## 🍗 CAMBIO DE ESTA SESIÓN — Inventario: Proteínas ahora se miden por PORCIONES, no por gramos

### El problema que se corrigió
El cálculo de stock de Inventario asumía que el gramaje real coincidía con el gramaje
fijo del plan nutricional. En la práctica, el usuario porciona el pollo/pescado/carne/huevo
en unidades prácticas (ej. bloques de 110–120 g) que no coinciden exactamente con lo que
dice cada comida del plan — esto hacía que el "consumo diario estimado" estuviera mal
desde la raíz para las proteínas, sin importar cuántos ajustes manuales se le pusieran encima.

### El nuevo modelo (SOLO aplica a categoría Proteína: pollo, res, pescado, sardina, huevo)
- **Al registrar una compra de proteína**, aparece un campo nuevo: "🍗 ¿Cuántas porciones
  sacaste de esto?" — el usuario decide cuántas porciones rindió esa compra (el kg/precio/merma
  se siguen registrando igual, para el cálculo de costos y comparación de precios, pero el
  STOCK ya no se mide en gramos para proteínas).
- **El "consumo semanal" ya NO sale de gramos hardcodeados** (`COMPRAS_SEMANALES`). Ahora se
  cuenta automáticamente **cuántas comidas de la semana usan esa proteína en el `PLAN`**
  (función `getPorcionesSemanaPlan(protKey)`) — ej. si el pollo aparece en 11 comidas de
  las 21 de la semana, el consumo es 11 porciones/semana ≈ 1.57 porciones/día.
- El stock se descuenta en porciones (no en gramos) desde la fecha de cada compra, con la
  misma lógica de decaimiento que ya existía para gramos.
- **Tubérculos, Vegetales y Frutas NO cambiaron** — siguen midiéndose en gramos exactamente
  igual que antes (incluyendo el factor de Ajustes ⚙️ y las Excepciones puntuales).

### Qué se tocó en el código
- `getPorcionesSemanaPlan(protKey)` — nueva función, cuenta comidas/semana con esa proteína en `PLAN`.
- `construirEntradaCatalogo()` — para categoría `proteina`, devuelve `{protKey, porcionesSemana}` en vez de `consumoSemanal` en gramos.
- `calcularStockProducto()` — nueva rama completa para `categoria === 'proteina'` que calcula todo en porciones (stock, ajustes manuales, días restantes).
- Formulario de "Registrar compras" (`renderFilasInv`) — muestra el campo de porciones solo cuando el producto seleccionado es proteína; `guardarLoteInventario()` exige porciones > 0 para proteínas.
- Edición de compra existente (`editarCompra`/`guardarEdicionCompra`/`construirEdicionCompraHTML`) — también editable en porciones para proteínas.
- Ajuste manual de stock (`construirAjusteFormHTML`/`guardarAjuste`) — para proteínas, el formulario pide "porciones a sumar/restar" en vez de kg+merma; se guarda como `deltaPorciones` en vez de `deltaG`.
- Historial de compras y de ajustes — muestran "🍗 N porciones" para proteínas.

### ⚠️ Simplificación consciente (pendiente si hace falta más adelante)
- Las **Excepciones puntuales** (ej. "hoy cambié pollo por sardinas") **NO afectan el stock
  de proteínas** en este modelo nuevo (sí lo siguen haciendo para tubérculos/vegetales). Como
  las porciones son unidades prácticas del usuario y no gramos exactos del plan, mezclar
  "excepción de un día" con "porciones" no tenía una traducción limpia — se dejó fuera a
  propósito. Si en el futuro hace falta, se puede agregar contando la excepción como
  "±1 porción" en vez de gramos.
- Un producto de proteína **personalizado** (agregado por el usuario, no del plan de Diego)
  sigue funcionando como antes ("sin consumo definido" — solo muestra stock total acumulado),
  porque no tiene cómo calcularse las porciones/semana automáticamente desde el PLAN.

---

# 📋 Proyecto Diego Nutrición — Continuidad (v8)

## Estado actual
- ✅ Menú del Día (detección automática, natación, recordatorios)
- ✅ Recetas (12 recetas, rotación inteligente)
- ✅ Compras (diaria/semanal/mensual, checkboxes) **+ Registro de compras real** (lote
  kg/merma/precio, factura foto/IA/OCR, gasto, comparación de precios, historial) — todo
  esto se movió aquí desde Inventario en esta sesión, ver auditoría abajo (punto 3 viejo,
  ya resuelto de fondo distinto: relocalización de módulo).
- ✅ Ajustes ⚙️ (matriz Ingrediente × Comida + Excepciones puntuales, ambas con edición
  in-line, no solo borrado)
- ✅ Cocinar para mañana (dinámico — suma PLAN real + overrides)
- ✅ Inventario — ahora es **solo consulta de stock + corrección manual**:
  - Alertas automáticas (≤7 días amarilla, ≤1 día roja) + badge rojo en el tab
  - Ajuste manual de stock por producto (misma lógica que Registrar compras: kg + merma
    en gramos → neto, con botones "Restar del stock" / "Sumar al stock" + nota) —
    pensado para casos como "el pollo tiene más merma real o se porciona en bandejas de
    110–120g en vez del gramaje fijo del plan"
  - Historial de ajustes, con edición y borrado
  - **El consumo diario estimado ahora respeta la matriz de Ajustes y las Excepciones
    puntuales** (antes usaba siempre el gramaje fijo original del plan — ver auditoría)
  - Productos personalizados — se agregan desde la app sin tocar código, con edición
    (incluye renombrar sin perder el historial de compras/ajustes ya asociado)
- ✅ Registro de compras: edición in-line de una compra ya guardada (antes solo se podía
  borrar y volver a crear el lote entero)
- ✅ PWA instalable de verdad: Service Worker + banner de actualización + funciona offline
- ✅ Íconos PWA reales (`icon-192.png`, `icon-512.png`)
- ✅ **Repo en GitHub Pages funcionando y app instalada en el teléfono**: `https://intinabyc.github.io/Alll/`
- ✅ **Proyecto Firebase ya creado** (`diego-app-2bdc6`) con `FIREBASE_CONFIG` real ya pegado en `index.html`
- ⏸️ **EN PAUSA por decisión del usuario — respaldo en la nube (sync con Firebase) sigue sin conectar, causa raíz todavía sin confirmar.** El resto de la app funciona 100% normal sin esto; no es bloqueante. Ver sección dedicada abajo antes de retomarlo.
- ⏳ **Parte 5 — Módulo Salud** (laboratorios) — PENDIENTE
- ⏳ **Fase futura — Multiusuario real** (login + plan builder genérico) — ver sección dedicada abajo

## 🧩 Estado por módulo (metodología de trabajo actual)

**A partir de esta sesión, el usuario decidió trabajar módulo por módulo**: se enfoca en
un módulo a la vez, hace pruebas EN VIVO en su teléfono/navegador (no solo revisión de
código), reporta qué falla o qué quiere cambiar, se corrige, y se repite hasta que el
usuario confirma explícitamente que ese módulo ya quedó bien. Recién ahí se marca como
✅ cerrado y se pasa al siguiente.

**Importante para Claude:** un módulo marcado ⏳ o 🔨 más abajo significa que **todavía no
pasó por pruebas en vivo del usuario**, aunque el código ya exista y funcione en teoría.
No asumas que un módulo está "terminado" solo porque tiene funcionalidades — solo el
usuario puede cerrar un módulo diciendo algo como "Inventario ya quedó bien, márcalo
como cerrado".

| Módulo | Estado | Nota |
|---|---|---|
| Inventario | 🔨 EN PRUEBAS (sesión actual) | v9: Proteínas por PORCIONES. v10: consumo día a día real. v11: corregido bug grave en vegetales (PLAN los anota en tazas, no gramos — se calculaba ~100x menos) + "g/día" mostrado ahora coincide con el que usa el stock. v12: corregido el recuadro de porciones que no aparecía al elegir proteína. Falta validar todo en vivo, incluyendo Ajustes con overrides de vegetales (riesgo pendiente anotado arriba) |
| Compras | 🔨 EN PRUEBAS (sesión actual) | v13: calculadora "Por días" + limpieza automática. v14: corregido bug de promedio plano en esa calculadora — ahora usa consumo real día a día, incluye proteínas. v15: reestructurado en súper-pestañas "Lista de compras" / "Registrar compra". Falta validar todo en vivo. Pendiente (no bloqueante): "Semanal"/"Mensual" siguen usando `COMPRAS_SEMANALES`/`COMPRAS_MENSUALES` en vez del PLAN real — pueden no coincidir con "Por días" |
| Menú del Día | ⏳ Pendiente de revisión en vivo | Funciona, pero no ha pasado por esta ronda de pruebas dedicada |
| Recetas | ⏳ Pendiente de revisión en vivo | Funciona, pero no ha pasado por esta ronda de pruebas dedicada |

Cuando el usuario abra un chat nuevo (misma cuenta u otra) diciendo simplemente "sigamos
con [módulo]" o "quiero probar [módulo]", Claude debe:
1. Mirar esta tabla para saber en qué módulo se quedó y qué falta.
2. Preguntar (si no lo dijo ya) qué encontró al probar en vivo, en vez de asumir que hay
   que rehacer o auditar todo el módulo desde cero.
3. Al cerrar un módulo, actualizar esta tabla a ✅ y mover el foco al siguiente ⏳.

## Cómo continuar
1. Si el usuario NO menciona el respaldo en la nube, ignora esa sección y sigue con
   normalidad — la app funciona perfecto sin ella (todo vive en `localStorage` como
   siempre). No la saques a relucir tú primero.
2. Si el usuario quiere retomar el respaldo en la nube: **lee la sección "⏸️ Respaldo
   en la nube — pausado" completa antes de tocar nada**, no repitas los pasos que ya
   se agotaron sin éxito (VPN, incógnito, esperar propagación, revisar orden de
   scripts — todo eso ya se descartó como causa única).
3. Para seguir con otras partes: **"Continúa Parte 5 — módulo de Salud"** o
   **"Arranquemos el multiusuario"**.
4. Claude debe `view` el archivo completo antes de tocar nada.
5. **Antes de sugerir qué hacer, revisa la tabla "🧩 Estado por módulo" de arriba** —
   dice en qué módulo se quedó el usuario trabajando y si ya lo cerró o sigue en pruebas.
6. Antes de tocar Compras/Inventario, lee la sección **"🔍 Auditoría de funciones —
   julio 2026"** de abajo: ahí está el estado real de qué se corrigió y qué sigue
   pendiente de esa lista.

---

## 🔍 Auditoría de funciones — julio 2026

Se hizo un análisis completo del código pidiendo "qué funciones podrían estar
faltando", y luego se corrigieron los 3 puntos más urgentes. Se deja registrado todo
lo encontrado (corregido y pendiente) para no tener que rehacer el análisis.

### ✅ Corregidos en esta sesión

1. **Los checkboxes de "Compras → Diaria" no se reseteaban solos.** La clave en
   `compras_state` era `diaria_<nombreDelDía>_i` (ej. `diaria_lunes_0`) — es decir, por
   nombre de día de la semana, no por fecha real. Marcar "listo" un lunes lo dejaba
   marcado el lunes siguiente también. Ahora la clave usa la fecha real de hoy
   (`diaria_<YYYY-MM-DD>_i`), así la lista empieza destildada cada día nuevo sin tener
   que tocar "Limpiar selección". Las claves viejas tipo `diaria_lunes_0` quedan
   huérfanas en `compras_state` (inofensivo, nunca más se leen).

2. **El consumo de Inventario no respetaba la matriz de Ajustes ni las Excepciones
   puntuales** — usaba siempre el gramaje fijo original del plan (`COMPRAS_SEMANALES`)
   para calcular cuánto se gasta por día. Esto es justo la raíz del problema del
   pollo/porciones que se estaba parchando solo a mano con el ajuste manual de stock.
   Se corrigió en dos partes (ver `index.html`):
   - **Ajustes de matriz** (recurrentes): `getCatalogoInventario()` ahora calcula un
     "factor de consumo" por producto (`sumarPlanSemanal()` + `construirEntradaCatalogo()`),
     comparando el total semanal del PLAN con overrides vs. sin overrides, y escala el
     consumo estimado del producto por ese factor. Como el catálogo de Inventario usa
     nombres "planos" (ej. "Chayota") y la matriz de Ajustes agrupa por combinaciones de
     plato (ej. "chayota_vainitas"), se agregó un mapeo específico del plan de Diego
     (`VEG_PRODUCTO_A_KEYS`, `FRUTA_PRODUCTO_A_KEYS`) para poder traducir entre ambos.
   - **Excepciones puntuales** (un solo día): no deben mover el promedio semanal (eso ya
     lo hace el punto anterior), así que se implementó como un "pulso" de un solo día
     (`aplicarExcepcionesHoy()`): si la excepción de hoy reemplaza este producto, se le
     devuelve al stock lo que no se consumió; si el alimento sustituto de la excepción
     es este mismo producto, se le resta lo que sí se consumió de más.
   - **Limitación conocida que queda pendiente**: el "factor de consumo" es una
     aproximación proporcional (escala el número existente de `COMPRAS_SEMANALES`, no
     lo recalcula desde cero) — es fiel a los cambios relativos que hagas en Ajustes,
     pero no corrige discrepancias que ya existieran entre `COMPRAS_SEMANALES` y el
     PLAN real antes de esta sesión.

3. **No había forma de editar, solo de borrar.** Se agregó edición in-line (botón ✏️
   junto al ✕ de borrar) en las 4 secciones que antes solo tenían borrado:
   - Excepciones puntuales (`editarExcepcion`)
   - Productos personalizados (`editarProductoPersonalizado` — si renombras el
     producto, también se renombra su historial de compras y ajustes ya asociado, para
     no dejar registros huérfanos)
   - Ajustes manuales de stock (`editarAjuste`)
   - Compras registradas (`editarCompra` / `guardarEdicionCompra` — recalcula
     merma%/neto/costo con la misma fórmula de "Registrar compras", conservando la
     moneda y tasa histórica de esa compra para no distorsionar el gasto ya contado)

4. **Sin confirmación antes de borrar.** Se agregó `confirm()` con el nombre del ítem
   en las 4 funciones de borrado (`borrarExcepcion`, `borrarCompraInventario`,
   `borrarAjuste`, `borrarProductoPersonalizado`) — un toque accidental en ✕ ya no
   borra sin aviso.

### ⏳ Pendientes (quedaron identificados, no se tocaron)

5. Las 12 recetas están harcodeadas en `RECETAS` — no hay forma de agregar, editar o
   quitar una receta desde la app (a diferencia de "producto personalizado", que sí).
6. El tab Menú solo muestra el día de hoy — no hay flechas para ver el menú de mañana
   o de otro día sin cambiar la fecha del celular.
7. Sin resumen nutricional del día: el plan define metas (2100 kcal, 89g proteína) pero
   la app nunca calcula ni muestra cuánto se lleva consumido hoy contra esa meta.
8. Vitamina D y agua son solo texto recordatorio — no tienen checkbox como "Cocinar
   mañana" para marcarlos como hechos.
9. Sin notificación push cuando el stock se pone crítico — solo se ve el badge si se
   abre la app.
10. Riesgo de seguridad ya conocido (ver sección de Firebase más abajo): el "código de
    familia" es una contraseña débil sin límite de intentos.
11. El "factor de consumo" del punto 2 es una aproximación proporcional, no una
    reconstrucción exacta desde cero — ver limitación conocida arriba.
12. Multi-hijo / multi-perfil: la app sigue siendo 100% específica para Diego (ya
    trackeado como fase futura de Multiusuario, se repite aquí solo para que quede
    junto al resto de la auditoría).

---

---

## ⏸️ Respaldo en la nube (Firebase) — PAUSADO, sin resolver

El usuario decidió dejarlo aquí por hoy después de varias rondas de diagnóstico sin
éxito. **La app funciona 100% normal sin esto** — todo sigue guardándose en
`localStorage` del teléfono como toda la vida. Esto es solo una mejora que no llegó a
activarse, no rompe nada más.

### Línea de tiempo de todo lo que se investigó (para no repetir pasos)

**1. Bug real #1 — orden de carga del SDK (CONFIRMADO Y CORREGIDO):**
Las etiquetas `<script src="firebase-...-compat.js">` estaban **después** del bloque
de código principal que las necesitaba, así que `initFirebaseSync()` intentaba usar el
objeto global `firebase` antes de que el navegador lo hubiera cargado. Se corrigió
moviendo esas 3 etiquetas a **antes** del `<script>` principal. **Se confirmó por
captura de pantalla que este fix SÍ quedó bien reflejado en el repo de GitHub**
(líneas 1316-1318 antes de la línea 1320 donde abre el script grande) — este bug
específico está descartado como causa de los problemas posteriores.

**2. Sospecha #2 — VPN bloqueando dominios de Google:** el usuario tenía VPN activa en
todas las capturas. Se le pidió probar con VPN apagada. **Resultado: probó sin VPN y
sin caché (pestaña de incógnito) y el error siguió igual** — descartado.

**3. Bug real #2 — mensaje de error engañoso + condición de carrera (CONFIRMADO Y
CORREGIDO):** el mensaje *"falta FIREBASE_CONFIG"* aparecía por cualquier motivo que
impidiera conectar, no solo por configuración incompleta — y además existía una
condición de carrera real: si el usuario tocaba "Conectar" antes de que terminara el
intento asíncrono de `signInAnonymously()`, salía ese mismo mensaje aunque todo
estuviera bien. Se corrigió: (a) `confirmarCodigoSync()` ahora espera
(`await window._firebaseReadyPromise`) a que termine el intento de conexión antes de
decidir, y (b) se agregaron mensajes de error específicos por causa real (`auth`
deshabilitado, `Firestore` no accesible, sin internet, desconocido).

**4. Con ese fix ya subido, el error pasó a ser el mensaje genérico "desconocido":**
*"No se pudo conectar a Firebase. Revisa tu internet e inténtalo de nuevo en unos
segundos."* — sin el detalle técnico entre corchetes que se había agregado para
diagnosticar. Se sospechó que el detalle se perdía al transcribirlo a mano.

**5. Se agregó un `alert()` a prueba de todo** (imposible de truncar o de perder al
copiar) con `JSON.stringify(err, Object.getOwnPropertyNames(err))` y una cadena de
fallbacks para garantizar que SIEMPRE mostrara algo. **El alert mostró literalmente
"sin detalle disponible"** — que es el fallback más externo de todos (el de la llamada
a `alert(...)` misma, no el de `_firebaseErrorDetalle`).

### 🚩 Pista más importante para retomar — probable causa raíz real

Que aparezca exactamente **"sin detalle disponible"** (el fallback MÁS externo) en vez
de cualquiera de los fallbacks intermedios (`String(err)`, o el texto largo
`'error sin detalle disponible (revisa que firebase-app-compat.js haya cargado)'`)
sugiere fuertemente que **`_firebaseErrorDetalle` nunca se llegó a asignar en
absoluto** — es decir, que el archivo que el teléfono está ejecutando en ese momento
**todavía no tenía el último fix subido** (otra vez el mismo patrón recurrente de esta
sesión: los cambios en el código no llegan a estar realmente live cuando se prueban).

**Antes de seguir depurando el código de Firebase, lo primero que hay que hacer al
retomar es verificar con certeza absoluta que el archivo servido en
`https://intinabyc.github.io/Alll/` es byte-a-byte idéntico al último `index.html`
generado** — no asumir que sí por haber "subido algo". Sugerencia concreta para
romper este ciclo: pedirle al usuario que comparta el enlace RAW de GitHub
(`github.com/intinabyc/Alll` → abrir `index.html` → botón "Raw") y que Claude lo
intente fetchear directamente (puede fallar si el repo no está indexado — en ese caso,
pedir al usuario que copie y pegue el contenido de esa vista Raw completo, no solo un
fragmento). Solo cuando se confirme con certeza que el código desplegado es el
correcto, tiene sentido seguir interpretando mensajes de error de Firebase.

**Causas de Firebase todavía no descartadas** (por revisar recién se confirme que el
código desplegado es el correcto):
- Authentication → Sign-in method → Anonymous realmente guardado como activado (se
  activó en la sesión de configuración inicial, pero nunca se reconfirmó después).
- Firestore Database realmente creado y en estado activo (no "pendiente de aprovisionar").
- Restricciones del API Key en Google Cloud Console (por defecto las keys de Firebase
  no tienen restricción de dominio/referrer, pero vale la pena revisar en
  **Google Cloud Console → APIs & Services → Credentials** que la key
  `AIzaSyALw122ptfsP0M-uT95KDvTLGBZVo7msmU` no tenga restringidos los referrers a un
  dominio que no incluya `intinabyc.github.io`).

---

## 🆕 Cambios de la sesión que construyó PWA real + respaldo en la nube

### Contexto: la visión del producto cambió
El usuario aclaró que, aunque hoy la app está hecha a la medida de Diego, la
idea a futuro es que **cualquier familia pueda usarla para su propia dieta**.
Eso no se construyó todavía (proyecto grande aparte, ver sección dedicada más
abajo), pero sí se tomó en cuenta al diseñar el respaldo en la nube para no
tener que rehacerlo cuando llegue ese momento.

### Service Worker (`sw.js`) — nuevo archivo
- Cachea el "app shell" (`index.html`, `manifest.json`, íconos) para que la app
  funcione **sin internet** una vez instalada.
- Network-first para HTML/manifest (detecta actualizaciones apenas hay señal),
  con fallback a caché si no hay internet.
- Cache-first para el resto (íconos).
- **No hace `skipWaiting()` automático** — la versión nueva se queda esperando
  hasta que el usuario confirma desde el banner, para no interrumpir una
  sesión en curso.
- `APP_VERSION` es un string que hay que subir a mano en cada release (ver
  `DEPLOY.md` Parte 3) — si no se sube, los teléfonos no detectan la
  actualización porque el navegador compara el archivo byte a byte.

### Banner de actualización
- Franja verde fija arriba: "🔄 Hay una actualización disponible" + botón
  "Actualizar ahora".
- Aparece cuando el Service Worker detecta una versión nueva instalada y
  esperando (`reg.waiting` / evento `updatefound`), y también se revisa al
  volver a la app (`visibilitychange`), porque los navegadores móviles casi
  nunca recargan la pestaña solos.
- Al tocar "Actualizar ahora": se manda `SKIP_WAITING` al Service Worker nuevo
  y, cuando toma control (`controllerchange`), se recarga la página una sola vez.

### Respaldo automático en la nube (Firebase) — "código de familia"
**Cómo funciona:** en vez de exportar/importar un JSON a mano, la data
(`plan_overrides`, `plan_excepciones`, `recetas_historial`, `compras_state`,
`inventario_compras`, `productos_personalizados`, claves `cocinar_*`) se sube
sola a un documento de Firestore identificado por un **hash del "código de
familia"** que el usuario elige la primera vez (ej. `diego-carles-2026`). Para
sincronizar otro teléfono, solo hay que escribir el mismo código ahí.

**Por qué "código de familia" y no login real todavía:** se evaluaron 2
opciones con el usuario: GitHub Gist (reutiliza la cuenta de GitHub, pero sin
sync en tiempo real y con riesgo de que dos teléfonos se pisen los cambios) vs
Firebase (sync en tiempo real, requiere crear un proyecto gratis). El usuario
confirmó que quiere convertir esto en un producto multiusuario a futuro — con
esa visión, Firebase es la opción correcta porque ya trae autenticación
integrada. El "código de familia" es un **puente intencional**: hoy actúa como
contraseña compartida sin pantalla de login real, pero el documento
`familias/{id}` es la misma unidad que se seguirá usando cuando se agregue
autenticación de verdad — solo cambia cómo se calcula `{id}` (de un hash del
código, al `uid` de una cuenta real). **No hay que rediseñar el modelo de
datos cuando llegue ese momento.**

**Cómo se sincroniza técnicamente:**
- `initFirebaseSync()` corre al arrancar. Si `FIREBASE_CONFIG` tiene los
  placeholders `"TODO_PEGAR_AQUI"`, no hace nada y muestra "Respaldo no
  configurado" — la app sigue funcionando 100% normal solo con localStorage.
- Autenticación **anónima** de Firebase (sin pedir usuario/contraseña).
- `localStorage.setItem` está interceptado (`interceptarLocalStorage()`) para
  disparar un push con debounce de 2s cada vez que cambia alguna clave
  sincronizada — no hubo que tocar ninguna función existente (`guardarConfig`,
  `guardarLoteInventario`, etc.) para que empiecen a sincronizar solas.
- `escucharCambiosRemotos()` usa `onSnapshot` — si otro teléfono con el mismo
  código sube un cambio, este lo recibe y re-renderiza todo sin recargar.
- `window._ultimoPushLocal` evita re-aplicar como "remoto" un cambio que el
  propio teléfono acaba de subir (evita loops).
- Indicador en el header: punto verde "Sincronizado", naranja pulsante
  "Sincronizando…", rojo "Error de conexión", gris "Sin sincronizar"/"Respaldo
  no configurado". Tocarlo abre el modal para crear/cambiar el código.

**⚠️ Nota de seguridad honesta (también en `DEPLOY.md`):** las reglas de
Firestore sugeridas permiten leer/escribir cualquier documento a cualquiera
autenticado (anónimo, automático) que sepa el ID exacto (hash del código). No
es cifrado bancario — es razonable para datos de nutrición familiar, no para
información médica sensible tal cual está. Con login real, las reglas se
endurecen para exigir que `request.auth.uid` sea dueño del documento.

**Pendiente de configurar por el usuario (Claude no puede hacerlo por él):**
1. Crear el proyecto Firebase (cuenta Google) — paso a paso en `DEPLOY.md`.
2. Pegar los 6 valores reales en `FIREBASE_CONFIG` dentro de `index.html`.
3. Pegar las reglas de Firestore sugeridas en la consola de Firebase.
4. Sin este paso no se activa nada — no rompe la app, sigue funcionando solo
   con localStorage.

### Íconos PWA generados
`icon-192.png` / `icon-512.png` — el `manifest.json` ya los referenciaba pero
no existían como archivos reales (pendiente documentado en v4). Se generaron
con el tema verde de la app (círculo + hoja). Reemplazables sin tocar código.

### `DEPLOY.md` — nuevo archivo
Guía completa: subir a GitHub Pages, activar Firebase paso a paso, y cómo
publicar actualizaciones futuras sin que los usuarios pierdan datos
(recordatorio de subir `APP_VERSION` en `sw.js` en cada release).

---

## 📱 Datos del despliegue ya hecho (no repetir estos pasos)

- **Repo GitHub:** `intinabyc/Alll` → Pages en `https://intinabyc.github.io/Alll/`
- **Proyecto Firebase:** `diego-app-2bdc6` (plan Spark/Standard, ya creado)
- **Authentication → Anónimo:** ya activado
- **Firestore Database:** ya creado, con las reglas de seguridad de `DEPLOY.md` ya publicadas
- **`FIREBASE_CONFIG` en `index.html`:** ya tiene los 6 valores reales (apiKey,
  authDomain, projectId, storageBucket, messagingSenderId, appId) — ya no son
  placeholders `"TODO_PEGAR_AQUI"`. No hay que volver a pedirle estos datos al usuario.

## ⚠️ Patrón recurrente a vigilar — cambios que no llegan a estar realmente "live"

Esto pasó varias veces en esta misma sesión, con dos causas distintas detectadas:

1. **Sufijo en el nombre de archivo:** el teléfono del usuario le agrega un sufijo
   numérico al archivo descargado (`index-7.html`, posiblemente `(1)`, `(2)`, etc.)
   cuando ya existe un archivo con ese nombre en la carpeta de Descargas — y ese
   nombre con sufijo se sube tal cual a GitHub, rompiendo Pages o dejando sin efecto
   un reemplazo que el usuario cree que sí hizo.
2. **Reemplazos de archivo que no confirman el diálogo de GitHub:** al subir un
   archivo con el mismo nombre que uno existente, GitHub pide confirmar "este
   archivo ya existe, ¿reemplazar?" — si ese paso no se completa, la subida no
   reemplaza nada y el archivo viejo sigue siendo el que se sirve.

**Cada vez que el usuario reporte que "ya subí el archivo pero sigue el mismo
problema", la primera pregunta debe ser cómo lo subió exactamente y si el nombre
quedó exactamente `index.html`** — antes de investigar bugs de código nuevos. Si hay
dudas, la forma más confiable de confirmar qué hay realmente desplegado es pedirle al
usuario el contenido de la vista **Raw** del archivo en GitHub (no capturas de
pantalla parciales, sino el texto completo), o intentar fetchearlo directamente.

---

## 🔭 Fase futura — Multiusuario real (todavía NO construido)

El usuario preguntó qué tan complejo es esto. Quedó registrado para cuando se
retome:

- **Login real** (Firebase Auth email/contraseña o Google) — complejidad
  **media**, mecánico con Firebase, aprovecha la infraestructura de esta sesión.
- **Aislar la data de cada familia** — complejidad **media**, patrón bien
  documentado; el "código de familia" ya deja `familias/{id}` como la unidad
  de aislamiento correcta.
- **Constructor de plan genérico** (que cualquiera arme SU semana/comidas/
  restricciones en vez del `PLAN` fijo de Diego, hoy escrito directo en el
  código) — complejidad **alta**, es la pieza más grande, básicamente
  reconstruir el corazón de la app. Compras e Inventario ya derivan de
  estructuras de datos en vez de tener lógica pegada a Diego
  (`COMPRAS_SEMANALES`, `getCatalogoInventario()`), así que esa parte ya está
  parcialmente lista para generalizar; falta la UI para crear el plan desde
  cero, un sistema de restricciones/alergias genérico, y un banco de recetas.
- **Decisión acordada con el usuario:** dejar esto para una fase aparte y
  terminar primero la app personalizada de Diego con la arquitectura ya lista
  para crecer — que es justo lo que se hizo esta sesión.

---

## 🆕 Cambios de la sesión anterior (Inventario en lote + fix cocinar mañana)
- Eliminado `TUBERCULO_MANANA` hardcodeado.
- Reemplazado por `getCocinarManana(diaKeyHoy)` que:
  - Detecta el día siguiente real
  - Suma gramos de todas las comidas del tubérculo de ese día desde el PLAN
  - Aplica overrides de la matriz de Ajustes
  - Se sincroniza al guardar/resetear Ajustes
  - También sincroniza la vista Diaria de Compras

### Fix: Lógica de registro de compras en inventario
- **Antes:** cantidad en gramos, merma en %, costo total ingresado
- **Ahora:** cantidad en kg, merma en gramos, precio por kg ingresado
- La app calcula automáticamente en tiempo real:
  - Costo total = cantidadKg × precioKg
  - Merma% = mermaG / (cantidadKg×1000) × 100
  - Cantidad neta = cantidadKg×1000 − mermaG
  - Costo/kg neto = costoTotal / (netaG/1000)
- Resumen visual bajo cada fila del lote (se actualiza mientras escribes)

### Nuevo: Productos personalizados
- Botón "**+ Agregar producto personalizado**" en el panel Inventario
- Formulario: nombre, categoría, consumo semanal en gramos
- Se guarda en `localStorage` clave `productos_personalizados`
- `getCatalogoInventario()` ahora fusiona el catálogo base del plan + personalizados
- Aparecen en el selector de compras junto a los del plan
- Se pueden borrar desde la misma lista

### Nuevo: Badge automático de alertas
- Aparece en el tab 📦 Inventario cuando hay ≥1 producto con stock ≤ 1 día
- Muestra el número de productos críticos (rojo)
- Desaparece automáticamente cuando el stock sube (al registrar una compra nueva)
- Vuelve a aparecer solo cuando baja de nuevo — sin interacción manual
- Se recalcula en `renderInventario()` y al iniciar la app

---

## localStorage — claves activas
| Clave | Contenido |
|-------|-----------|
| `plan_overrides` | Ajustes de cantidades por ingrediente × comida |
| `plan_excepciones` | Excepciones puntuales por fecha |
| `recetas_historial` | Recetas marcadas como hechas por fecha |
| `compras_state` | Checkboxes de listas de compras |
| `cocinar_YYYY-MM-DD` | Si ya se cocinó el tubérculo de mañana ese día |
| `inventario_compras` | Historial de compras registradas |
| `inventario_ajustes` | **Nuevo** — correcciones manuales de stock (kg/merma/nota, +/-) |
| `productos_personalizados` | Productos agregados por el usuario |
| `bcv_tasa_cache` | Tasa BCV cacheada (tasa, fecha, manual) |
| `sync_codigo_familia` | **Nuevo** — código elegido para el respaldo en Firebase |

Todas las claves de la tabla excepto `bcv_tasa_cache` y `sync_codigo_familia`
se sincronizan automáticamente a Firebase cuando el respaldo está configurado
(ver `SYNC_KEYS_FIJAS` en `index.html`). Si agregas una función nueva que use
`localStorage.setItem` con una clave nueva que también deba respaldarse, hay
que agregarla a `SYNC_KEYS_FIJAS`.

---

## Parte 5 — Salud (instrucciones)

Nuevo tab en bottom nav con ícono 🩺.

### Exámenes
| Examen | Referencia |
|--------|-----------|
| Glucosa | 70–100 mg/dL |
| Calcio | 8.5–10.5 mg/dL |
| Magnesio | 1.7–2.2 mg/dL |
| 25-OH Vitamina D | 30–100 ng/mL |
| Panel IGG | Negativo (huevo, cerdo, gluten, maíz, arroz, leche de cabra, avellana) |

### Funcionalidades
- Formulario: fecha + examen + valor + unidad
- localStorage clave `lab_resultados`
- Semáforo: verde / amarillo / rojo vs. referencias
- Gráfica de evolución por examen (Canvas nativo, sin dependencias)
- Recordatorio próximo control (6 semanas desde última visita)

---

## Datos de Diego
- **Nombre:** Diego Carles | **Nac.:** 22/10/2015
- **Peso:** 28.4 kg (ideal 29.3 kg) | **Talla:** 1.33 m
- **Plan:** 2100 kcal · 89 g proteína/día
- **Restricciones:** Sin gluten, caseína, colorantes, preservantes
- **Suplemento:** Vitamina D 1000 UI con desayuno
- **Agua:** 1800 cc/día (+250 cc natación)
- **Nutricionista:** Lcda. Zoraida Rosales — @NUTRIZORA — 0424-277-86-60

## Pendientes no urgentes
- Excepciones puntuales reflejadas también en Compras
- Input de unidad separado en la matriz de Ajustes
- Botón exportar respaldo JSON de todo localStorage (parcialmente resuelto por el respaldo en Firebase, pero un export manual sigue siendo útil como respaldo adicional)
- Endurecer reglas de Firestore cuando se implemente login real (ver nota de seguridad arriba)
- Selector de moneda por fila individual en Inventario, no solo por lote completo
- Historial de precios por producto a lo largo del tiempo
- Presupuesto mensual con barra de progreso (el usuario dijo que no lo quiere por ahora)
- Que el cálculo de consumo de Inventario respete los overrides de Ajustes y las Excepciones puntuales
- El intercambio de tubérculos Lunes/Jueves/Viernes detectado contra el plan de mayo de la nutricionista sigue sin corregir — el usuario dijo que lo iba a revisar él mismo
