# Alacena Inteligente FIFO 🥗

PWA que analiza la foto de un ticket de supermercado y genera un menú semanal
optimizado con el principio de **Baja Entropía** (FIFO: lo primero en
vencerse, lo primero en cocinarse).

---

## 1. Stack

- **Frontend:** Vite + React + Tailwind CSS + Lucide React
- **Backend:** 1 función Serverless de Vercel (`/api/generate-menu.js`)
- **IA:** GLM-4.6V-Flash de Z.ai / Zhipu AI (visión multimodal, **gratuito**)
- **Base de datos:** ninguna. El último menú se guarda en `localStorage`.

> ¿Por qué GLM-4.6V-Flash? Es chino (Zhipu AI / Z.ai), procesa imágenes de
> forma nativa (necesario para leer el ticket), y a diferencia de la mayoría
> de proveedores —que solo dan un crédito de prueba que se agota— este modelo
> específico es gratuito de forma permanente, sin tarjeta de crédito.
> Verifica siempre las condiciones vigentes en [z.ai](https://z.ai), ya que
> las políticas de los proveedores pueden cambiar.

---

## 1.1 Cantidades, comidas y nutrición

- **Cantidades reales:** la IA lee la cantidad o peso de cada producto del
  ticket. Si el ticket no especifica cantidad, la estima a partir del precio
  pagado y el tipo de producto.
- **Comidas por día (1 a 5):** el usuario eligen cuántas comidas quiere por
  día, con este mapeo fijo:
  | numComidas | Comidas incluidas |
  |---|---|
  | 1 | Almuerzo |
  | 2 | Almuerzo, Cena |
  | 3 | Desayuno, Almuerzo, Cena |
  | 4 | Desayuno, Media mañana, Almuerzo, Cena |
  | 5 | Desayuno, Media mañana, Almuerzo, Media tarde, Cena |
- **Macros y calorías:** cada comida trae `calorias`, `proteina_g`,
  `carbohidratos_g` y `grasas_g` estimados según sus ingredientes.
- **Meta calórica opcional:** el usuario puede indicar una meta de calorías
  por comida antes de generar el menú; la IA intenta acercarse a esa meta
  ajustando las cantidades.
- **Ajuste fino por plato:** una vez generado el menú, cada comida tiene
  botones `−` / `+` junto a sus calorías. Al cambiarlas, el cliente
  **recalcula al instante** (regla de tres proporcional, sin volver a llamar
  a la IA) tanto las cantidades de ingredientes como los 4 macros de esa
  comida específica. Ver `src/utils/scaleNutrition.js`.

---

## 2. Estructura del proyecto

```
alacena-fifo/
├── api/
│   └── generate-menu.js       ← función serverless (la API key vive aquí)
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   │   ├── TicketUploader.jsx     ← cámara / subir archivo + compresión
│   │   ├── PlanSelectors.jsx      ← selectores de personas y días
│   │   ├── LoadingState.jsx       ← skeleton + frases gamificadas
│   │   ├── DayCard.jsx            ← tarjeta de día (almuerzo/cena + YouTube)
│   │   ├── ShareActions.jsx       ← compartir WhatsApp / nuevo ticket
│   │   ├── DemoBanner.jsx
│   │   └── ErrorBanner.jsx
│   ├── data/
│   │   └── mockMenu.json          ← datos simulados para el Modo Demo
│   ├── hooks/
│   │   └── useMenuStorage.js      ← persistencia en localStorage
│   ├── utils/
│   │   └── compressImage.js       ← compresión cliente vía <canvas>
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── vercel.json
├── tailwind.config.js
└── package.json
```

---

## 3. Probar en tu computadora (Modo Demo, sin gastar API)

El **Modo Demo está activado por defecto**. No necesitas ninguna API key
para ver y diseñar la interfaz.

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Verás un banner ámbar que dice
**"Modo Demo activo"**. Al subir cualquier foto y pulsar "Generar menú",
la app espera ~2.4s simulando la llamada real y luego muestra
`src/data/mockMenu.json` recortado a la cantidad de días que elegiste.

### Cómo apagar el Modo Demo

Abre `src/App.jsx` y cambia esta línea:

```js
const DEMO_MODE = true   // ← cambia a false cuando quieras usar la IA real
```

Con `DEMO_MODE = false`, la app llamará a `/api/generate-menu.js`, que sí
necesita la `ZAI_API_KEY` configurada (ver sección 5).

> Nota: en local, `/api/generate-menu.js` solo funciona si usas
> `vercel dev` (CLI de Vercel) en lugar de `npm run dev`, porque Vite por
> sí solo no ejecuta funciones serverless. Para probar el flujo real en tu
> máquina:
> ```bash
> npm i -g vercel
> vercel dev
> ```

---

## 4. Desplegar en Vercel

### Opción A — Desde la CLI

```bash
npm i -g vercel
vercel login
vercel
```

Sigue las instrucciones (acepta los valores por defecto: Vite detecta solo
el framework). Al terminar tendrás una URL de preview.

### Opción B — Desde GitHub

1. Sube esta carpeta a un repositorio de GitHub.
2. Entra a [vercel.com/new](https://vercel.com/new) y selecciona el repo.
3. Vercel detecta automáticamente que es un proyecto Vite. No cambies nada
   del **Build Command** (`vite build`) ni del **Output Directory** (`dist`).
4. Antes de pulsar "Deploy", configura la variable de entorno (ver sección 5).
5. Deploy.

---

## 5. Cómo obtener tu API key de Z.ai (gratis)

1. Crea una cuenta en **[z.ai](https://z.ai)** (plataforma internacional de
   Zhipu AI). Si estás en China continental, también puedes registrarte en
   `open.bigmodel.cn` — usan la misma cuenta y panel de claves.
2. En el dashboard, ve a la sección **"API Keys"** y genera una clave nueva.
3. No necesitas tarjeta de crédito para usar `glm-4.6v-flash`, el modelo
   que usa este proyecto: es gratuito de forma permanente.

Después, en Vercel: **Settings → Environment Variables** y agrega:

| Nombre            | Valor                          | Entornos                              |
|--------------------|---------------------------------|----------------------------------------|
| `ZAI_API_KEY`     | tu clave generada en z.ai      | Production, Preview, Development      |

Después de guardar la variable, si el proyecto ya estaba desplegado, ve a
**Deployments → ⋯ → Redeploy** para que la función serverless la tome.

⚠️ **Nunca** pongas esta clave en el código del frontend ni en archivos que
subas a GitHub. El archivo `.env.example` es solo una referencia; el real
(`.env`) está en `.gitignore` y nunca debe subirse.

Antes de pasar a producción, recuerda volver a `src/App.jsx` y cambiar:

```js
const DEMO_MODE = false
```

y volver a desplegar (`vercel --prod` o un nuevo push a tu rama principal).

---

## 6. Cómo funciona la compresión de imágenes

`src/utils/compressImage.js` usa un `<canvas>` oculto para:

1. Redimensionar la imagen a un ancho máximo de **1000px**.
2. Exportarla en **WebP** (con fallback automático a JPEG si el navegador
   no soporta WebP) a calidad **0.8**.
3. Si el resultado aún pesa más de **400KB**, reduce la calidad en pasos de
   0.1 hasta lograrlo (mínimo 0.4).

Todo esto ocurre **antes** de que la imagen salga del dispositivo del
usuario, así el payload hacia `/api/generate-menu.js` siempre es liviano.

---

## 7. Seguridad: por qué la API key nunca toca el cliente

El frontend solo conoce la ruta `/api/generate-menu.js`. Esa ruta corre
exclusivamente en el servidor de Vercel, donde `process.env.ZAI_API_KEY`
está disponible. El navegador del usuario nunca recibe esa clave en ningún
momento — ni en el HTML, ni en el JS compilado, ni en las respuestas de red.

---

## 8. Detalles técnicos del proveedor de IA

- **Modelo:** `glm-4.6v-flash`
- **Endpoint:** `https://api.z.ai/api/paas/v4/chat/completions`
- **Formato:** OpenAI-compatible (`messages` con bloques `image_url` +
  `text`, autenticación `Authorization: Bearer <ZAI_API_KEY>`)
- **Imagen:** se envía como data URI base64 (`data:image/webp;base64,...`),
  igual que el formato que ya genera `compressImage.js`.
- **Modo thinking:** desactivado (`thinking: { type: 'disabled' }`) para
  obtener una respuesta directa sin razonamiento expuesto, ya que solo
  necesitamos el JSON final.

### Migrar a otro proveedor en el futuro

Si más adelante quieres cambiar de proveedor (Gemini, OpenAI, Qwen-VL,
DeepSeek, etc.), solo necesitas tocar `api/generate-menu.js`: el contrato
con el frontend (`{ imageBase64, mimeType, personas, dias }` →
`{ menu: [...] }`) no cambia, así que ningún componente de React necesita
modificarse.

---

## 9. Notas de diseño

La paleta sigue la metáfora de "urgencia FIFO": verde (`#2D6A4F`) para los
días 1-2 de alta perecibilidad, ámbar (`#C98A2C`) para los días 3-4, y un
tono "despensa" marrón (`#8B5E3C`) para los días de productos secos o
enlatados. El fondo cálido (`#FAF7F0`) y el encabezado oscuro con borde
dentado evocan un ticket de compra físico.
