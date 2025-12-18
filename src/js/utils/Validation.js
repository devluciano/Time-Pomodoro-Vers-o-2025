/**
 * Módulo de validação de inputs
 */

// Constantes de validação
export const MIN_VALUE = 1
export const MAX_MINUTES = 120
export const MAX_SESSIONS = 50

/**
 * Limpa todos os erros de validação
 * @param {UIManager} uiManager - Instância do UIManager
 */
export function limparErros(uiManager) {
   uiManager.clearErrors()
}

/**
 * Valida um input numérico
 * @param {HTMLInputElement} input - Elemento input a validar
 * @param {string} nome - Nome do campo (para mensagens de erro)
 * @param {UIManager} uiManager - Instância do UIManager
 * @param {number} min - Valor mínimo (padrão: MIN_VALUE)
 * @param {number} max - Valor máximo (padrão: MAX_MINUTES)
 * @returns {boolean} true se válido, false caso contrário
 */
export function validarInput(input, nome, uiManager, min = MIN_VALUE, max = MAX_MINUTES) {
   const valor = parseInt(input.value, 10)
   
   // Campo obrigatório
   if (!input.value || input.value.trim() === '') {
      uiManager.showError(nome, `${nome.charAt(0).toUpperCase() + nome.slice(1)} é obrigatório`)
      input.focus()
      return false
   }
   
   // Deve ser número
   if (isNaN(valor) || valor !== parseFloat(input.value)) {
      uiManager.showError(nome, `${nome.charAt(0).toUpperCase() + nome.slice(1)} deve ser um número inteiro`)
      input.focus()
      return false
   }
   
   // Valor mínimo
   if (valor < min) {
      uiManager.showError(nome, `${nome.charAt(0).toUpperCase() + nome.slice(1)} deve ser no mínimo ${min}`)
      input.focus()
      return false
   }
   
   // Valor máximo
   if (valor > max) {
      uiManager.showError(nome, `${nome.charAt(0).toUpperCase() + nome.slice(1)} deve ser no máximo ${max}`)
      input.focus()
      return false
   }
   
   // Limpar erro se válido
   uiManager.showError(nome, '')
   return true
}

/**
 * Valida todos os inputs do formulário
 * @param {HTMLInputElement} acaoInput - Input de ação
 * @param {HTMLInputElement} pausaInput - Input de pausa
 * @param {HTMLInputElement} sessoesInput - Input de sessões
 * @param {UIManager} uiManager - Instância do UIManager
 * @returns {boolean} true se todos válidos, false caso contrário
 */
export function validarTodosInputs(acaoInput, pausaInput, sessoesInput, uiManager) {
   limparErros(uiManager)
   
   const acaoValida = validarInput(acaoInput, 'acao', uiManager, MIN_VALUE, MAX_MINUTES)
   const pausaValida = validarInput(pausaInput, 'pausa', uiManager, MIN_VALUE, MAX_MINUTES)
   const sessoesValida = validarInput(sessoesInput, 'sessoes', uiManager, MIN_VALUE, MAX_SESSIONS)
   
   return acaoValida && pausaValida && sessoesValida
}

