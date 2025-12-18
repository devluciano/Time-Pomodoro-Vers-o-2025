/**
 * Main - Orquestrador principal do aplicativo Pomodoro
 * FASE 3: Funcionalidades Essenciais
 */

import { Timer } from './modules/Timer.js'
import { AudioManager } from './modules/AudioManager.js'
import { StorageManager } from './modules/StorageManager.js'
import { UIManager } from './modules/UIManager.js'
import { NotificationManager } from './modules/NotificationManager.js'
import { HistoryManager } from './modules/HistoryManager.js'
import { ApiManager } from './modules/ApiManager.js'
import { StatsManager } from './modules/StatsManager.js'
import { validarTodosInputs, limparErros } from './utils/Validation.js'

class PomodoroApp {
   constructor() {
      // Inicializar módulos
      this.timer = new Timer()
      this.audio = new AudioManager()
      this.storage = new StorageManager()
      this.ui = new UIManager()
      this.notifications = new NotificationManager()
      this.history = new HistoryManager()
      this.api = new ApiManager()
      this.stats = new StatsManager(this.api)
      
      // Estado da aplicação
      this.currentConfig = {
         acao: 0,
         pausa: 0,
         sessoes: 0
      }
      this.showHistory = false
      this.musicaPausada = false
      this.sessaoId = null
      this.materiaId = null
      
      // Elementos do DOM
      this.elements = {
         materia: document.getElementById('materia'),
         nomeAula: document.getElementById('nome_aula'),
         acao: document.getElementById('acao'),
         pausa: document.getElementById('pausa'),
         sessoes: document.getElementById('sessoes'),
         btnIniciar: document.getElementById('btn-iniciar'),
         btnLimpar: document.getElementById('btn-limpar'),
         pauseLink: document.getElementById('pause-link'),
         playLink: document.getElementById('play-link'),
         btnHistory: document.getElementById('btn-history'),
         btnReset: document.getElementById('btn-reset'),
         btnMusic: document.getElementById('btn-music'),
         musicIcon: document.getElementById('music-icon')
      }
      
      // Configurar callbacks do timer
      this.setupTimerCallbacks()
      
      // Configurar event listeners
      this.setupEventListeners()
      
      // Configurar atalhos de teclado
      this.setupKeyboardShortcuts()
      
      // Carregar e exibir estatísticas
      this.loadAndDisplayStats()
      
      // Tentar restaurar estado ao carregar
      this.restaurarEstado()
   }
   
   /**
    * Configura callbacks do timer
    */
   setupTimerCallbacks() {
      console.log('Configurando callbacks do timer...')
      
      // Callback de atualização do display
      this.timer.onTick = (minutos, segundos) => {
         this.ui.updateTime(minutos, segundos)
         this.updateProgressBar()
      }
      
      // Callback de conclusão do timer
      this.timer.onComplete = () => {
         console.log('Timer completado!')
         this.onTimerComplete()
      }
      
      console.log('Callbacks configurados')
   }
   
   /**
    * Atualiza a barra de progresso
    */
   updateProgressBar() {
      if (!this.timer.state.startTime || !this.timer.state.duration) {
         return
      }
      
      const tempoRestante = this.timer.getTimeRemaining()
      const tempoDecorrido = this.timer.state.duration - tempoRestante
      const progresso = (tempoDecorrido / this.timer.state.duration) * 100
      
      // Garantir que a barra está visível
      this.ui.toggleProgressBar(true)
      
      // Atualizar barra
      this.ui.updateProgressBar(progresso, this.timer.state.type)
      
      // Debug ocasional (a cada 5 segundos)
      if (Math.floor(tempoDecorrido / 1000) % 5 === 0) {
         console.log('Progresso:', progresso.toFixed(1) + '%', 'Tempo restante:', Math.floor(tempoRestante / 1000) + 's')
      }
   }
   
   /**
    * Configura event listeners
    */
   setupEventListeners() {
      console.log('Configurando event listeners...')
      console.log('Elementos encontrados:', {
         acao: !!this.elements.acao,
         pausa: !!this.elements.pausa,
         sessoes: !!this.elements.sessoes,
         btnIniciar: !!this.elements.btnIniciar,
         btnReset: !!this.elements.btnReset,
         btnHistory: !!this.elements.btnHistory,
         btnMusic: !!this.elements.btnMusic
      })
      
      if (!this.elements.btnReset) {
         console.error('ERRO: Botão reset não encontrado no DOM!')
      }
      
      // Limpar erros ao digitar
      if (this.elements.acao) {
         this.elements.acao.addEventListener('input', () => limparErros(this.ui))
      }
      if (this.elements.pausa) {
         this.elements.pausa.addEventListener('input', () => limparErros(this.ui))
      }
      if (this.elements.sessoes) {
         this.elements.sessoes.addEventListener('input', () => limparErros(this.ui))
      }
      
      // Botão iniciar - Múltiplas formas de garantir que funcione
      if (this.elements.btnIniciar) {
         console.log('Botão iniciar encontrado, adicionando listeners...')
         
         // Remover listeners anteriores se existirem
         const novoBtn = this.elements.btnIniciar.cloneNode(true)
         this.elements.btnIniciar.parentNode.replaceChild(novoBtn, this.elements.btnIniciar)
         this.elements.btnIniciar = novoBtn
         
         // Adicionar listener de click
         this.elements.btnIniciar.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('=== CLICK NO BOTÃO INICIAR CAPTURADO ===')
            this.iniciar()
         })
         
         // Também adicionar via onclick como fallback
         this.elements.btnIniciar.onclick = (e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('=== CLICK VIA ONCLICK CAPTURADO ===')
            this.iniciar()
            return false
         }
         
         console.log('Listeners adicionados ao botão iniciar')
      } else {
         console.error('ERRO CRÍTICO: Botão iniciar não encontrado!')
         console.error('Elementos disponíveis:', {
            acao: !!this.elements.acao,
            pausa: !!this.elements.pausa,
            sessoes: !!this.elements.sessoes,
            btnIniciar: !!this.elements.btnIniciar
         })
      }
      
      // Botão pause
      if (this.elements.pauseLink) {
         this.elements.pauseLink.addEventListener('click', (e) => {
            e.preventDefault()
            this.pausar()
         })
      }
      
      // Botão play
      if (this.elements.playLink) {
         this.elements.playLink.addEventListener('click', (e) => {
            e.preventDefault()
            this.executar()
         })
      }
      
      // Botão histórico - agora abre página separada (não precisa de listener)
      // O link já está configurado no HTML para abrir estatisticas.html
      
      // Botão limpar inputs
      if (this.elements.btnLimpar) {
         this.elements.btnLimpar.addEventListener('click', () => {
            this.limparInputs()
         })
         console.log('✅ Listener do botão LIMPAR configurado')
      } else {
         console.error('❌ ERRO: Botão limpar não encontrado durante setup!')
      }
      
      // Botão música
      if (this.elements.btnMusic) {
         console.log('✅ Botão música encontrado, adicionando listener')
         this.elements.btnMusic.addEventListener('click', (e) => {
            e.preventDefault()
            this.toggleMusica()
         })
      } else {
         console.warn('⚠️ Botão música não encontrado')
      }
      
      // Botão reset - Garantir que está configurado
      const btnResetEl = document.getElementById('btn-reset')
      if (btnResetEl) {
         this.elements.btnReset = btnResetEl
         console.log('✅ Botão reset encontrado, adicionando listener')
         
         // Adicionar listener diretamente
         btnResetEl.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('🛑 Botão CANCELAR clicado!')
            this.confirmarReset()
         })
         
         console.log('✅ Listener do botão CANCELAR configurado')
      } else {
         console.error('❌ ERRO: Botão reset não encontrado durante setup!')
      }
      
      // Botões de estatísticas removidos - agora estão na página separada (estatisticas.html)
   }
   
   /**
    * Configura atalhos de teclado
    */
   setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
         // Space: Pausar/Retomar (apenas quando timer está ativo)
         if (e.code === 'Space' && this.timer.state.startTime) {
            e.preventDefault()
            if (this.timer.isPausedState()) {
               this.executar()
            } else {
               this.pausar()
            }
         }
         
         // Enter: Iniciar (apenas quando na tela de configuração)
         if (e.code === 'Enter' && this.elements.config.style.display !== 'none') {
            e.preventDefault()
            if (document.activeElement.tagName !== 'INPUT') {
               this.iniciar()
            }
         }
         
         // R: Resetar (quando timer está ativo)
         if (e.code === 'KeyR' && this.timer.state.startTime && !e.ctrlKey && !e.metaKey) {
            if (confirm('Deseja realmente resetar o timer?')) {
               this.resetTimer()
            }
         }
      })
   }
   
   /**
    * Inicia o timer Pomodoro
    */
   async iniciar() {
      console.log('=== INICIAR CLICADO ===')
      
      try {
         // Verificar se elementos existem
         if (!this.elements.acao || !this.elements.pausa || !this.elements.sessoes || 
             !this.elements.materia || !this.elements.nomeAula) {
            console.error('Elementos não encontrados')
            alert('Erro: Elementos do formulário não foram encontrados. Recarregue a página.')
            return
         }
         
         // Obter valores
         const materiaValue = this.elements.materia.value.trim()
         const nomeAulaValue = this.elements.nomeAula.value.trim()
         const acaoValue = this.elements.acao.value.trim()
         const pausaValue = this.elements.pausa.value.trim()
         const sessoesValue = this.elements.sessoes.value.trim()
         
         console.log('Valores obtidos:', { materiaValue, nomeAulaValue, acaoValue, pausaValue, sessoesValue })
         
         // Validação de matéria e aula
         if (!materiaValue || materiaValue.length < 2) {
            this.ui.showError('materia', 'Matéria é obrigatória (mínimo 2 caracteres)')
            this.elements.materia.focus()
            return
         }
         
         if (!nomeAulaValue || nomeAulaValue.length < 2) {
            this.ui.showError('nome_aula', 'Nome da aula é obrigatório (mínimo 2 caracteres)')
            this.elements.nomeAula.focus()
            return
         }
         
         // Validação básica de tempo
         const acaoNum = parseInt(acaoValue, 10)
         const pausaNum = parseInt(pausaValue, 10)
         const sessoesNum = parseInt(sessoesValue, 10)
         
         if (!acaoValue || isNaN(acaoNum) || acaoNum < 1 || acaoNum > 120) {
            this.ui.showError('acao', 'Ação deve ser entre 1 e 120 minutos')
            this.elements.acao.focus()
            return
         }
         
         if (!pausaValue || isNaN(pausaNum) || pausaNum < 1 || pausaNum > 120) {
            this.ui.showError('pausa', 'Pausa deve ser entre 1 e 120 minutos')
            this.elements.pausa.focus()
            return
         }
         
         if (!sessoesValue || isNaN(sessoesNum) || sessoesNum < 1 || sessoesNum > 50) {
            this.ui.showError('sessoes', 'Sessões deve ser entre 1 e 50')
            this.elements.sessoes.focus()
            return
         }
         
         console.log('Validação passou!')
         
         // Limpar erros
         this.ui.clearErrors()
         
         // Salvar no banco de dados
         try {
            console.log('Salvando sessão no banco de dados...')
            const sessaoData = {
               nome_materia: materiaValue,
               nome_aula: nomeAulaValue,
               duracao_acao: acaoNum,
               duracao_pausa: pausaNum,
               total_sessoes: sessoesNum
            }
            
            const response = await this.api.salvarSessao(sessaoData)
            this.sessaoId = response.data.sessao_id
            this.materiaId = response.data.materia_id
            
            console.log('✅ Sessão salva no banco:', { sessaoId: this.sessaoId, materiaId: this.materiaId })
         } catch (error) {
            console.error('Erro ao salvar no banco:', error)
            alert('Aviso: Não foi possível salvar no banco de dados. Continuando com localStorage apenas.')
            // Continuar mesmo se falhar
         }
         
         // Salvar configuração no localStorage também
         const config = {
            materia: materiaValue,
            nome_aula: nomeAulaValue,
            acao: acaoValue,
            pausa: pausaValue,
            sessoes: sessoesValue
         }
         this.storage.savePomodoroConfig(config)
         console.log('Configuração salva:', config)
         
         // Inicializar estado do timer
         this.timer.state.totalSessions = sessoesNum
         this.timer.state.sessionNumber = 0
         
         // Salvar configuração atual
         this.currentConfig = {
            acao: acaoNum,
            pausa: pausaNum,
            sessoes: sessoesNum
         }
         
         console.log('Configuração atual:', this.currentConfig)
         
         // Garantir que música não esteja pausada manualmente ao iniciar
         this.musicaPausada = false
         
         // Tocar música apenas quando o timer realmente iniciar (em momentoAcao)
         // Não tocar aqui para evitar que toque antes do timer começar
         this.ui.showPauseButton()
         
         // Esconder config e mostrar timer
         this.ui.hideConfig()
         this.ui.showTimer()
         
         // Mostrar barra de progresso
         setTimeout(() => {
            this.ui.toggleProgressBar(true)
         }, 100)
         
         // Mostrar botão CANCELAR - FORÇAR exibição
         const mostrarBotaoCancelar = () => {
            const btnResetEl = document.getElementById('btn-reset')
            if (btnResetEl) {
               // Remover classe d-none do Bootstrap
               btnResetEl.classList.remove('d-none')
               
               // Forçar exibição com múltiplas abordagens
               btnResetEl.style.cssText = 'display: inline-block !important; visibility: visible !important; opacity: 1 !important;'
               
               this.elements.btnReset = btnResetEl
               console.log('✅ Botão CANCELAR mostrado')
               console.log('Display:', window.getComputedStyle(btnResetEl).display)
               console.log('Visibility:', window.getComputedStyle(btnResetEl).visibility)
            } else {
               console.error('❌ ERRO: Botão cancelar não encontrado!')
               this.criarBotaoReset()
            }
         }
         
         // Tentar mostrar imediatamente e depois com timeout
         mostrarBotaoCancelar()
         setTimeout(mostrarBotaoCancelar, 100)
         setTimeout(mostrarBotaoCancelar, 500)
         
         console.log('UI atualizada, iniciando timer...')
         
         // Iniciar primeira ação
         this.momentoAcao()
         
         console.log('=== TIMER INICIADO COM SUCESSO ===')
         
      } catch (error) {
         console.error('Erro ao iniciar timer:', error)
         alert('Erro ao iniciar timer: ' + error.message)
      }
   }
   
   /**
    * Inicia fase de ação
    */
   momentoAcao() {
      try {
         console.log('Iniciando momentoAcao...')
         const sessoesRestantes = this.timer.state.totalSessions - this.timer.state.sessionNumber
         console.log('Sessões restantes:', sessoesRestantes)
         
         this.ui.updateSessions(sessoesRestantes)
         this.ui.updateTitle('acao')
         
         // Usar configuração atual ou do storage
         const duracaoAcao = this.currentConfig.acao || parseInt(this.elements.acao?.value || '25', 10)
         console.log('Duração da ação:', duracaoAcao, 'minutos')
         
         if (!duracaoAcao || duracaoAcao < 1) {
            console.error('Duração inválida:', duracaoAcao)
            alert('Erro: Duração da ação inválida')
            return
         }
         
         this.timer.start('acao', duracaoAcao)
         console.log('Timer iniciado com sucesso')
         
         // Tocar música apenas quando a ação realmente iniciar
         // E apenas se não estiver pausada manualmente
         if (!this.musicaPausada) {
            try {
               this.audio.playLofi()
            } catch (e) {
               console.warn('Erro ao tocar música:', e)
            }
         }
         
         // Salvar estado
         this.salvarEstado()
      } catch (error) {
         console.error('Erro em momentoAcao:', error)
         alert('Erro ao iniciar ação: ' + error.message)
      }
   }
   
   /**
    * Inicia fase de pausa
    */
   momentoPausa() {
      this.ui.updateTitle('pausa')
      
      const config = this.storage.loadPomodoroConfig()
      const duracaoPausa = parseInt(config?.pausa || this.elements.pausa.value, 10)
      this.timer.start('pausa', duracaoPausa)
      
      // Salvar estado
      this.salvarEstado()
   }
   
   /**
    * Pausa o timer
    */
   pausar() {
      this.timer.pause()
      this.audio.pauseLofi()
      this.ui.showPlayButton()
      this.salvarEstado()
   }
   
   /**
    * Retoma o timer
    */
   executar() {
      if (this.timer.isPausedState()) {
         this.timer.resume()
         // Retomar música apenas se não estiver pausada manualmente
         if (!this.musicaPausada) {
            this.audio.playLofi()
         }
         this.ui.showPauseButton()
         this.salvarEstado()
      } else {
         // Apenas tocar música se timer não estava pausado e música não está pausada
         if (!this.musicaPausada) {
            this.audio.playLofi()
         }
         this.ui.showPauseButton()
      }
   }
   
   /**
    * Callback quando timer completa
    */
   async onTimerComplete() {
      if (this.timer.state.type === 'acao') {
         this.audio.playBell()
         
         // Notificação
         this.notifications.notifyActionComplete()
         
         // Salvar tempo focado no histórico (localStorage)
         this.history.saveSession({
            focusTime: this.currentConfig.acao * 60 // em segundos
         })
         
         // Salvar no banco de dados
         if (this.sessaoId) {
            try {
               await this.api.atualizarSessao(this.sessaoId, {
                  tempo_focado: this.currentConfig.acao * 60,
                  sessoes_completadas: this.timer.state.sessionNumber
               })
               
               // Salvar histórico detalhado
               await this.api.salvarHistorico({
                  sessao_id: this.sessaoId,
                  tipo: 'acao',
                  numero_sessao: this.timer.state.sessionNumber,
                  tempo_inicio: Math.floor(Date.now() / 1000) - (this.currentConfig.acao * 60),
                  tempo_fim: Math.floor(Date.now() / 1000),
                  duracao_segundos: this.currentConfig.acao * 60,
                  completado: 1
               })
            } catch (error) {
               console.error('Erro ao salvar no banco:', error)
            }
         }
         
         this.momentoPausa()
      } else if (this.timer.state.type === 'pausa') {
         this.timer.state.sessionNumber++
         
         // Salvar tempo de pausa no histórico (localStorage)
         this.history.saveSession({
            breakTime: this.currentConfig.pausa * 60 // em segundos
         })
         
         // Salvar no banco de dados
         if (this.sessaoId) {
            try {
               await this.api.atualizarSessao(this.sessaoId, {
                  tempo_pausa: this.currentConfig.pausa * 60
               })
               
               // Salvar histórico detalhado
               await this.api.salvarHistorico({
                  sessao_id: this.sessaoId,
                  tipo: 'pausa',
                  numero_sessao: this.timer.state.sessionNumber - 1,
                  tempo_inicio: Math.floor(Date.now() / 1000) - (this.currentConfig.pausa * 60),
                  tempo_fim: Math.floor(Date.now() / 1000),
                  duracao_segundos: this.currentConfig.pausa * 60,
                  completado: 1
               })
            } catch (error) {
               console.error('Erro ao salvar no banco:', error)
            }
         }
         
         if (this.timer.state.sessionNumber >= this.timer.state.totalSessions) {
            // Todas sessões completadas
            this.audio.playFinal()
            
            // Notificação
            this.notifications.notifyAllComplete()
            
            // Salvar sessão completa (localStorage)
            this.history.saveSession({
               sessionsCompleted: 1,
               focusTime: this.currentConfig.acao * 60 * this.currentConfig.sessoes,
               breakTime: this.currentConfig.pausa * 60 * (this.currentConfig.sessoes - 1)
            })
            
            // Finalizar no banco de dados
            if (this.sessaoId) {
               try {
                  await this.api.atualizarSessao(this.sessaoId, {
                     status: 'completo',
                     hora_fim: new Date().toTimeString().slice(0, 8)
                  })
               } catch (error) {
                  console.error('Erro ao finalizar sessão no banco:', error)
               }
            }
            
            // Atualizar estatísticas
            this.loadAndDisplayStats()
            
            this.storage.clearAll()
            this.timer.stop()
            
            this.ui.hideConfig()
            this.ui.hideTimer()
            this.ui.toggleProgressBar(false)
            this.ui.showFinal()
         } else {
            // Próxima ação
            this.audio.playVolta()
            
            // Notificação
            this.notifications.notifyBreakComplete()
            
            // Tocar música apenas se não estiver pausada manualmente
            if (!this.musicaPausada) {
               try {
                  this.audio.playLofi()
               } catch (e) {
                  console.warn('Erro ao tocar música:', e)
               }
            }
            
            this.momentoAcao()
         }
      }
   }
   
   /**
    * Salva o estado atual
    */
   salvarEstado() {
      const state = this.timer.getState()
      this.storage.saveTimerState(state)
   }
   
   /**
    * Restaura estado salvo
    */
   restaurarEstado() {
      const estadoSalvo = this.storage.loadTimerState()
      const configSalva = this.storage.loadPomodoroConfig()
      
      // Verificar se é para continuar uma sessão do banco
      const continuarSessao = localStorage.getItem('continuar_sessao')
      
      if (continuarSessao === 'true' && estadoSalvo) {
         // Limpar flag
         localStorage.removeItem('continuar_sessao')
         
         // Restaurar sessão do banco
         this.sessaoId = parseInt(localStorage.getItem('pomodoro_sessao_id') || '0')
         this.materiaId = parseInt(localStorage.getItem('pomodoro_materia_id') || '0')
         
         // Restaurar valores nos inputs
         if (this.elements.materia) {
            this.elements.materia.value = localStorage.getItem('pomodoro_materia') || ''
         }
         if (this.elements.nomeAula) {
            this.elements.nomeAula.value = localStorage.getItem('pomodoro_nome_aula') || ''
         }
         this.elements.acao.value = localStorage.getItem('pomodoro_acao') || ''
         this.elements.pausa.value = localStorage.getItem('pomodoro_pausa') || ''
         this.elements.sessoes.value = localStorage.getItem('pomodoro_sessoes') || ''
         
         // Restaurar configuração atual
         this.currentConfig = {
            acao: parseInt(localStorage.getItem('pomodoro_acao') || '0'),
            pausa: parseInt(localStorage.getItem('pomodoro_pausa') || '0'),
            sessoes: parseInt(localStorage.getItem('pomodoro_sessoes') || '0')
         }
         
         // Ajustar tempo se for continuar sessão
         if (estadoSalvo.tempoRestante !== undefined && estadoSalvo.tempoDecorrido !== undefined) {
            // Recalcular startTime baseado no tempo restante atual
            // Se temos tempoRestante em segundos, precisamos calcular startTime corretamente
            const tempoRestanteMs = estadoSalvo.tempoRestante * 1000
            const duracaoTotalMs = estadoSalvo.duration
            const tempoDecorridoMs = duracaoTotalMs - tempoRestanteMs
            const agora = Date.now()
            
            // startTime deve ser o momento em que o timer começou
            // Se já decorreram X ms, então começou há X ms atrás
            this.timer.state.startTime = agora - tempoDecorridoMs
            this.timer.state.duration = duracaoTotalMs
            this.timer.state.pausedAt = agora
            this.timer.state.pausedDuration = 0 // SEMPRE 0 ao restaurar
            this.timer.state.isPaused = true
            
            // Validar valores antes de continuar
            if (isNaN(this.timer.state.startTime) || isNaN(this.timer.state.duration)) {
               console.error('❌ Erro: Valores inválidos ao restaurar sessão')
               return false
            }
            
            console.log('✅ Sessão restaurada:', {
               tempoRestante: estadoSalvo.tempoRestante,
               tempoDecorrido: estadoSalvo.tempoDecorrido,
               startTime: this.timer.state.startTime,
               duration: this.timer.state.duration,
               pausedDuration: this.timer.state.pausedDuration,
               agora
            })
         }
      } else if (!estadoSalvo || !configSalva) {
         return false
      } else {
         // Restaurar valores nos inputs (modo normal)
         this.elements.acao.value = configSalva.acao
         this.elements.pausa.value = configSalva.pausa
         this.elements.sessoes.value = configSalva.sessoes
         
         if (this.elements.materia && configSalva.materia) {
            this.elements.materia.value = configSalva.materia
         }
         if (this.elements.nomeAula && configSalva.nome_aula) {
            this.elements.nomeAula.value = configSalva.nome_aula
         }
      }
      
      // Restaurar estado do timer
      this.timer.setState(estadoSalvo)
      
      // Mostrar timer
      this.ui.hideConfig()
      this.ui.showTimer()
      
      // Mostrar barra de progresso
      this.ui.toggleProgressBar(true)
      
      // Mostrar botão reset
      if (this.elements.btnReset) {
         this.elements.btnReset.classList.remove('d-none')
         this.elements.btnReset.style.cssText = 'display: inline-block !important; visibility: visible !important; opacity: 1 !important;'
      }
      
      // Atualizar UI
      this.ui.updateTitle(this.timer.state.type)
      
      const sessoesRestantes = this.timer.state.totalSessions - this.timer.state.sessionNumber
      this.ui.updateSessions(sessoesRestantes)
      
      // Atualizar botões
      if (this.timer.isPausedState()) {
         this.ui.showPlayButton()
         // Se estava pausado, não tocar música
         this.audio.pauseLofi()
      } else {
         this.ui.showPauseButton()
         // Se estava rodando, tocar música apenas se não estiver pausada manualmente
         if (!this.musicaPausada) {
            this.audio.playLofi()
         }
      }
      
      // Atualizar display
      this.timer.updateDisplay()
      this.updateProgressBar()
      
      // Se for continuar sessão, mostrar mensagem
      if (continuarSessao === 'true') {
         setTimeout(() => {
            if (window.Swal) {
               Swal.fire({
                  icon: 'info',
                  title: 'Sessão Restaurada',
                  text: 'Você pode continuar de onde parou. Clique em Play para retomar.',
                  timer: 3000,
                  showConfirmButton: false,
                  background: '#1a1a1a',
                  color: '#fff'
               })
            }
         }, 500)
      }
      
      return true
   }
   
   /**
    * Confirma reset do timer
    */
   confirmarReset() {
      const confirmar = confirm('Deseja realmente cancelar/resetar o timer?\n\nTodo o progresso será perdido e você voltará para a tela inicial.')
      if (confirmar) {
         console.log('✅ Usuário confirmou reset')
         this.resetTimer()
      } else {
         console.log('❌ Usuário cancelou reset')
      }
   }
   
   /**
    * Reseta o timer
    */
   async resetTimer() {
      console.log('=== RESETANDO TIMER ===')
      
      // Cancelar sessão no banco de dados
      if (this.sessaoId) {
         try {
            await this.api.atualizarSessao(this.sessaoId, {
               status: 'cancelado',
               hora_fim: new Date().toTimeString().slice(0, 8)
            })
            console.log('✅ Sessão cancelada no banco de dados')
         } catch (error) {
            console.error('Erro ao cancelar sessão no banco:', error)
         }
      }
      
      this.timer.stop()
      this.audio.pauseLofi()
      // Parar todos os sons
      if (this.audio.bell) this.audio.bell.pause()
      if (this.audio.volta) this.audio.volta.pause()
      if (this.audio.final) this.audio.final.pause()
      this.ui.hideTimer()
      this.ui.toggleProgressBar(false)
      this.ui.showConfig()
      this.ui.showPauseButton()
      this.ui.hidePlayButton()
      this.storage.clearTimerState()
      
      // Limpar sessão atual
      this.sessaoId = null
      this.materiaId = null
      
      // Limpar inputs
      if (this.elements.materia) this.elements.materia.value = ''
      if (this.elements.nomeAula) this.elements.nomeAula.value = ''
      this.elements.acao.value = ''
      this.elements.pausa.value = ''
      this.elements.sessoes.value = ''
      
      // Limpar IDs de sessão
      this.sessaoId = null
      this.materiaId = null
      
      // Esconder botão reset
      const btnResetEl = document.getElementById('btn-reset')
      if (btnResetEl) {
         btnResetEl.style.display = 'none'
         btnResetEl.style.visibility = 'hidden'
         btnResetEl.classList.add('d-none')
         console.log('✅ Botão reset escondido')
      }
      
      // Limpar erros
      this.ui.clearErrors()
      
      // Resetar ícone de música
      if (this.elements.musicIcon) {
         this.elements.musicIcon.className = 'fa-solid fa-volume-high'
      }
      this.musicaPausada = false
      
      console.log('=== TIMER RESETADO COM SUCESSO ===')
   }
   
   /**
    * Alterna exibição do histórico
    */
   async toggleHistory() {
      this.showHistory = !this.showHistory
      this.ui.toggleHistorySection(this.showHistory)
      
      if (this.showHistory) {
         await this.carregarEstatisticasCompletas()
      }
   }
   
   /**
    * Carrega estatísticas completas
    */
   async carregarEstatisticasCompletas() {
      try {
         const dataInicio = document.getElementById('filtro-data-inicio')?.value || 
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
         const dataFim = document.getElementById('filtro-data-fim')?.value || 
            new Date().toISOString().split('T')[0]
         const materiaId = document.getElementById('filtro-materia')?.value || null
         
         // Definir valores padrão nos filtros
         if (document.getElementById('filtro-data-inicio') && !document.getElementById('filtro-data-inicio').value) {
            document.getElementById('filtro-data-inicio').value = dataInicio
         }
         if (document.getElementById('filtro-data-fim') && !document.getElementById('filtro-data-fim').value) {
            document.getElementById('filtro-data-fim').value = dataFim
         }
         
         await this.stats.carregarEstatisticas(dataInicio, dataFim, materiaId)
      } catch (error) {
         console.error('Erro ao carregar estatísticas:', error)
         alert('Erro ao carregar estatísticas. Verifique o console.')
      }
   }
   
   /**
    * Carrega e exibe estatísticas
    */
   async loadAndDisplayStats() {
      // Carregar do localStorage (fallback)
      const statsLocal = this.history.getTodayStats()
      
      // Tentar carregar do banco de dados
      try {
         const statsDB = await this.api.getEstatisticasHoje()
         
         if (statsDB && statsDB.length > 0) {
            // Calcular totais
            let totalSessoes = 0
            let totalFoco = 0
            let totalPausa = 0
            
            statsDB.forEach(stat => {
               totalSessoes += parseInt(stat.sessoes_completadas || 0)
               totalFoco += parseInt(stat.total_foco_segundos || 0)
               totalPausa += parseInt(stat.total_pausa_segundos || 0)
            })
            
            // Atualizar UI com dados do banco
            this.ui.updateHistoryStats({
               sessionsCompleted: totalSessoes,
               focusTime: totalFoco,
               breakTime: totalPausa
            })
            
            console.log('✅ Estatísticas carregadas do banco:', { totalSessoes, totalFoco, totalPausa })
         } else {
            // Usar dados do localStorage se não houver no banco
            this.ui.updateHistoryStats(statsLocal)
         }
      } catch (error) {
         console.error('Erro ao carregar estatísticas do banco:', error)
         // Usar dados do localStorage em caso de erro
         this.ui.updateHistoryStats(statsLocal)
      }
   }
   
   /**
    * Limpa todos os inputs do formulário
    */
   limparInputs() {
      console.log('=== LIMPANDO INPUTS ===')
      
      // Limpar inputs
      if (this.elements.materia) {
         this.elements.materia.value = ''
      }
      if (this.elements.nomeAula) {
         this.elements.nomeAula.value = ''
      }
      if (this.elements.acao) {
         this.elements.acao.value = ''
      }
      if (this.elements.pausa) {
         this.elements.pausa.value = ''
      }
      if (this.elements.sessoes) {
         this.elements.sessoes.value = ''
      }
      
      // Limpar erros de validação
      this.ui.clearErrors()
      
      // Limpar configuração atual
      this.currentConfig = {
         acao: 0,
         pausa: 0,
         sessoes: 0
      }
      
      console.log('✅ Inputs limpos com sucesso')
   }
   
   /**
    * Cria botão cancelar dinamicamente se não existir
    */
   criarBotaoReset() {
      const btnMusic = document.getElementById('btn-music')
      if (btnMusic && !document.getElementById('btn-reset')) {
         const btnReset = document.createElement('button')
         btnReset.id = 'btn-reset'
         btnReset.className = 'btn btn-sm btn-outline-light'
         btnReset.setAttribute('aria-label', 'Cancelar timer')
         btnReset.setAttribute('title', 'Cancelar timer e voltar ao início')
         btnReset.innerHTML = '<i class="fa-solid fa-stop me-1" aria-hidden="true"></i><span class="d-none d-md-inline">Cancelar</span>'
         btnReset.style.setProperty('display', 'inline-block', 'important')
         
         btnReset.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.confirmarReset()
         })
         
         btnMusic.parentNode.insertBefore(btnReset, btnMusic.nextSibling)
         this.elements.btnReset = btnReset
         console.log('✅ Botão CANCELAR criado dinamicamente')
      }
   }
   
   /**
    * Alterna estado da música (pausar/retomar)
    */
   toggleMusica() {
      const lofiElement = this.audio.getLofiElement()
      
      if (!lofiElement) {
         console.warn('Elemento de áudio não encontrado')
         return
      }
      
      if (this.musicaPausada) {
         // Retomar música
         this.audio.playLofi()
         this.musicaPausada = false
         
         // Atualizar ícone
         if (this.elements.musicIcon) {
            this.elements.musicIcon.className = 'fa-solid fa-volume-high'
         }
         
         if (this.elements.btnMusic) {
            this.elements.btnMusic.setAttribute('aria-label', 'Pausar música')
            this.elements.btnMusic.setAttribute('title', 'Pausar música de fundo')
         }
         
         console.log('🎵 Música retomada')
      } else {
         // Pausar música
         this.audio.pauseLofi()
         this.musicaPausada = true
         
         // Atualizar ícone
         if (this.elements.musicIcon) {
            this.elements.musicIcon.className = 'fa-solid fa-volume-xmark'
         }
         
         if (this.elements.btnMusic) {
            this.elements.btnMusic.setAttribute('aria-label', 'Retomar música')
            this.elements.btnMusic.setAttribute('title', 'Retomar música de fundo')
         }
         
         console.log('🔇 Música pausada')
      }
   }
}

// Inicializar aplicativo quando DOM estiver pronto
function initApp() {
   console.log('=== INICIALIZANDO APLICATIVO ===')
   console.log('DOM pronto:', document.readyState)
   
   try {
      // Verificar se elementos existem
      const btnIniciar = document.getElementById('btn-iniciar')
      console.log('Botão iniciar encontrado:', !!btnIniciar)
      
      if (!btnIniciar) {
         console.error('Botão iniciar não encontrado no DOM!')
         alert('Erro: Botão iniciar não encontrado. Recarregue a página.')
         return
      }
      
      window.pomodoroApp = new PomodoroApp()
      console.log('Aplicativo inicializado com sucesso!', window.pomodoroApp)
      console.log('=== APLICATIVO PRONTO ===')
      
      // Debug: Verificar se o botão tem listener (apenas em desenvolvimento)
      // Removido getEventListeners pois é função do Chrome DevTools, não disponível em produção
      
   } catch (error) {
      console.error('Erro ao inicializar aplicativo:', error)
      console.error('Stack:', error.stack)
      alert('Erro ao inicializar aplicativo: ' + error.message + '\n\nVerifique o console para mais detalhes.')
   }
}

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', initApp)
} else {
   // DOM já está pronto
   initApp()
}

