import { useEffect, useState } from 'react'
import { ScanLine } from 'lucide-react'

const FRASES = [
  'Analizando ticket…',
  'Aplicando lógica FIFO (lo primero en entrar es lo primero en salir)…',
  'Buscando recetas para que no se te dañe el tomate…',
  'Ordenando los lácteos antes de que se corten…',
  'Calculando porciones para que nadie se quede con hambre…',
  'Revisando qué verdura está pidiendo auxilio…',
  'Armando el menú de la semana, plato por plato…'
]

export default function LoadingState() {
  const [fraseIndex, setFraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFraseIndex((prev) => (prev + 1) % FRASES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="animate-fade-up">
      {/* Ticket "escaneándose" */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-fresh/20 bg-white p-6 mb-5">
        <div className="absolute inset-x-0 h-1 bg-fresh/40 animate-scan" />
        <div className="flex items-center gap-3">
          <div className="bg-fresh/10 rounded-full p-2.5 shrink-0">
            <ScanLine className="text-fresh" size={20} />
          </div>
          <p className="font-medium text-ink text-sm leading-snug min-h-[2.5rem] flex items-center">
            {FRASES[fraseIndex]}
          </p>
        </div>
      </div>

      {/* Skeleton de tarjetas de días */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-line p-4 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}>
            <div className="h-3 w-20 bg-line rounded mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="h-2.5 w-14 bg-line rounded" />
                <div className="h-4 w-full bg-line rounded" />
                <div className="h-4 w-3/4 bg-line rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-14 bg-line rounded" />
                <div className="h-4 w-full bg-line rounded" />
                <div className="h-4 w-3/4 bg-line rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
