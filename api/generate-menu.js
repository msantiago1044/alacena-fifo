// /api/generate-menu.js
//
// Función Serverless de Vercel. Actúa como proxy seguro entre el frontend
// y la API de Z.ai (Zhipu AI), usando el modelo de visión GLM-4.6V-Flash
// (gratuito, no solo crédito de prueba). La ZAI_API_KEY vive exclusivamente
// en las variables de entorno de Vercel y nunca se expone al cliente.
//
// El frontend envía: { imageBase64, mimeType, personas, dias }
// Esta función responde con: { menu: [ { dia, almuerzo, cena }, ... ] }

const ZAI_MODEL = 'glm-4.6v-flash'
const ZAI_URL = 'https://api.z.ai/api/paas/v4/chat/completions'

function buildSystemPrompt(personas, dias) {
  return `Eres un Chef experto en economía doméstica y el principio de Baja Entropía (desperdicio cero). Analiza los alimentos de esta factura. Tu objetivo es armar un plan de almuerzos y cenas para ${personas} personas durante ${dias} días.
REGLA FIFO OBLIGATORIA: Debes gastar primero los alimentos altamente perecederos (carnes frescas, verduras de hoja, lácteos, pescados) en los días 1, 2 y 3. Los alimentos secos o enlatados déjalos para los días finales.
Tu respuesta DEBE ser EXCLUSIVAMENTE un objeto JSON válido con esta estructura exacta, sin texto en markdown antes ni después:
{
"menu": [
{ "dia": 1, "almuerzo": { "plato": "...", "ingredientes_clave": ["..."] }, "cena": { "plato": "...", "ingredientes_clave": ["..."] } }
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
    const { imageBase64, mimeType, personas, dias } = req.body || {}

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: 'Falta la imagen del ticket (imageBase64 / mimeType).' })
    }

    const numPersonas = Number(personas) || 2
    const numDias = Number(dias) || 3

    if (numPersonas < 1 || numPersonas > 8) {
      return res.status(400).json({ error: 'El número de personas debe estar entre 1 y 8.' })
    }
    if (numDias < 1 || numDias > 7) {
      return res.status(400).json({ error: 'Los días a planificar deben estar entre 1 y 7.' })
    }

    const systemPrompt = buildSystemPrompt(numPersonas, numDias)

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
