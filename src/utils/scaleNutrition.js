/**
 * Reescala una comida completa (ingredientes + macros) de forma proporcional
 * según una nueva meta de calorías. Es un cálculo aproximado en el cliente
 * (regla de tres simple) — no vuelve a llamar a la IA, así que es instantáneo.
 *
 * @param {object} comida - { plato, ingredientes: [{nombre, cantidad, unidad}], calorias, proteina_g, carbohidratos_g, grasas_g }
 * @param {number} nuevasCalorias - meta de calorías deseada para esta comida
 * @returns {object} comida con cantidades y macros reescalados
 */
export function scaleMeal(comida, nuevasCalorias) {
  if (!comida || !comida.calorias || comida.calorias <= 0) return comida
  if (!nuevasCalorias || nuevasCalorias <= 0) return comida

  const factor = nuevasCalorias / comida.calorias

  const ingredientesEscalados = (comida.ingredientes || []).map((ing) => {
    const cantidadOriginal = Number(ing.cantidad) || 0
    const cantidadEscalada = cantidadOriginal * factor
    // Redondeamos a 1 decimal para que no se vea como "133.3333333 g"
    const cantidadRedondeada = Math.round(cantidadEscalada * 10) / 10
    return { ...ing, cantidad: cantidadRedondeada }
  })

  return {
    ...comida,
    ingredientes: ingredientesEscalados,
    calorias: Math.round(nuevasCalorias),
    proteina_g: Math.round((comida.proteina_g || 0) * factor),
    carbohidratos_g: Math.round((comida.carbohidratos_g || 0) * factor),
    grasas_g: Math.round((comida.grasas_g || 0) * factor)
  }
}
