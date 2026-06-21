import { FlaskConical } from 'lucide-react'

export default function DemoBanner() {
  return (
    <div className="flex items-center gap-2 bg-amber/10 border border-amber/30 text-amber px-4 py-2.5 rounded-xl text-xs font-semibold mb-4">
      <FlaskConical size={15} />
      Modo Demo activo — usando datos simulados, no se consumen peticiones reales a Gemini.
    </div>
  )
}
