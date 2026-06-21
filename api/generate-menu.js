// /api/generate-menu.js
//
// Función Serverless de Vercel. Actúa como proxy seguro entre el frontend
// y la API de Z.ai (Zhipu AI), usando el modelo de visión GLM-4.6V-Flash
// (gratuito, no solo crédito de prueba). La ZAI_API_KEY vive exclusivamente
// en las variables de entorno de Vercel y nunca se expone al cliente.
//
// El frontend envía: { imageBase64, mimeType, personas, dias, numComidas, caloriasObjetivo }
// Esta función responde con: { menu: [ { dia, desayuno?, media_manana?, almuerzo, media_tarde?, cena? }, ... ] }
//
// Cada comida tiene la forma:
// {
//   "plato": "...",
//   "ingredientes": [ { "nombre": "...", "cantidad": 250, "unidad": "g" }, ... ],
//   "calorias": 520,
//   "proteina_g": 42,
//   "carbohidratos_g": 35,
//   "grasas_g": 18
// }

const ZAI_MODEL = 'glm-4.6v-flash'
const ZAI_URL = 'https://api.z.ai/api/paas/v4/chat/completions'

// Mapa fijo de qué comidas incluir según cuántas se seleccionaron (1 a 5).
const MEAL_KEYS_BY_COUNT = {
  1: ['almuerzo'],
  2: ['almuerzo', 'cena'],
  3: ['desayuno', 'almuerzo', 'cena'],
  4: ['desayuno', 'media_manana', 'almuerzo', 'cena'],
  5: ['desayuno', 'media_manana', 'almuerzo', 'media_tarde', 'cena']
}

const MEAL_LABELS = {
  desayuno: 'Desayuno',
  media_manana: 'Media mañana',
  almuerzo: 'Almuerzo',
  media_tarde: 'Media tarde',
  cena: 'Cena'
}

function buildSystemPrompt(personas, dias, mealKeys, caloriasObjetivo) {
  const mealList = mealKeys.map((k) => MEAL_LABELS[k]).join(', ')

  const exampleMealKey = mealKeys[0]
  const exampleJsonMeal = `"${exampleMealKey}": { "plato": "...", "ingredientes": [ { "nombre": "...", "cantidad": 250, "unidad": "g" } ], "calorias": 520, "proteina_g": 42, "carbohidratos_g": 35, "grasas_g": 18 }`
  const otherKeysExample = mealKeys
    .slice(1)
    .map((k) => `"${k}": { ... misma estructura ... }`)
    .join(', ')

  return `Eres un Chef y nutricionista experto en economía doméstica y el principio de Baja Entropía (desperdicio cero). Analiza los alimentos de esta factura/ticket de supermercado con mucho cuidado.

PASO 1 — LECTURA DE CANTIDADES (muy importante):
Para cada producto del ticket, identifica la cantidad o peso comprado (ej: "2 kg", "500 g", "x6 unidades", "1 lt"). Si el ticket NO especifica la cantidad o peso, ESTÍMALA a partir del precio pagado y el tipo de producto (usa tu conocimiento de precios típicos de supermercado para inferir un peso o cantidad de unidades razonable). Nunca dejes una cantidad en blanco: siempre da un número, aunque sea estimado.

PASO 2 — PLAN DE COMIDAS:
Arma un plan para ${personas} personas durante ${dias} días, incluyendo estas comidas cada día: ${mealList}.

REGLA FIFO OBLIGATORIA: Gasta primero los alimentos altamente perecederos (carnes frescas, verduras de hoja, lácteos, pescados) en los días 1, 2 y 3. Los alimentos secos o enlatados déjalos para los días finales.

REGLA DE CANTIDADES REALES: Las cantidades de "ingredientes" en cada comida deben ser una porción coherente extraída del total comprado, ajustada a ${personas} personas, repartida de forma sensata entre todas las comidas del plan a lo largo de los ${dias} días (no debes usar más de lo que efectivamente se compró en el ticket, salvo para condimentos básicos como sal, aceite o especias que asumes que ya existen en la alacena).

PASO 3 — NUTRICIÓN:
Para cada comida, calcula valores nutricionales aproximados pero realistas según las cantidades de ingredientes de esa comida específica:
- "calorias": calorías totales de la comida (número entero)
- "proteina_g": gramos de proteína (número)
- "carbohidratos_g": gramos de carbohidratos (número)
- "grasas_g": gramos de grasa (número)
${caloriasObjetivo ? `\nMETA CALÓRICA: intenta que cada comida individual se acerque a aproximadamente ${caloriasObjetivo} kcal (ajusta las cantidades de ingredientes de cada comida para acercarte a esa meta, mientras mantienes el plato sensato).` : ''}

Tu respuesta DEBE ser EXCLUSIVAMENTE un objeto JSON válido con esta estructura exacta, sin texto en markdown antes ni después, sin explicaciones adicionales:
{
"menu": [
{ "dia": 1, ${exampleJsonMeal}${otherKeysExample ? ', ' + otherKeysExample : ''} }
]
}`
}

function extractJson(rawText) {
  // GLM a veces envuelve el JSON en ```json ... ``` o agrega un bloque
  // <think>...</think> antes de la respuesta final. Limpiamos ambos casos.
  let cleaned = rawText.trim()

  // Quita cualquier bloque de razonamiento <think>...</think> si el modelo lo incluye.
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  return JSON.parse(cleaned)
}

export default async function handler(req, res) {
  // CORS básico: solo permitimos POST desde el propio origen del despliegue.
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' })
  }

  const apiKey = process.env.ZAI_API_KEY
  if (!apiKey) {
    console.error('ZAI_API_KEY no está configurada en las variables de entorno de Vercel.')
    return res.status(500).json({ error: 'Configuración del servidor incompleta. Falta la API key.' })
  }

  try {
    const { imageBase64, mimeType, personas, dias, numComidas, caloriasObjetivo } = req.body || {}

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: 'Falta la imagen del ticket (imageBase64 / mimeType).' })
    }

    const numPersonas = Number(personas) || 2
    const numDias = Number(dias) || 3
    const numMealsRaw = Number(numComidas) || 2
    const numMeals = Math.min(5, Math.max(1, numMealsRaw))
    const calMeta = caloriasObjetivo ? Number(caloriasObjetivo) : null

    if (numPersonas < 1 || numPersonas > 20) {
      return res.status(400).json({ error: 'El número de personas debe estar entre 1 y 20.' })
    }
    if (numDias < 1 || numDias > 14) {
      return res.status(400).json({ error: 'Los días a planificar deben estar entre 1 y 14.' })
    }

    const mealKeys = MEAL_KEYS_BY_COUNT[numMeals]
    const systemPrompt = buildSystemPrompt(numPersonas, numDias, mealKeys, calMeta)

    // GLM-4.6V-Flash usa el formato OpenAI-compatible: image_url con data URI base64.
    const zaiPayload = {
      model: ZAI_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`
              }
            },
            { type: 'text', text: systemPrompt }
          ]
        }
      ],
      thinking: { type: 'disabled' }, // respuesta directa, sin razonamiento expuesto
      temperature: 0.4
    }

    const zaiResponse = await fetch(ZAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(zaiPayload)
    })

    if (!zaiResponse.ok) {
      const errorBody = await zaiResponse.text()
      console.error('Error de la API de Z.ai:', zaiResponse.status, errorBody)
      return res.status(502).json({
        error: 'La IA no pudo procesar el ticket. Intenta con una foto más clara y nítida.'
      })
    }

    const zaiData = await zaiResponse.json()
    const rawText = zaiData?.choices?.[0]?.message?.content

    if (!rawText) {
      console.error('Respuesta de Z.ai sin texto utilizable:', JSON.stringify(zaiData))
      return res.status(502).json({ error: 'La IA devolvió una respuesta vacía. Intenta de nuevo.' })
    }

    let menuData
    try {
      menuData = extractJson(rawText)
    } catch (parseError) {
      console.error('No se pudo parsear el JSON de Z.ai:', rawText)
      return res.status(502).json({
        error: 'No pudimos interpretar el menú generado. Intenta con otra foto del ticket.'
      })
    }

    if (!menuData?.menu || !Array.isArray(menuData.menu)) {
      return res.status(502).json({ error: 'El formato del menú generado es inválido.' })
    }

    return res.status(200).json(menuData)
  } catch (error) {
    console.error('Error inesperado en /api/generate-menu:', error)
    return res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' })
  }
}
