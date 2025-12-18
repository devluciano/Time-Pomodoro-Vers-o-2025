/**
 * Classe StorageManager - Gerencia persistência no localStorage
 */
export class StorageManager {
   constructor() {
      this.TIMER_STATE_KEY = 'timerState'
      this.CONFIG_KEY_PREFIX = 'pomodoro_'
      this.MAX_STATE_AGE = 24 * 60 * 60 * 1000 // 24 horas
   }
   
   /**
    * Salva o estado do timer
    * @param {Object} state - Estado do timer
    */
   saveTimerState(state) {
      try {
         const stateToSave = {
            ...state,
            timestamp: Date.now()
         }
         localStorage.setItem(this.TIMER_STATE_KEY, JSON.stringify(stateToSave))
      } catch (e) {
         console.error('Erro ao salvar estado do timer:', e)
      }
   }
   
   /**
    * Carrega o estado do timer
    * @returns {Object|null} Estado do timer ou null se não existir ou expirado
    */
   loadTimerState() {
      try {
         const stateJson = localStorage.getItem(this.TIMER_STATE_KEY)
         if (!stateJson) return null
         
         const state = JSON.parse(stateJson)
         
         // Verificar se o estado não é muito antigo
         if (state.timestamp && (Date.now() - state.timestamp) > this.MAX_STATE_AGE) {
            this.clearTimerState()
            return null
         }
         
         return state
      } catch (e) {
         console.error('Erro ao carregar estado do timer:', e)
         return null
      }
   }
   
   /**
    * Limpa o estado do timer
    */
   clearTimerState() {
      try {
         localStorage.removeItem(this.TIMER_STATE_KEY)
      } catch (e) {
         console.error('Erro ao limpar estado do timer:', e)
      }
   }
   
   /**
    * Salva configuração
    * @param {string} key - Chave da configuração
    * @param {*} value - Valor da configuração
    */
   saveConfig(key, value) {
      try {
         localStorage.setItem(this.CONFIG_KEY_PREFIX + key, String(value))
      } catch (e) {
         console.error(`Erro ao salvar configuração ${key}:`, e)
      }
   }
   
   /**
    * Carrega configuração
    * @param {string} key - Chave da configuração
    * @returns {string|null} Valor da configuração ou null
    */
   loadConfig(key) {
      try {
         return localStorage.getItem(this.CONFIG_KEY_PREFIX + key)
      } catch (e) {
         console.error(`Erro ao carregar configuração ${key}:`, e)
         return null
      }
   }
   
   /**
    * Salva todas as configurações do Pomodoro
    * @param {Object} config - Objeto com acao, pausa, sessoes, materia, nome_aula
    */
   savePomodoroConfig(config) {
      this.saveConfig('acao', config.acao)
      this.saveConfig('pausa', config.pausa)
      this.saveConfig('sessoes', config.sessoes)
      if (config.materia) this.saveConfig('materia', config.materia)
      if (config.nome_aula) this.saveConfig('nome_aula', config.nome_aula)
      if (config.sessao_id) this.saveConfig('sessao_id', config.sessao_id)
      if (config.materia_id) this.saveConfig('materia_id', config.materia_id)
   }
   
   /**
    * Carrega todas as configurações do Pomodoro
    * @returns {Object|null} Objeto com acao, pausa, sessoes, materia, nome_aula ou null
    */
   loadPomodoroConfig() {
      const acao = this.loadConfig('acao')
      const pausa = this.loadConfig('pausa')
      const sessoes = this.loadConfig('sessoes')
      const materia = this.loadConfig('materia')
      const nome_aula = this.loadConfig('nome_aula')
      const sessao_id = this.loadConfig('sessao_id')
      const materia_id = this.loadConfig('materia_id')
      
      if (acao && pausa && sessoes) {
         const config = { acao, pausa, sessoes }
         if (materia) config.materia = materia
         if (nome_aula) config.nome_aula = nome_aula
         if (sessao_id) config.sessao_id = sessao_id
         if (materia_id) config.materia_id = materia_id
         return config
      }
      
      return null
   }
   
   /**
    * Limpa todas as configurações
    */
   clearAll() {
      try {
         localStorage.clear()
      } catch (e) {
         console.error('Erro ao limpar localStorage:', e)
      }
   }
}


