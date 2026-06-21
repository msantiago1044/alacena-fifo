import { useState, useCallback } from 'react'

const STORAGE_KEY = 'alacena-fifo:ultimo-menu'

/**
 * Persistencia Zero-DB: el último menú generado y sus metadatos
 * (personas, días, fecha) viven en localStorage del dispositivo.
 */
export function useMenuStorage() {
  const [storedMenu, setStoredMenu] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const saveMenu = useCallback((menuData, meta) => {
    const payload = {
      menu: menuData.menu,
      personas: meta.personas,
      dias: meta.dias,
      generadoEn: new Date().toISOString()
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e)
    }
    setStoredMenu(payload)
  }, [])

  const clearMenu = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.warn('No se pudo limpiar localStorage:', e)
    }
    setStoredMenu(null)
  }, [])

  return { storedMenu, saveMenu, clearMenu }
}
