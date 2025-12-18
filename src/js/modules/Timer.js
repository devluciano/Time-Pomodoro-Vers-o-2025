/**
 * Classe Timer - Gerencia o timer Pomodoro com precisão usando Date API
 */
export class Timer {
   constructor() {
      this.state = {
         type: null, // 'acao' ou 'pausa'
         startTime: null,
         duration: 0, // em milissegundos
         isPaused: false,
         pausedAt: null,
         pausedDuration: 0, // tempo já pausado acumulado
         intervalId: null,
         sessionNumber: 0,
         totalSessions: 0
      }
      
      this.onTick = null
      this.onComplete = null
   }
   
   /**
    * Inicia o timer
    * @param {string} type - 'acao' ou 'pausa'
    * @param {number} durationMinutes - Duração em minutos
    */
   start(type, durationMinutes) {
      this.stop() // Limpar interval anterior se existir
      
      this.state.type = type
      this.state.duration = durationMinutes * 60 * 1000 // converter para milissegundos
      this.state.startTime = Date.now()
      this.state.isPaused = false
      this.state.pausedAt = null
      this.state.pausedDuration = 0
      
      // Atualizar display imediatamente
      this.updateDisplay()
      
      // Atualizar a cada 100ms para precisão
      this.state.intervalId = setInterval(() => this.updateDisplay(), 100)
   }
   
   /**
    * Pausa o timer
    */
   pause() {
      if (!this.state.startTime || this.state.isPaused) return
      
      this.state.isPaused = true
      this.state.pausedAt = Date.now()
      
      // Parar interval
      if (this.state.intervalId) {
         clearInterval(this.state.intervalId)
         this.state.intervalId = null
      }
   }
   
   /**
    * Retoma o timer
    */
   resume() {
      if (!this.state.startTime || !this.state.isPaused) return
      
      // Calcular tempo pausado e adicionar ao acumulado
      if (this.state.pausedAt) {
         const tempoPausado = Date.now() - this.state.pausedAt
         // Garantir que pausedDuration não fique inválido
         if (isNaN(this.state.pausedDuration) || this.state.pausedDuration < 0) {
            this.state.pausedDuration = 0
         }
         this.state.pausedDuration += tempoPausado
      }
      
      this.state.isPaused = false
      this.state.pausedAt = null
      
      // Reiniciar interval
      this.state.intervalId = setInterval(() => this.updateDisplay(), 100)
      
      // Atualizar display imediatamente
      this.updateDisplay()
   }
   
   /**
    * Para o timer completamente
    */
   stop() {
      if (this.state.intervalId) {
         clearInterval(this.state.intervalId)
         this.state.intervalId = null
      }
      
      this.state.startTime = null
      this.state.isPaused = false
      this.state.pausedAt = null
   }
   
   /**
    * Atualiza o display do timer
    */
   updateDisplay() {
      if (!this.state.startTime || !this.state.duration) {
         console.warn('Timer não inicializado corretamente:', {
            startTime: this.state.startTime,
            duration: this.state.duration
         })
         return
      }
      
      let tempoDecorrido
      
      // Garantir que pausedDuration não seja inválido ou muito grande
      const pausedDuration = (this.state.pausedDuration && !isNaN(this.state.pausedDuration) && this.state.pausedDuration >= 0) 
         ? this.state.pausedDuration 
         : 0
      
      if (this.state.isPaused && this.state.pausedAt) {
         // Se está pausado, usar o tempo até a pausa
         // Calcular tempo decorrido até a pausa
         const tempoAtePausa = this.state.pausedAt - this.state.startTime
         tempoDecorrido = tempoAtePausa - pausedDuration
      } else {
         // Se está rodando, calcular tempo atual
         const tempoAgora = Date.now() - this.state.startTime
         tempoDecorrido = tempoAgora - pausedDuration
      }
      
      // Garantir que tempoDecorrido não seja negativo ou inválido
      if (isNaN(tempoDecorrido) || tempoDecorrido < 0) {
         // Se o cálculo deu errado, resetar pausedDuration e recalcular
         this.state.pausedDuration = 0
         tempoDecorrido = this.state.isPaused && this.state.pausedAt
            ? this.state.pausedAt - this.state.startTime
            : Date.now() - this.state.startTime
      }
      
      // Garantir que não ultrapasse a duração
      if (tempoDecorrido > this.state.duration) {
         tempoDecorrido = this.state.duration
      }
      
      const tempoRestante = Math.max(0, this.state.duration - tempoDecorrido)
      const minutos = Math.floor(tempoRestante / 60000)
      const segundos = Math.floor((tempoRestante % 60000) / 1000)
      
      // Garantir que minutos e segundos são números válidos e dentro de limites razoáveis
      if (isNaN(minutos) || isNaN(segundos) || minutos < 0 || segundos < 0 || minutos > 999 || segundos > 59) {
         console.error('Erro no cálculo do tempo:', { 
            tempoRestante, 
            tempoDecorrido, 
            duration: this.state.duration, 
            startTime: this.state.startTime,
            minutos,
            segundos
         })
         return
      }
      
      // Chamar callback de atualização
      if (this.onTick) {
         this.onTick(minutos, segundos)
      } else {
         console.warn('Callback onTick não está definido!')
      }
      
      // Verificar se acabou
      if (tempoRestante <= 0 && !this.state.isPaused) {
         this.stop()
         if (this.onComplete) {
            this.onComplete()
         } else {
            console.warn('Callback onComplete não está definido!')
         }
      }
   }
   
   /**
    * Retorna o tempo restante em milissegundos
    */
   getTimeRemaining() {
      if (!this.state.startTime || !this.state.duration) return 0
      
      let tempoDecorrido
      if (this.state.isPaused && this.state.pausedAt) {
         tempoDecorrido = this.state.pausedAt - this.state.startTime - this.state.pausedDuration
      } else {
         tempoDecorrido = Date.now() - this.state.startTime - this.state.pausedDuration
      }
      
      return Math.max(0, this.state.duration - tempoDecorrido)
   }
   
   /**
    * Retorna o estado atual do timer
    */
   getState() {
      return { ...this.state }
   }
   
   /**
    * Restaura o estado do timer
    */
   setState(state) {
      this.state = { ...this.state, ...state }
      
      // Se estava pausado, não ajustar pausedDuration ainda (será ajustado quando retomar)
      // Apenas garantir que pausedAt está definido se estiver pausado
      if (this.state.isPaused && !this.state.pausedAt) {
         this.state.pausedAt = Date.now()
      }
      
      // Se não estava pausado e tem startTime, reiniciar interval
      if (!this.state.isPaused && this.state.startTime && this.state.duration > 0) {
         const tempoRestante = this.getTimeRemaining()
         if (tempoRestante > 0) {
            this.state.intervalId = setInterval(() => this.updateDisplay(), 100)
         }
      }
      
      // Atualizar display imediatamente
      this.updateDisplay()
   }
   
   /**
    * Verifica se o timer está rodando
    */
   isRunning() {
      return this.state.startTime !== null && !this.state.isPaused
   }
   
   /**
    * Verifica se o timer está pausado
    */
   isPausedState() {
      return this.state.isPaused
   }
}

