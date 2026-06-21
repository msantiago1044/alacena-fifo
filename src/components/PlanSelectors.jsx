import { Users, CalendarDays } from 'lucide-react'

export default function PlanSelectors({ personas, dias, onPersonasChange, onDiasChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 animate-fade-up">
      <div className="bg-white rounded-xl border border-line p-4">
        <label htmlFor="personas" className="flex items-center gap-1.5 text-xs font-semibold text-ink/55 uppercase tracking-wide mb-2">
          <Users size={14} /> Personas
        </label>
        <select
          id="personas"
          value={personas}
          onChange={(e) => onPersonasChange(Number(e.target.value))}
          className="w-full bg-transparent font-display text-2xl font-semibold text-ink focus:outline-none"
        >
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-line p-4">
        <label htmlFor="dias" className="flex items-center gap-1.5 text-xs font-semibold text-ink/55 uppercase tracking-wide mb-2">
          <CalendarDays size={14} /> Días
        </label>
        <select
          id="dias"
          value={dias}
          onChange={(e) => onDiasChange(Number(e.target.value))}
          className="w-full bg-transparent font-display text-2xl font-semibold text-ink focus:outline-none"
        >
          {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'día' : 'días'}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
