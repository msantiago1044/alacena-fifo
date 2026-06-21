import { useRef, useState } from 'react'
import { Camera, ImagePlus, X, Receipt } from 'lucide-react'
import { compressImage } from '../utils/compressImage'

export default function TicketUploader({ onImageReady, compressedImage }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  async function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Ese archivo no es una imagen. Sube un JPG o PNG del ticket.')
      return
    }

    setError(null)
    setIsProcessing(true)
    try {
      const result = await compressImage(file)
      onImageReady(result)
    } catch (err) {
      setError('No pudimos procesar la imagen. Intenta con otra foto.')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  function clearImage() {
    onImageReady(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  if (compressedImage) {
    return (
      <div className="relative animate-fade-up">
        <div className="rounded-2xl overflow-hidden border-2 border-ink/10 bg-white shadow-sm">
          <img
            src={compressedImage.previewUrl}
            alt="Vista previa del ticket subido"
            className="w-full max-h-72 object-contain bg-ink/5"
          />
          <div className="flex items-center justify-between px-4 py-2.5 bg-fresh/5 border-t border-fresh/15">
            <span className="text-xs font-mono text-fresh font-medium">
              ✓ Listo · {compressedImage.sizeKB} KB
            </span>
            <button
              onClick={clearImage}
              className="flex items-center gap-1 text-xs font-semibold text-ink/60 hover:text-youtube transition-colors"
              type="button"
            >
              <X size={14} /> Quitar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="border-2 border-dashed border-line rounded-2xl p-8 text-center bg-white/60 hover:bg-white transition-colors">
        <div className="flex justify-center mb-3">
          <div className="bg-fresh/10 rounded-full p-3">
            <Receipt className="text-fresh" size={28} strokeWidth={2} />
          </div>
        </div>
        <p className="font-display font-semibold text-ink text-lg mb-1">
          Sube la foto de tu ticket
        </p>
        <p className="text-sm text-ink/55 mb-5">
          JPG o PNG · lo comprimimos automáticamente
        </p>

        {isProcessing ? (
          <div className="text-sm font-medium text-fresh">Comprimiendo imagen…</div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-fresh text-white font-semibold px-5 py-3 rounded-xl shadow-sm hover:bg-fresh/90 active:scale-[0.98] transition-all"
            >
              <Camera size={18} /> Tomar foto
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-white border-2 border-ink/15 text-ink font-semibold px-5 py-3 rounded-xl hover:border-ink/30 active:scale-[0.98] transition-all"
            >
              <ImagePlus size={18} /> Elegir archivo
            </button>
          </div>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p className="text-sm text-youtube font-medium mt-3 text-center">{error}</p>
      )}
    </div>
  )
}
