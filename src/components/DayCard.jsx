import { useState } from 'react'
import { Youtube, Flame, Beef, Wheat, Droplet, Minus, Plus } from 'lucide-react'
import { MEAL_LABELS } from '../utils/mealPlan'

// Sistema visual de urgencia FIFO: los primeros días llevan el color de
// "frescura alta" (verde), los días medios pasan a ámbar, y los últimos
// días (alimentos secos/enlatados) usan el tono "despensa" (marrón).
function getUrgencyStyle(dia) {
  if (dia <= 2) {
    return {
      label: 'Urgencia alta',
      badge: 'bg-fresh text-white',
      ring: 'border-fresh/25',
      dot: 'bg-fresh'
    }
  }
  if (dia <= 4) {
    return {
      label: 'Urgencia media',
      badge: 'bg-amber text-white',
      ring: 'border-amber/25',
      dot: 'bg-amber'
    }
  }
  return {
    label: 'Despensa / secos',
    badge: 'bg-pantry text-white',
    ring: 'border-pantry/25',
    dot: 'bg-pantry'
  }
}

function youtubeSearchUrl(plato) {
  const query = `receta de ${plato}`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}

function formatCantidad(ing) {
  const cantidad = ing.cantidad
  const unidad = ing.unidad || ''
  // Si es un número entero lo mostramos sin decimales, si no, con 1 decimal.
  const cantidadStr = Number.isInteger(cantidad) ? String(cantidad) : cantidad.toFixed(1)
  return unidad ? `${cantidadStr} ${unidad}` : cantidadStr
}

function MacroPill({ icon, value, label }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-ink/55">
      {icon}
      <span className="font-semibold text-ink/75">{value}g</span>
      <span className="text-ink/40">{label}</span>
    </div>
  )
}

function MealBlock({ mealKey, comida, onCaloriasChange }) {
  const [caloriasInput, setCaloriasInput] = useState(comida?.calorias ?? '')

  if (!comida) return null

  const titulo = MEAL_LABELS[mealKey] || mealKey

  function commitCalorias(nuevoValor) {
    const parsed = Number(nuevoValor)
    if (!Number.isNaN(parsed) && parsed > 0) {
      onCaloriasChange(mealKey, parsed)
    }
  }

  function step(delta) {
    const nuevoValor = Math.max(50, (Number(caloriasInput) || comida.calorias) + delta)
    setCaloriasInput(nuevoValor)
    commitCalorias(nuevoValor)
  }

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink/40 mb-1.5">
        {titulo}
      </p>
      <p className="font-display font-semibold text-ink text-[15px] leading-snug mb-2">
        {comida.plato}
      </p>

      {comida.ingredientes?.length > 0 && (
        <ul className="mb-3 space-y-0.5">
          {comida.ingredientes.map((ing, idx) => (
            <li key={idx} className="text-[12px] text-ink/60 flex items-baseline gap-1.5">
              <span className="w-1 h-1 rounded-full bg-ink/25 shrink-0 translate-y-[-1px]" />
              <span className="text-ink/75 font-medium">{formatCantidad(ing)}</span>
              <span>{ing.nombre}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Control de calorías ajustable */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <Flame size={13} className="text-amber" />
        <button
          type="button"
          onClick={() => step(-50)}
          aria-label="Bajar 50 calorías"
          className="w-5 h-5 flex items-center justify-center rounded-md border border-line text-ink/50 hover:bg-ink/5 active:scale-90 transition-all"
        >
          <Minus size={11} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={caloriasInput}
          onChange={(e) => setCaloriasInput(e.target.value)}
          onBlur={(e) => commitCalorias(e.target.value)}
          className="w-14 bg-transparent text-sm font-bold text-ink text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-[11px] text-ink/40">kcal</span>
        <button
          type="button"
          onClick={() => step(50)}
          aria-label="Subir 50 calorías"
          className="w-5 h-5 flex items-center justify-center rounded-md border border-line text-ink/50 hover:bg-ink/5 active:scale-90 transition-all"
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Macros */}
      <div className="flex items-center gap-3 mb-3">
        <MacroPill icon={<Beef size={12} className="text-fresh" />} value={comida.proteina_g ?? 0} label="prot" />
        <MacroPill icon={<Wheat size={12} className="text-amber" />} value={comida.carbohidratos_g ?? 0} label="carb" />
        <MacroPill icon={<Droplet size={12} className="text-pantry" />} value={comida.grasas_g ?? 0} label="grasa" />
      </div>

      <a
        href={youtubeSearchUrl(comida.plato)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-youtube text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-youtube/90 active:scale-[0.97] transition-all shadow-sm"
      >
        <Youtube size={15} fill="white" /> Ver receta
      </a>
    </div>
  )
}

export default function DayCard({ dia, comidas, mealKeys, index, onMealCaloriasChange }) {
  const style = getUrgencyStyle(dia)

  return (
    <div
      className={`bg-white rounded-2xl border ${style.ring} p-4 sm:p-5 animate-fade-up`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          <h3 className="font-display font-bold text-ink text-lg">Día {dia}</h3>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${style.badge}`}>
          {style.label}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6">
        {mealKeys.map((mealKey, idx) => (
          <div
            key={mealKey}
            className={idx > 0 ? 'sm:pl-6 sm:border-l sm:border-line' : ''}
          >
            <MealBlock
              mealKey={mealKey}
              comida={comidas[mealKey]}
              onCaloriasChange={(key, nuevasCalorias) => onMealCaloriasChange(dia, key, nuevasCalorias)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
