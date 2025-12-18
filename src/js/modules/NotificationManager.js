/**
 * Classe NotificationManager - Gerencia notificações do navegador
 * FASE 3: Funcionalidades Essenciais
 */
export class NotificationManager {
   constructor() {
      this.permission = null
      this.enabled = true
      this.checkPermission()
   }
   
   /**
    * Verifica permissão de notificações
    */
   async checkPermission() {
      if (!('Notification' in window)) {
         console.warn('Este navegador não suporta notificações')
         this.enabled = false
         return
      }
      
      this.permission = Notification.permission
      
      // Se ainda não foi solicitado, solicitar
      if (this.permission === 'default') {
         try {
            this.permission = await Notification.requestPermission()
         } catch (e) {
            console.error('Erro ao solicitar permissão de notificações:', e)
            this.enabled = false
         }
      }
      
      if (this.permission !== 'granted') {
         this.enabled = false
      }
   }
   
   /**
    * Verifica se notificações estão habilitadas
    */
   isEnabled() {
      return this.enabled && this.permission === 'granted'
   }
   
   /**
    * Mostra notificação
    * @param {string} title - Título da notificação
    * @param {Object} options - Opções da notificação
    */
   show(title, options = {}) {
      if (!this.isEnabled()) {
         return
      }
      
      // Não mostrar se a página está em foco
      if (document.hasFocus()) {
         return
      }
      
      const defaultOptions = {
         body: options.body || '',
         icon: options.icon || './img/logo.png',
         badge: './img/logo.png',
         tag: 'pomodoro-timer',
         requireInteraction: false,
         silent: false
      }
      
      try {
         const notification = new Notification(title, { ...defaultOptions, ...options })
         
         // Fechar automaticamente após 5 segundos
         setTimeout(() => {
            notification.close()
         }, 5000)
         
         // Fechar ao clicar
         notification.onclick = () => {
            window.focus()
            notification.close()
         }
         
         return notification
      } catch (e) {
         console.error('Erro ao mostrar notificação:', e)
      }
   }
   
   /**
    * Notifica fim da ação
    */
   notifyActionComplete() {
      this.show('⏰ Ação Concluída!', {
         body: 'Hora da pausa! Descanse um pouco.',
         icon: './img/logo.png'
      })
   }
   
   /**
    * Notifica fim da pausa
    */
   notifyBreakComplete() {
      this.show('🎯 Pausa Concluída!', {
         body: 'Volte ao trabalho! Foco total.',
         icon: './img/logo.png'
      })
   }
   
   /**
    * Notifica conclusão de todas as sessões
    */
   notifyAllComplete() {
      this.show('🎉 Parabéns!', {
         body: 'Você completou todas as sessões Pomodoro!',
         icon: './img/logo.png',
         requireInteraction: true
      })
   }
   
   /**
    * Solicita permissão de notificações
    */
   async requestPermission() {
      if (!('Notification' in window)) {
         alert('Seu navegador não suporta notificações.')
         return false
      }
      
      try {
         this.permission = await Notification.requestPermission()
         this.enabled = this.permission === 'granted'
         return this.enabled
      } catch (e) {
         console.error('Erro ao solicitar permissão:', e)
         return false
      }
   }
}





