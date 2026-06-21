import { MessageCircle, RotateCcw } from 'lucide-react'

function buildWhatsAppText(menu, personas, dias) {
  const lineas = []
  lineas.push(`🥗 *MENÚ ALACENA FIFO* — ${personas} ${personas === 1 ? 'persona' : 'personas'} · ${dias} ${dias === 1 ? 'día' : 'días'}`)
  lineas.push('')

  menu.forEach((d) => {
    lineas.push(`📅 *Día ${d.dia}*`)
    if (d.almuerzo) lineas.push(`🍽️ Almuerzo: ${d.almuerzo.plato}`)
    if (d.cena) lineas.push(`🌙 Cena: ${d.cena.plato}`)
    lineas.push('')
  })

  lineas.push('Generado con Alacena Inteligente FIFO — cero desperdicio, cero estrés.')
  return lineas.join('\n')
}

export default function ShareActions({ menu, personas, dias, onReset }) {
  function handleShare() {
    const text = buildWhatsAppText(menu, personas, dias)
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col gap-3 mt-6 animate-fade-up">
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center justify-center gap-2 bg-whatsapp text-white font-bold text-base px-6 py-4 rounded-2xl shadow-md hover:bg-whatsapp/90 active:scale-[0.98] transition-all"
      >
        <MessageCircle size={20} fill="white" /> Compartir menú por WhatsApp
      </button>

      <button
        type="button"
        onClick={onReset}
        className="flex items-center justify-center gap-2 bg-transparent text-ink/60 font-semibold text-sm px-6 py-3 rounded-xl border border-ink/15 hover:bg-ink/5 active:scale-[0.98] transition-all"
      >
        <RotateCcw size={16} /> Subir nuevo ticket
      </button>
    </div>
  )
}
