// Mapa fijo de comidas según cuántas se seleccionen (1 a 5). Debe coincidir
// exactamente con MEAL_KEYS_BY_COUNT en api/generate-menu.js.
export const MEAL_KEYS_BY_COUNT = {
  1: ['almuerzo'],
  2: ['almuerzo', 'cena'],
  3: ['desayuno', 'almuerzo', 'cena'],
  4: ['desayuno', 'media_manana', 'almuerzo', 'cena'],
  5: ['desayuno', 'media_manana', 'almuerzo', 'media_tarde', 'cena']
}

export const MEAL_LABELS = {
  desayuno: 'Desayuno',
  media_manana: 'Media mañana',
  almuerzo: 'Almuerzo',
  media_tarde: 'Media tarde',
  cena: 'Cena'
}

export function getMealKeys(numComidas) {
  return MEAL_KEYS_BY_COUNT[numComidas] || MEAL_KEYS_BY_COUNT[2]
}

export function describeMealPlan(numComidas) {
  return getMealKeys(numComidas).map((k) => MEAL_LABELS[k]).join(', ')
}
