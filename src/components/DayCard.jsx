import { Youtube } from 'lucide-react'

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

function MealBlock({ titulo, comida }) {
  if (!comida) return null
  return (
    <div className="flex-1">
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink/40 mb-1.5">
        {titulo}
      </p>
      <p className="font-display font-semibold text-ink text-[15px] leading-snug mb-2.5">
        {comida.plato}
      </p>

      {comida.ingredientes_clave?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {comida.ingredientes_clave.map((ing, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium bg-ink/5 text-ink/65 px-2 py-0.5 rounded-full"
            >
              {ing}
            </span>
          ))}
        </div>
      )}

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

export default function DayCard({ dia, almuerzo, cena, index }) {
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

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:divide-x sm:divide-line">
        <MealBlock titulo="Almuerzo" comida={almuerzo} />
        <div className="sm:pl-6">
          <MealBlock titulo="Cena" comida={cena} />
        </div>
      </div>
    </div>
  )
}
