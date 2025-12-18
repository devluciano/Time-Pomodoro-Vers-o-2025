/**
 * Classe UIManager - Gerencia atualizações da interface
 */
export class UIManager {
   constructor() {
      this.elements = {
         config: document.getElementById('config'),
         timer: document.getElementById('timer'),
         fim: document.getElementById('fim'),
         title: document.getElementById('title'),
         titleSessao: document.getElementById('title_sessao'),
         minutesOk: document.getElementById('minutes_ok'),
         secondsOk: document.getElementById('seconds_ok'),
         pauseBtn: document.getElementById('pause'),
         playBtn: document.getElementById('play'),
         erroAcao: document.getElementById('erro_acao'),
         erroPausa: document.getElementById('erro_pausa'),
         erroSessoes: document.getElementById('erro_sessoes'),
         erroMateria: document.getElementById('erro_materia'),
         erroNomeAula: document.getElementById('erro_nome_aula'),
         progressBar: document.getElementById('progress-bar'),
         progressBarFill: document.getElementById('progress-bar-fill'),
         historySection: document.getElementById('history-section'),
         historyStats: document.getElementById('history-stats')
      }
   }
   
   /**
    * Mostra a seção de configuração
    */
   showConfig() {
      if (this.elements.config) {
         this.elements.config.style.setProperty('display', 'block', 'important')
      }
   }
   
   /**
    * Esconde a seção de configuração
    */
   hideConfig() {
      if (this.elements.config) {
         this.elements.config.style.setProperty('display', 'none', 'important')
      }
   }
   
   /**
    * Mostra o timer
    */
   showTimer() {
      if (this.elements.timer) {
         this.elements.timer.style.setProperty('display', 'block', 'important')
      }
   }
   
   /**
    * Esconde o timer
    */
   hideTimer() {
      if (this.elements.timer) {
         this.elements.timer.style.setProperty('display', 'none', 'important')
      }
   }
   
   /**
    * Mostra a mensagem de finalização
    */
   showFinal() {
      if (this.elements.fim) {
         this.elements.fim.style.setProperty('display', 'block', 'important')
      }
   }
   
   /**
    * Esconde a mensagem de finalização
    */
   hideFinal() {
      if (this.elements.fim) {
         this.elements.fim.style.setProperty('display', 'none', 'important')
      }
   }
   
   /**
    * Atualiza o display do tempo
    * @param {number} minutos - Minutos restantes
    * @param {number} segundos - Segundos restantes
    */
   updateTime(minutos, segundos) {
      if (this.elements.minutesOk) {
         this.elements.minutesOk.innerHTML = minutos
      }
      if (this.elements.secondsOk) {
         this.elements.secondsOk.innerHTML = segundos.toString().padStart(2, '0')
      }
   }
   
   /**
    * Atualiza o título (AÇÃO ou PAUSA)
    * @param {string} type - 'acao' ou 'pausa'
    */
   updateTitle(type) {
      if (!this.elements.title) return
      
      if (type === 'acao') {
         this.elements.title.innerHTML = "AÇÃO"
         this.elements.title.style.fontSize = '25pt'
         this.elements.title.style.fontWeight = 'bold'
         this.elements.title.style.setProperty('color', '#28a745', 'important')
      } else if (type === 'pausa') {
         this.elements.title.innerHTML = "PAUSA"
         this.elements.title.style.fontSize = '25pt'
         this.elements.title.style.fontWeight = 'bold'
         this.elements.title.style.setProperty('color', '#dc3545', 'important')
      }
   }
   
   /**
    * Atualiza a contagem de sessões
    * @param {number} sessoesRestantes - Número de sessões restantes
    */
   updateSessions(sessoesRestantes) {
      if (!this.elements.titleSessao) return
      
      if (sessoesRestantes !== 1) {
         this.elements.titleSessao.innerHTML = sessoesRestantes + ' sessões restantes'
      } else {
         this.elements.titleSessao.innerHTML = sessoesRestantes + ' sessão restante'
      }
   }
   
   /**
    * Mostra botão de pause
    */
   showPauseButton() {
      if (this.elements.pauseBtn) {
         this.elements.pauseBtn.style.setProperty('display', 'block', 'important')
      }
      if (this.elements.playBtn) {
         this.elements.playBtn.style.setProperty('display', 'none', 'important')
      }
   }
   
   /**
    * Mostra botão de play
    */
   showPlayButton() {
      if (this.elements.playBtn) {
         this.elements.playBtn.style.setProperty('display', 'block', 'important')
      }
      if (this.elements.pauseBtn) {
         this.elements.pauseBtn.style.setProperty('display', 'none', 'important')
      }
   }
   
   /**
    * Esconde botão de play
    */
   hidePlayButton() {
      if (this.elements.playBtn) {
         this.elements.playBtn.style.setProperty('display', 'none', 'important')
      }
   }
   
   /**
    * Esconde botão de pause
    */
   hidePauseButton() {
      if (this.elements.pauseBtn) {
         this.elements.pauseBtn.style.setProperty('display', 'none', 'important')
      }
   }
   
   /**
    * Mostra erro de validação
    * @param {string} campo - Nome do campo ('acao', 'pausa', 'sessoes')
    * @param {string} mensagem - Mensagem de erro
    */
   showError(campo, mensagem) {
      // Mapear nomes de campos para elementos
      const campoMap = {
         'acao': 'erroAcao',
         'pausa': 'erroPausa',
         'sessoes': 'erroSessoes',
         'materia': 'erroMateria',
         'nome_aula': 'erroNomeAula'
      }
      
      const elementoKey = campoMap[campo] || `erro${campo.charAt(0).toUpperCase() + campo.slice(1)}`
      const erroElement = this.elements[elementoKey]
      
      if (erroElement) {
         erroElement.innerHTML = mensagem
         erroElement.style.display = 'block'
      } else {
         // Criar elemento de erro dinamicamente se não existir
         const inputElement = document.getElementById(campo)
         if (inputElement) {
            const erroDiv = document.createElement('small')
            erroDiv.className = 'text-danger'
            erroDiv.id = `erro_${campo}`
            erroDiv.textContent = mensagem
            erroDiv.style.display = 'block'
            inputElement.parentNode.appendChild(erroDiv)
         }
      }
   }
   
   /**
    * Limpa todos os erros
    */
   clearErrors() {
      if (this.elements.erroAcao) this.elements.erroAcao.innerHTML = ''
      if (this.elements.erroPausa) this.elements.erroPausa.innerHTML = ''
      if (this.elements.erroSessoes) this.elements.erroSessoes.innerHTML = ''
      if (this.elements.erroMateria) this.elements.erroMateria.innerHTML = ''
      if (this.elements.erroNomeAula) this.elements.erroNomeAula.innerHTML = ''
   }
   
   /**
    * Atualiza a barra de progresso
    * @param {number} progress - Progresso de 0 a 100
    * @param {string} type - 'acao' ou 'pausa' (para cor)
    */
   updateProgressBar(progress, type = 'acao') {
      if (!this.elements.progressBarFill) {
         console.warn('Elemento progressBarFill não encontrado!')
         return
      }
      
      const clampedProgress = Math.max(0, Math.min(100, progress))
      
      // Forçar atualização da largura
      this.elements.progressBarFill.style.setProperty('width', `${clampedProgress}%`, 'important')
      this.elements.progressBarFill.style.setProperty('transition', 'width 0.3s ease', 'important')
      
      // Mudar cor baseado no tipo
      if (type === 'acao') {
         this.elements.progressBarFill.className = 'progress-bar-fill progress-bar-fill-action'
      } else {
         this.elements.progressBarFill.className = 'progress-bar-fill progress-bar-fill-break'
      }
      
      // Debug ocasional
      if (Math.floor(clampedProgress) % 10 === 0 && clampedProgress > 0) {
         console.log('Barra de progresso atualizada:', clampedProgress.toFixed(1) + '%')
      }
   }
   
   /**
    * Mostra/esconde barra de progresso
    * @param {boolean} show - true para mostrar, false para esconder
    */
   toggleProgressBar(show) {
      if (this.elements.progressBar) {
         if (show) {
            this.elements.progressBar.style.setProperty('display', 'block', 'important')
         } else {
            this.elements.progressBar.style.setProperty('display', 'none', 'important')
         }
         console.log('Barra de progresso:', show ? 'mostrada' : 'escondida')
      } else {
         console.warn('Elemento progressBar não encontrado!')
      }
   }
   
   /**
    * Atualiza estatísticas do histórico
    * @param {Object} stats - Estatísticas do dia
    */
   updateHistoryStats(stats) {
      if (!this.elements.historyStats) return
      
      const html = `
         <div class="row text-center">
            <div class="col-md-4">
               <h4 class="text-white">${stats.sessionsCompleted || 0}</h4>
               <p class="text-secondary mb-0">Sessões Hoje</p>
            </div>
            <div class="col-md-4">
               <h4 class="text-white">${Math.floor((stats.totalFocusTime || 0) / 60)}</h4>
               <p class="text-secondary mb-0">Minutos Focados</p>
            </div>
            <div class="col-md-4">
               <h4 class="text-white">${Math.floor((stats.totalBreakTime || 0) / 60)}</h4>
               <p class="text-secondary mb-0">Minutos de Pausa</p>
            </div>
         </div>
      `
      this.elements.historyStats.innerHTML = html
   }
   
   /**
    * Mostra/esconde seção de histórico
    * @param {boolean} show - true para mostrar, false para esconder
    */
   toggleHistorySection(show) {
      if (this.elements.historySection) {
         this.elements.historySection.style.display = show ? 'block' : 'none'
      }
   }
   
   /**
    * Retorna elemento pelo ID
    * @param {string} id - ID do elemento
    */
   getElement(id) {
      return document.getElementById(id)
   }
}

