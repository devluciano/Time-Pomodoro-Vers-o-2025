/**
 * Classe HistoryManager - Gerencia histórico de sessões
 * FASE 3: Funcionalidades Essenciais
 */
export class HistoryManager {
   constructor() {
      this.HISTORY_KEY = 'pomodoro_history'
      this.MAX_HISTORY_DAYS = 30 // Manter histórico de 30 dias
   }
   
   /**
    * Salva uma sessão completada
    * @param {Object} sessionData - Dados da sessão
    */
   saveSession(sessionData) {
      try {
         const history = this.loadHistory()
         const today = this.getTodayKey()
         
         // Se já existe registro para hoje, atualizar
         if (history[today]) {
            history[today].sessionsCompleted += sessionData.sessionsCompleted || 1
            history[today].totalFocusTime += sessionData.focusTime || 0
            history[today].totalBreakTime += sessionData.breakTime || 0
         } else {
            // Criar novo registro para hoje
            history[today] = {
               date: new Date().toISOString(),
               sessionsCompleted: sessionData.sessionsCompleted || 1,
               totalFocusTime: sessionData.focusTime || 0,
               totalBreakTime: sessionData.breakTime || 0
            }
         }
         
         // Limpar histórico antigo
         this.cleanOldHistory(history)
         
         // Salvar
         localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history))
      } catch (e) {
         console.error('Erro ao salvar sessão:', e)
      }
   }
   
   /**
    * Carrega histórico completo
    * @returns {Object} Histórico de sessões
    */
   loadHistory() {
      try {
         const historyJson = localStorage.getItem(this.HISTORY_KEY)
         if (!historyJson) return {}
         
         return JSON.parse(historyJson)
      } catch (e) {
         console.error('Erro ao carregar histórico:', e)
         return {}
      }
   }
   
   /**
    * Retorna estatísticas de hoje
    * @returns {Object} Estatísticas do dia
    */
   getTodayStats() {
      const history = this.loadHistory()
      const today = this.getTodayKey()
      
      return history[today] || {
         date: new Date().toISOString(),
         sessionsCompleted: 0,
         totalFocusTime: 0,
         totalBreakTime: 0
      }
   }
   
   /**
    * Retorna estatísticas dos últimos N dias
    * @param {number} days - Número de dias
    * @returns {Array} Array de estatísticas
    */
   getLastDaysStats(days = 7) {
      const history = this.loadHistory()
      const stats = []
      
      for (let i = 0; i < days; i++) {
         const date = new Date()
         date.setDate(date.getDate() - i)
         const key = this.getDateKey(date)
         
         if (history[key]) {
            stats.push({
               ...history[key],
               date: date.toISOString()
            })
         } else {
            stats.push({
               date: date.toISOString(),
               sessionsCompleted: 0,
               totalFocusTime: 0,
               totalBreakTime: 0
            })
         }
      }
      
      return stats.reverse() // Mais antigo primeiro
   }
   
   /**
    * Retorna total de sessões completadas
    * @returns {number} Total de sessões
    */
   getTotalSessions() {
      const history = this.loadHistory()
      let total = 0
      
      for (const key in history) {
         total += history[key].sessionsCompleted || 0
      }
      
      return total
   }
   
   /**
    * Retorna total de tempo focado (em minutos)
    * @returns {number} Total de minutos
    */
   getTotalFocusTime() {
      const history = this.loadHistory()
      let total = 0
      
      for (const key in history) {
         total += history[key].totalFocusTime || 0
      }
      
      return total
   }
   
   /**
    * Limpa histórico antigo (mais de MAX_HISTORY_DAYS dias)
    * @param {Object} history - Histórico a limpar
    */
   cleanOldHistory(history) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - this.MAX_HISTORY_DAYS)
      
      for (const key in history) {
         const date = new Date(history[key].date)
         if (date < cutoffDate) {
            delete history[key]
         }
      }
   }
   
   /**
    * Limpa todo o histórico
    */
   clearHistory() {
      try {
         localStorage.removeItem(this.HISTORY_KEY)
      } catch (e) {
         console.error('Erro ao limpar histórico:', e)
      }
   }
   
   /**
    * Retorna chave para data de hoje (YYYY-MM-DD)
    * @returns {string} Chave da data
    */
   getTodayKey() {
      return this.getDateKey(new Date())
   }
   
   /**
    * Retorna chave para uma data (YYYY-MM-DD)
    * @param {Date} date - Data
    * @returns {string} Chave da data
    */
   getDateKey(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
   }
   
   /**
    * Exporta histórico como JSON
    * @returns {string} JSON do histórico
    */
   exportHistory() {
      return JSON.stringify(this.loadHistory(), null, 2)
   }
}





