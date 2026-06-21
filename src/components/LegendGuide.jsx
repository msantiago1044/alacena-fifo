import { useState } from 'react'
import { HelpCircle, X, Beef, Wheat, Droplet, Flame } from 'lucide-react'

const NIVELES = [
  {
    dot: 'bg-fresh',
    badge: 'bg-fresh text-white',
    label: 'Urgencia alta',
    rango: 'Días 1-2',
    explicacion: 'Lo más perecedero: carnes frescas, pescado, lácteos y verduras de hoja. Esto se vence primero, así que se cocina primero.'
  },
  {
    dot: 'bg-amber',
    badge: 'bg-amber text-white',
    label: 'Urgencia media',
    rango: 'Días 3-4',
    explicacion: 'Alimentos que aguantan unos días más sin dañarse: huevos, embutidos, tubérculos, verduras más resistentes.'
  },
  {
    dot: 'bg-pantry',
    badge: 'bg-pantry text-white',
    label: 'Despensa / secos',
    rango: 'Días 5 en adelante',
    explicacion: 'Enlatados, pastas, arroz y granos. No se dañan rápido, así que quedan para el final del plan.'
  }
]

const MACROS = [
  { icon: <Beef size={14} className="text-fresh" />, label: 'Proteína (prot)', explicacion: 'Construye y repara músculo. Carnes, huevos, lácteos y legumbres son las fuentes principales.' },
  { icon: <Wheat size={14} className="text-amber" />, label: 'Carbohidratos (carb)', explicacion: 'La energía principal del cuerpo. Arroz, pasta, pan, papa y frutas.' },
  { icon: <Droplet size={14} className="text-pantry" />, label: 'Grasas', explicacion: 'Energía de reserva y absorción de vitaminas. Aceites, frutos secos, lácteos enteros.' }
]

export default function LegendGuide() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-4 animate-fade-up">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold text-ink/55 hover:text-ink transition-colors"
        aria-expanded={open}
      >
        <HelpCircle size={15} />
        ¿Qué significan las etiquetas de cada día?
      </button>

      {open && (
        <div className="mt-3 bg-white border border-line rounded-2xl p-4 relative animate-fade-up">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar explicación"
            className="absolute top-3 right-3 text-ink/35 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>

          <p className="text-sm text-ink/70 mb-4 pr-6">
            Cada día de tu menú lleva una etiqueta de color. No es una calificación
            del plato — es el orden en que conviene gastar lo que compraste, para
            que nada se dañe en la nevera.
          </p>

          <div className="space-y-3">
            {NIVELES.map((nivel) => (
              <div key={nivel.label} className="flex items-start gap-3">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${nivel.dot}`} />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${nivel.badge}`}>
                      {nivel.label}
                    </span>
                    <span className="text-[11px] text-ink/40 font-medium">{nivel.rango}</span>
                  </div>
                  <p className="text-sm text-ink/65 leading-snug">{nivel.explicacion}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-line my-4" />

          <p className="text-sm font-display font-semibold text-ink mb-3">
            Ingredientes, macros y calorías
          </p>
          <p className="text-sm text-ink/65 mb-3 leading-snug">
            Cada comida lista las cantidades reales estimadas a partir de tu
            ticket (por ejemplo "250 g pechuga de pollo"), no solo el nombre
            del ingrediente.
          </p>

          <div className="space-y-2.5 mb-3">
            {MACROS.map((m) => (
              <div key={m.label} className="flex items-start gap-2.5">
                <span className="mt-0.5">{m.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-ink/80">{m.label}</p>
                  <p className="text-[13px] text-ink/55 leading-snug">{m.explicacion}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5">
            <Flame size={14} className="text-amber mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-ink/80">Calorías ajustables</p>
              <p className="text-[13px] text-ink/55 leading-snug">
                Usa los botones <strong>−</strong> / <strong>+</strong> junto a las
                "kcal" de cualquier comida para subir o bajar su meta calórica.
                Las cantidades de ingredientes y los macros se recalculan al
                instante, de forma proporcional.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
