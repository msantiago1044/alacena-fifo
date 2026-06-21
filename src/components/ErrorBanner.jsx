import { AlertTriangle } from 'lucide-react'

export default function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 bg-youtube/5 border border-youtube/25 text-ink px-4 py-3 rounded-xl mb-4 animate-fade-up">
      <AlertTriangle size={18} className="text-youtube shrink-0 mt-0.5" />
      <p className="text-sm leading-snug">{message}</p>
    </div>
  )
}
