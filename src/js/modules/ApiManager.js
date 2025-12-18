/**
 * Classe ApiManager - Gerencia comunicação com API PHP
 */
export class ApiManager {
   constructor() {
      this.baseUrl = './api/'
   }
   
   /**
    * Faz requisição à API
    * @param {string} endpoint - Endpoint da API
    * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
    * @param {Object} data - Dados a enviar
    * @returns {Promise} Resposta da API
    */
   async request(endpoint, method = 'GET', data = null) {
      try {
         const options = {
            method: method,
            headers: {
               'Content-Type': 'application/json',
            }
         }
         
         if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(data)
         }
         
         const response = await fetch(this.baseUrl + endpoint, options)
         const result = await response.json()
         
         if (!result.success) {
            throw new Error(result.error || 'Erro na requisição')
         }
         
         return result
      } catch (error) {
         console.error('Erro na requisição API:', error)
         throw error
      }
   }
   
   /**
    * Salva uma nova sessão
    * @param {Object} sessaoData - Dados da sessão
    * @returns {Promise} Resposta da API
    */
   async salvarSessao(sessaoData) {
      return await this.request('salvar_sessao.php', 'POST', sessaoData)
   }
   
   /**
    * Atualiza uma sessão existente
    * @param {number} sessaoId - ID da sessão
    * @param {Object} updates - Dados para atualizar
    * @returns {Promise} Resposta da API
    */
   async atualizarSessao(sessaoId, updates) {
      return await this.request('atualizar_sessao.php', 'PUT', {
         sessao_id: sessaoId,
         ...updates
      })
   }
   
   /**
    * Salva histórico detalhado
    * @param {Object} historicoData - Dados do histórico
    * @returns {Promise} Resposta da API
    */
   async salvarHistorico(historicoData) {
      return await this.request('salvar_historico.php', 'POST', historicoData)
   }
   
   /**
    * Busca estatísticas
    * @param {string} tipo - Tipo de estatística (hoje, materias, historico)
    * @param {Object} params - Parâmetros adicionais
    * @returns {Promise} Estatísticas
    */
   async getEstatisticas(tipo = 'hoje', params = {}) {
      const queryParams = new URLSearchParams({ tipo, ...params })
      return await this.request(`estatisticas.php?${queryParams}`, 'GET')
   }
   
   /**
    * Busca lista de matérias
    * @returns {Promise} Lista de matérias
    */
   async getMaterias() {
      const result = await this.getEstatisticas('materias')
      return result.data || []
   }
   
   /**
    * Busca estatísticas de hoje
    * @param {number|null} materiaId - ID da matéria (opcional)
    * @returns {Promise} Estatísticas de hoje
    */
   async getEstatisticasHoje(materiaId = null) {
      const params = materiaId ? { materia_id: materiaId } : {}
      const result = await this.getEstatisticas('hoje', params)
      return result.data || []
   }
   
   /**
    * Busca histórico de sessões
    * @param {number} dias - Número de dias para buscar
    * @param {number|null} materiaId - ID da matéria (opcional)
    * @returns {Promise} Histórico de sessões
    */
   async getHistorico(dias = 7, materiaId = null) {
      const params = { dias, ...(materiaId ? { materia_id: materiaId } : {}) }
      const result = await this.getEstatisticas('historico', params)
      return result.data || []
   }
   
   /**
    * Busca detalhes completos de uma sessão
    * @param {number} sessaoId - ID da sessão
    * @returns {Promise} Detalhes da sessão
    */
   async getDetalhesSessao(sessaoId) {
      const result = await this.request(`detalhes_sessao.php?sessao_id=${sessaoId}`, 'GET')
      return result.data
   }
   
   /**
    * Exclui uma sessão
    * @param {number} sessaoId - ID da sessão
    * @returns {Promise} Resposta da API
    */
   async excluirSessao(sessaoId) {
      return await this.request('excluir_sessao.php', 'DELETE', { sessao_id: sessaoId })
   }
   
   /**
    * Busca estado de uma sessão para continuar
    * @param {number} sessaoId - ID da sessão
    * @returns {Promise} Estado da sessão
    */
   async getEstadoSessao(sessaoId) {
      const result = await this.request(`estado_sessao.php?sessao_id=${sessaoId}`, 'GET')
      return result.data
   }
}

