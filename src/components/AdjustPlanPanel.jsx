import { useState } from 'react'
import { SlidersHorizontal, RefreshCw } from 'lucide-react'
import PlanSelectors from './PlanSelectors'

export default function AdjustPlanPanel({ personas, dias, onPersonasChange, onDiasChange, onRegenerate, isRegenerating }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-5 animate-fade-up">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-white border border-line rounded-xl px-4 py-3 hover:border-ink/25 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal size={16} className="text-ink/50" />
          {personas} {personas === 1 ? 'persona' : 'personas'} · {dias} {dias === 1 ? 'día' : 'días'}
        </span>
        <span className="text-xs font-medium text-fresh">
          {open ? 'Cerrar' : 'Cambiar'}
        </span>
      </button>

      {open && (
        <div className="mt-3 bg-white border border-line rounded-2xl p-4 animate-fade-up">
          <p className="text-xs text-ink/50 mb-3">
            Ajusta y vuelve a generar el menú con el mismo ticket.
          </p>

          <PlanSelectors
            personas={personas}
            dias={dias}
            onPersonasChange={onPersonasChange}
            onDiasChange={onDiasChange}
          />

          <button
            type="button"
            onClick={() => {
              onRegenerate()
              setOpen(false)
            }}
            disabled={isRegenerating}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-ink text-paper font-display font-bold text-sm px-5 py-3 rounded-xl shadow-sm hover:bg-ink/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} /> Volver a generar menú
          </button>
        </div>
      )}
    </div>
  )
}
