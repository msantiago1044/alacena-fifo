/**
 * Comprime una imagen en el cliente usando <canvas> antes de enviarla a la API.
 * Reduce el ancho a un máximo de 1000px y exporta en WebP (con fallback a JPEG
 * si el navegador no soporta WebP) a calidad 0.8, apuntando a un payload < 400KB.
 *
 * @param {File} file - Archivo de imagen original (cámara o galería)
 * @returns {Promise<{ base64: string, mimeType: string, sizeKB: number }>}
 */
const MAX_WIDTH = 1000
const QUALITY = 0.8
const TARGET_MAX_BYTES = 400 * 1024

function supportsWebP() {
  const canvas = document.createElement('canvas')
  if (!canvas.getContext) return false
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))

    reader.onload = (event) => {
      const img = new Image()

      img.onerror = () => reject(new Error('El archivo no es una imagen válida.'))

      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width)
        const targetWidth = Math.round(img.width * scale)
        const targetHeight = Math.round(img.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight

        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        const mimeType = supportsWebP() ? 'image/webp' : 'image/jpeg'

        const tryExport = (quality) => {
          const dataUrl = canvas.toDataURL(mimeType, quality)
          const base64 = dataUrl.split(',')[1]
          const sizeKB = Math.round((base64.length * 0.75) / 1024)
          return { dataUrl, base64, sizeKB }
        }

        let result = tryExport(QUALITY)

        // Si aún pesa más de 400KB, bajamos calidad progresivamente.
        let quality = QUALITY
        while (result.sizeKB * 1024 > TARGET_MAX_BYTES && quality > 0.4) {
          quality -= 0.1
          result = tryExport(quality)
        }

        resolve({
          base64: result.base64,
          mimeType,
          sizeKB: result.sizeKB,
          previewUrl: result.dataUrl
        })
      }

      img.src = event.target.result
    }

    reader.readAsDataURL(file)
  })
}
