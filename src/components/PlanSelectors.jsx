import { Users, CalendarDays, UtensilsCrossed, Flame, Minus, Plus } from 'lucide-react'
import { describeMealPlan } from '../utils/mealPlan'

const LIMITS = {
  personas: { min: 1, max: 20 },
  dias: { min: 1, max: 14 },
  numComidas: { min: 1, max: 5 }
}

function clamp(value, { min, max }) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function NumberField({ id, label, icon, value, onChange, limits, unit, unitPlural, helperText }) {
  function step(delta) {
    onChange(clamp(value + delta, limits))
  }

  function handleTyped(e) {
    const raw = e.target.value
    if (raw === '') {
      onChange('')
      return
    }
    const parsed = Number(raw)
    if (!Number.isNaN(parsed)) {
      onChange(parsed)
    }
  }

  function handleBlur() {
    // Si el campo queda vacío o fuera de rango al salir, lo corregimos.
    onChange(clamp(Number(value) || limits.min, limits))
  }

  return (
    <div className="bg-white rounded-xl border border-line p-4">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold text-ink/55 uppercase tracking-wide mb-2">
        {icon} {label}
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={value <= limits.min}
          aria-label={`Restar ${label.toLowerCase()}`}
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-line text-ink/60 hover:bg-ink/5 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus size={16} />
        </button>

        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={limits.min}
          max={limits.max}
          value={value}
          onChange={handleTyped}
          onBlur={handleBlur}
          className="w-full min-w-0 bg-transparent font-display text-2xl font-semibold text-ink text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => step(1)}
          disabled={value >= limits.max}
          aria-label={`Sumar ${label.toLowerCase()}`}
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-line text-ink/60 hover:bg-ink/5 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
        </button>
      </div>

      <p className="text-[11px] text-ink/40 mt-1.5 text-center">
        {helperText || `${value === 1 ? unit : unitPlural} · máx. ${limits.max}`}
      </p>
    </div>
  )
}

export default function PlanSelectors({
  personas,
  dias,
  numComidas,
  caloriasObjetivo,
  onPersonasChange,
  onDiasChange,
  onNumComidasChange,
  onCaloriasObjetivoChange
}) {
  return (
    <div className="space-y-3 animate-fade-up">
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id="personas"
          label="Personas"
          icon={<Users size={14} />}
          value={personas}
          onChange={onPersonasChange}
          limits={LIMITS.personas}
          unit="persona"
          unitPlural="personas"
        />
        <NumberField
          id="dias"
          label="Días"
          icon={<CalendarDays size={14} />}
          value={dias}
          onChange={onDiasChange}
          limits={LIMITS.dias}
          unit="día"
          unitPlural="días"
        />
      </div>

      <NumberField
        id="numComidas"
        label="Comidas al día"
        icon={<UtensilsCrossed size={14} />}
        value={numComidas}
        onChange={onNumComidasChange}
        limits={LIMITS.numComidas}
        helperText={describeMealPlan(numComidas)}
      />

      <div className="bg-white rounded-xl border border-line p-4">
        <label htmlFor="caloriasObjetivo" className="flex items-center gap-1.5 text-xs font-semibold text-ink/55 uppercase tracking-wide mb-2">
          <Flame size={14} /> Calorías objetivo por comida (opcional)
        </label>
        <input
          id="caloriasObjetivo"
          type="number"
          inputMode="numeric"
          min={0}
          step={50}
          placeholder="Ej: 500"
          value={caloriasObjetivo}
          onChange={(e) => onCaloriasObjetivoChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full bg-transparent font-display text-2xl font-semibold text-ink focus:outline-none placeholder:text-ink/25 placeholder:font-normal placeholder:text-base"
        />
        <p className="text-[11px] text-ink/40 mt-1.5">
          Déjalo vacío si no tienes una meta calórica específica.
        </p>
      </div>
    </div>
  )
}
