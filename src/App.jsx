import { useState } from 'react'
import { ChefHat, Sprout } from 'lucide-react'

import TicketUploader from './components/TicketUploader'
import PlanSelectors from './components/PlanSelectors'
import LoadingState from './components/LoadingState'
import DayCard from './components/DayCard'
import ShareActions from './components/ShareActions'
import DemoBanner from './components/DemoBanner'
import ErrorBanner from './components/ErrorBanner'
import LegendGuide from './components/LegendGuide'
import AdjustPlanPanel from './components/AdjustPlanPanel'
import { useMenuStorage } from './hooks/useMenuStorage'
import mockMenu from './data/mockMenu.json'

// ──────────────────────────────────────────────────────────────
// MODO DEMO: cuando está en true, la app usa mockMenu.json en vez
// de llamar a /api/generate-menu.js. Útil para diseñar y probar la
// interfaz sin gastar peticiones reales a la IA (GLM-4.6V-Flash de
// Z.ai). Cuando estés listo para producción, cambia esto a false.
// ──────────────────────────────────────────────────────────────
const DEMO_MODE = true

const STEPS = {
  FORM: 'form',
  LOADING: 'loading',
  RESULT: 'result'
}

function simulateNetworkDelay(ms = 2400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function App() {
  const [step, setStep] = useState(STEPS.FORM)
  const [compressedImage, setCompressedImage] = useState(null)
  const [personas, setPersonas] = useState(2)
  const [dias, setDias] = useState(3)
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const { saveMenu, clearMenu } = useMenuStorage()

  async function handleGenerate() {
    if (!compressedImage) {
      setError('Sube primero la foto de tu ticket.')
      return
    }

    setError(null)
    setStep(STEPS.LOADING)

    try {
      let data

      if (DEMO_MODE) {
        await simulateNetworkDelay()
        // Generamos exactamente la cantidad de días pedida ciclando el mock
        // si el usuario pide más días de los que mockMenu.json contiene.
        data = {
          menu: Array.from({ length: dias }, (_, i) => ({
            ...mockMenu.menu[i % mockMenu.menu.length],
            dia: i + 1
          }))
        }
      } else {
        const response = await fetch('/api/generate-menu.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: compressedImage.base64,
            mimeType: compressedImage.mimeType,
            personas,
            dias
          })
        })

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}))
          throw new Error(errBody.error || 'No se pudo generar el menú. Intenta de nuevo.')
        }

        data = await response.json()
      }

      setMenu(data.menu)
      saveMenu(data, { personas, dias })
      setStep(STEPS.RESULT)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Algo salió mal generando tu menú. Intenta de nuevo.')
      setStep(STEPS.FORM)
    } finally {
      setIsRegenerating(false)
    }
  }

  function handleRegenerate() {
    setIsRegenerating(true)
    handleGenerate()
  }

  function handleReset() {
    setCompressedImage(null)
    setMenu(null)
    setError(null)
    clearMenu()
    setStep(STEPS.FORM)
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header tipo encabezado de ticket */}
      <header className="bg-ink text-paper relative receipt-tear pb-6">
        <div className="max-w-2xl mx-auto px-5 pt-8 pb-2">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-fresh/20 rounded-lg p-1.5">
              <Sprout className="text-fresh" size={20} />
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-paper/60">
              Cero desperdicio
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl leading-tight">
            Alacena Inteligente <span className="text-fresh">FIFO</span>
          </h1>
          <p className="text-paper/65 text-sm mt-2 max-w-md">
            Sube tu ticket. Te armamos el menú de la semana respetando lo que se vence primero.
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-8 pb-16">
        {DEMO_MODE && <DemoBanner />}
        <ErrorBanner message={error} />

        {step === STEPS.FORM && (
          <div className="space-y-5">
            <TicketUploader
              onImageReady={setCompressedImage}
              compressedImage={compressedImage}
            />

            <PlanSelectors
              personas={personas}
              dias={dias}
              onPersonasChange={setPersonas}
              onDiasChange={setDias}
            />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!compressedImage}
              className="w-full flex items-center justify-center gap-2 bg-ink text-paper font-display font-bold text-base px-6 py-4 rounded-2xl shadow-md hover:bg-ink/90 active:scale-[0.98] transition-all disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChefHat size={20} /> Generar menú de baja entropía
            </button>
          </div>
        )}

        {step === STEPS.LOADING && <LoadingState />}

        {step === STEPS.RESULT && menu && (
          <div>
            <AdjustPlanPanel
              personas={personas}
              dias={dias}
              onPersonasChange={setPersonas}
              onDiasChange={setDias}
              onRegenerate={handleRegenerate}
              isRegenerating={isRegenerating}
            />

            <LegendGuide />

            <div className="space-y-3 mb-2">
              {menu.map((dia, idx) => (
                <DayCard
                  key={dia.dia}
                  dia={dia.dia}
                  almuerzo={dia.almuerzo}
                  cena={dia.cena}
                  index={idx}
                />
              ))}
            </div>

            <ShareActions
              menu={menu}
              personas={personas}
              dias={dias}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-ink/35 pb-8 px-5">
        Tu ticket se procesa una sola vez y no se guarda en ningún servidor.
      </footer>
    </div>
  )
}
