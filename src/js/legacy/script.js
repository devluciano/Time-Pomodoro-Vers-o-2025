// ============================================
// FASE 1: CORREÇÕES CRÍTICAS IMPLEMENTADAS
// ============================================
// 1. Pause/Play do timer
// 2. Timer preciso usando Date API
// 3. Persistência de estado
// 4. Validação robusta
// ============================================

// Acessa os campos de input
const acao = document.getElementById('acao')
const pausa = document.getElementById('pausa')
const sessoes = document.getElementById('sessoes')

// Acessa os audios de alertas
const bell = new Audio("./audio/bell.mp3")
const volta = new Audio("./audio/volta.mp3")
const final = new Audio("./audio/final.mp3")

// Acessa a tag audio e os botões de pause e play
const lofi = document.getElementById('lofi')
const pauseBtn = document.getElementById('pause')
const playBtn = document.getElementById('play')

// Estado do timer
let timerState = {
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

// Constantes de validação
const MIN_VALUE = 1
const MAX_MINUTES = 120
const MAX_SESSIONS = 50


// ============================================
// VALIDAÇÃO ROBUSTA
// ============================================

function limparErros() {
   document.getElementById('erro_acao').innerHTML = ''
   document.getElementById('erro_pausa').innerHTML = ''
   document.getElementById('erro_sessoes').innerHTML = ''
}

function validarInput(input, nome, min = MIN_VALUE, max = MAX_MINUTES) {
   const valor = parseInt(input.value, 10)
   const erroElement = document.getElementById(`erro_${nome}`)
   
   if (!input.value || input.value.trim() === '') {
      erroElement.innerHTML = `${nome.charAt(0).toUpperCase() + nome.slice(1)} é obrigatório`
      input.focus()
      return false
   }
   
   if (isNaN(valor) || valor !== parseFloat(input.value)) {
      erroElement.innerHTML = `${nome.charAt(0).toUpperCase() + nome.slice(1)} deve ser um número inteiro`
      input.focus()
      return false
   }
   
   if (valor < min) {
      erroElement.innerHTML = `${nome.charAt(0).toUpperCase() + nome.slice(1)} deve ser no mínimo ${min}`
      input.focus()
      return false
   }
   
   if (valor > max) {
      erroElement.innerHTML = `${nome.charAt(0).toUpperCase() + nome.slice(1)} deve ser no máximo ${max}`
      input.focus()
      return false
   }
   
   erroElement.innerHTML = ''
   return true
}

function validarTodosInputs() {
   limparErros()
   
   const acaoValida = validarInput(acao, 'acao', MIN_VALUE, MAX_MINUTES)
   const pausaValida = validarInput(pausa, 'pausa', MIN_VALUE, MAX_MINUTES)
   const sessoesValida = validarInput(sessoes, 'sessoes', MIN_VALUE, MAX_SESSIONS)
   
   return acaoValida && pausaValida && sessoesValida
}

// ============================================
// PERSISTÊNCIA DE ESTADO
// ============================================

function salvarEstado() {
   const estado = {
      type: timerState.type,
      startTime: timerState.startTime,
      duration: timerState.duration,
      isPaused: timerState.isPaused,
      pausedAt: timerState.pausedAt,
      pausedDuration: timerState.pausedDuration,
      sessionNumber: timerState.sessionNumber,
      totalSessions: timerState.totalSessions,
      timestamp: Date.now()
   }
   localStorage.setItem('timerState', JSON.stringify(estado))
}

function carregarEstado() {
   const estadoSalvo = localStorage.getItem('timerState')
   if (estadoSalvo) {
      try {
         const estado = JSON.parse(estadoSalvo)
         // Verificar se o estado não é muito antigo (mais de 24 horas)
         if (estado.timestamp && (Date.now() - estado.timestamp) < 24 * 60 * 60 * 1000) {
            return estado
         }
      } catch (e) {
         console.error('Erro ao carregar estado:', e)
      }
   }
   return null
}

function limparEstado() {
   localStorage.removeItem('timerState')
   timerState = {
      type: null,
      startTime: null,
      duration: 0,
      isPaused: false,
      pausedAt: null,
      pausedDuration: 0,
      intervalId: null,
      sessionNumber: 0,
      totalSessions: 0
   }
}

function salvarConfiguracao() {
   localStorage.setItem('acao', String(acao.value))
   localStorage.setItem('pausa', String(pausa.value))
   localStorage.setItem('sessoes', String(sessoes.value))
}

// ============================================
// TIMER PRECISO COM DATE API
// ============================================

function atualizarDisplay() {
   if (!timerState.startTime || !timerState.duration) return
   
   let tempoDecorrido
   
   if (timerState.isPaused && timerState.pausedAt) {
      // Se está pausado, usar o tempo até a pausa
      tempoDecorrido = timerState.pausedAt - timerState.startTime - timerState.pausedDuration
   } else {
      // Se está rodando, calcular tempo atual
      tempoDecorrido = Date.now() - timerState.startTime - timerState.pausedDuration
   }
   
   const tempoRestante = Math.max(0, timerState.duration - tempoDecorrido)
   const minutos = Math.floor(tempoRestante / 60000)
   const segundos = Math.floor((tempoRestante % 60000) / 1000)
   
   // Atualizar display
   const minutesEl = document.getElementById('minutes_ok')
   const secondsEl = document.getElementById('seconds_ok')
   
   if (minutesEl) minutesEl.innerHTML = minutos
   if (secondsEl) secondsEl.innerHTML = segundos.toString().padStart(2, '0')
   
   // Verificar se acabou
   if (tempoRestante <= 0 && !timerState.isPaused) {
      if (timerState.intervalId) {
         clearInterval(timerState.intervalId)
         timerState.intervalId = null
      }
      onTimerComplete()
   }
}

function iniciarTimer(tipo, duracaoMinutos) {
   // Limpar interval anterior se existir
   if (timerState.intervalId) {
      clearInterval(timerState.intervalId)
   }
   
   timerState.type = tipo
   timerState.duration = duracaoMinutos * 60 * 1000 // converter para milissegundos
   timerState.startTime = Date.now()
   timerState.isPaused = false
   timerState.pausedAt = null
   timerState.pausedDuration = 0
   
   // Mostrar botão pause e esconder play
   pauseBtn.style.setProperty('display', 'block', 'important')
   playBtn.style.setProperty('display', 'none', 'important')
   
   // Atualizar display imediatamente
   atualizarDisplay()
   
   // Atualizar a cada 100ms para precisão
   timerState.intervalId = setInterval(atualizarDisplay, 100)
   
   salvarEstado()
}

// ============================================
// PAUSE/PLAY DO TIMER
// ============================================

function pausar() {
   if (!timerState.startTime || timerState.isPaused) return
   
   // Pausar timer
   timerState.isPaused = true
   timerState.pausedAt = Date.now()
   
   // Pausar música
   lofi.pause()
   
   // Parar interval
   if (timerState.intervalId) {
      clearInterval(timerState.intervalId)
      timerState.intervalId = null
   }
   
   // Atualizar botões
   playBtn.style.setProperty('display', 'block', 'important')
   pauseBtn.style.setProperty('display', 'none', 'important')
   
   salvarEstado()
}

function executar() {
   if (!timerState.startTime) return
   
   if (timerState.isPaused) {
      // Retomar timer
      const tempoPausado = Date.now() - timerState.pausedAt
      timerState.pausedDuration += tempoPausado
      timerState.isPaused = false
      timerState.pausedAt = null
      
      // Retomar música
      lofi.play()
      
      // Reiniciar interval
      timerState.intervalId = setInterval(atualizarDisplay, 100)
      
      // Atualizar botões
      playBtn.style.setProperty('display', 'none', 'important')
      pauseBtn.style.setProperty('display', 'block', 'important')
      
      salvarEstado()
   } else {
      // Apenas tocar música se timer não estava pausado
      lofi.play()
      playBtn.style.setProperty('display', 'none', 'important')
      pauseBtn.style.setProperty('display', 'block', 'important')
   }
}

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

function iniciar() {
   if (!validarTodosInputs()) {
      return
   }
   
   // Salvar configuração
   salvarConfiguracao()
   
   // Inicializar estado
   timerState.totalSessions = parseInt(sessoes.value, 10)
   timerState.sessionNumber = 0
   
   // Tocar música e mostrar botão pause
   lofi.play()
   pauseBtn.style.setProperty('display', 'block', 'important')
   playBtn.style.setProperty('display', 'none', 'important')
   
   // Esconder config e mostrar timer
   document.getElementById('config').style.setProperty('display', 'none', 'important')
   document.getElementById('timer').style.setProperty('display', 'block', 'important')
   
   // Iniciar primeira ação
   momentoAcao()
}

function onTimerComplete() {
   if (timerState.type === 'acao') {
      bell.play()
      momentoPausa()
   } else if (timerState.type === 'pausa') {
      timerState.sessionNumber++
      localStorage.setItem('sessoes', String(timerState.totalSessions - timerState.sessionNumber))
      
      if (timerState.sessionNumber >= timerState.totalSessions) {
         // Todas sessões completadas
         final.play()
         limparEstado()
         localStorage.clear()
         
         document.getElementById('config').style.setProperty('display', 'none', 'important')
         document.getElementById('timer').style.setProperty('display', 'none', 'important')
         document.getElementById('fim').style.setProperty('display', 'block', 'important')
      } else {
         // Próxima ação
         volta.play()
         momentoAcao()
      }
   }
}

function momentoAcao() {
   // Atualizar sessões restantes
   const sessoesRestantes = timerState.totalSessions - timerState.sessionNumber
   const titleSessao = document.getElementById('title_sessao')
   
   if (sessoesRestantes !== 1) {
      titleSessao.innerHTML = sessoesRestantes + ' sessões restantes'
   } else {
      titleSessao.innerHTML = sessoesRestantes + ' sessão restante'
   }
   
   // Atualizar título
   const title = document.getElementById('title')
   title.innerHTML = "AÇÃO"
   title.style.fontSize = '25pt'
   title.style.fontWeight = 'bold'
   title.style.setProperty('color', '#28a745', 'important')
   
   // Iniciar timer com valor do localStorage
   const duracaoAcao = Number(localStorage.getItem('acao'))
   iniciarTimer('acao', duracaoAcao)
}


function momentoPausa() {
   // Atualizar título
   const title = document.getElementById('title')
   title.innerHTML = "PAUSA"
   title.style.fontSize = '25pt'
   title.style.fontWeight = 'bold'
   title.style.setProperty('color', '#dc3545', 'important')
   
   // Iniciar timer com valor do localStorage
   const duracaoPausa = Number(localStorage.getItem('pausa'))
   iniciarTimer('pausa', duracaoPausa)
}

// ============================================
// RESTAURAÇÃO DE ESTADO AO CARREGAR
// ============================================

function restaurarEstado() {
   const estadoSalvo = carregarEstado()
   if (!estadoSalvo) return false
   
   // Restaurar configuração
   const acaoSalva = localStorage.getItem('acao')
   const pausaSalva = localStorage.getItem('pausa')
   const sessoesSalva = localStorage.getItem('sessoes')
   
   if (!acaoSalva || !pausaSalva || !sessoesSalva) return false
   
   // Restaurar valores nos inputs
   acao.value = acaoSalva
   pausa.value = pausaSalva
   sessoes.value = sessoesSalva
   
   // Restaurar estado do timer
   timerState.type = estadoSalvo.type
   timerState.startTime = estadoSalvo.startTime
   timerState.duration = estadoSalvo.duration
   timerState.isPaused = estadoSalvo.isPaused
   timerState.pausedAt = estadoSalvo.pausedAt
   timerState.pausedDuration = estadoSalvo.pausedDuration || 0
   timerState.totalSessions = parseInt(sessoesSalva, 10)
   timerState.sessionNumber = estadoSalvo.sessionNumber || 0
   
   // Se estava pausado, ajustar pausedDuration
   if (timerState.isPaused && timerState.pausedAt) {
      timerState.pausedDuration += Date.now() - timerState.pausedAt
   }
   
   // Mostrar timer
   document.getElementById('config').style.setProperty('display', 'none', 'important')
   document.getElementById('timer').style.setProperty('display', 'block', 'important')
   
   // Atualizar UI
   if (timerState.type === 'acao') {
      const title = document.getElementById('title')
      title.innerHTML = "AÇÃO"
      title.style.fontSize = '25pt'
      title.style.fontWeight = 'bold'
      title.style.setProperty('color', '#28a745', 'important')
   } else {
      const title = document.getElementById('title')
      title.innerHTML = "PAUSA"
      title.style.fontSize = '25pt'
      title.style.fontWeight = 'bold'
      title.style.setProperty('color', '#dc3545', 'important')
   }
   
   // Atualizar sessões
   const sessoesRestantes = timerState.totalSessions - timerState.sessionNumber
   const titleSessao = document.getElementById('title_sessao')
   if (sessoesRestantes !== 1) {
      titleSessao.innerHTML = sessoesRestantes + ' sessões restantes'
   } else {
      titleSessao.innerHTML = sessoesRestantes + ' sessão restante'
   }
   
   // Atualizar botões
   if (timerState.isPaused) {
      playBtn.style.setProperty('display', 'block', 'important')
      pauseBtn.style.setProperty('display', 'none', 'important')
   } else {
      playBtn.style.setProperty('display', 'none', 'important')
      pauseBtn.style.setProperty('display', 'block', 'important')
      // Reiniciar timer se não estava pausado
      timerState.intervalId = setInterval(atualizarDisplay, 100)
   }
   
   // Atualizar display
   atualizarDisplay()
   
   return true
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// Tentar restaurar estado ao carregar página
document.addEventListener('DOMContentLoaded', function() {
   // Limpar erros ao digitar
   acao.addEventListener('input', limparErros)
   pausa.addEventListener('input', limparErros)
   sessoes.addEventListener('input', limparErros)
   
   // Tentar restaurar estado
   if (!restaurarEstado()) {
      // Se não há estado salvo, limpar localStorage de timer
      localStorage.removeItem('timerState')
   }
})



