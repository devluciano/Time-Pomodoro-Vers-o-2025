/**
 * Classe AudioManager - Gerencia todos os áudios do aplicativo
 */
export class AudioManager {
   constructor() {
      this.bell = new Audio("./audio/bell.mp3")
      this.volta = new Audio("./audio/volta.mp3")
      this.final = new Audio("./audio/final.mp3")
      this.lofi = document.getElementById('lofi')
      
      // Garantir que a música não toque automaticamente
      if (this.lofi) {
         this.lofi.pause()
         this.lofi.currentTime = 0
      }
      
      // Configurar volume padrão
      this.setVolume(0.5)
   }
   
   /**
    * Toca o som de sino (fim da ação)
    */
   playBell() {
      this.bell.play().catch(e => console.error('Erro ao tocar bell:', e))
   }
   
   /**
    * Toca o som de volta (início de nova ação)
    */
   playVolta() {
      this.volta.play().catch(e => console.error('Erro ao tocar volta:', e))
   }
   
   /**
    * Toca o som final (todas sessões completadas)
    */
   playFinal() {
      this.final.play().catch(e => console.error('Erro ao tocar final:', e))
   }
   
   /**
    * Toca música de fundo (lo-fi)
    */
   playLofi() {
      if (this.lofi) {
         this.lofi.play().catch(e => console.error('Erro ao tocar lofi:', e))
      }
   }
   
   /**
    * Pausa música de fundo
    */
   pauseLofi() {
      if (this.lofi) {
         this.lofi.pause()
      }
   }
   
   /**
    * Define volume dos sons
    * @param {number} volume - Volume entre 0 e 1
    */
   setVolume(volume) {
      const vol = Math.max(0, Math.min(1, volume))
      this.bell.volume = vol
      this.volta.volume = vol
      this.final.volume = vol
      if (this.lofi) {
         this.lofi.volume = vol
      }
   }
   
   /**
    * Retorna o elemento de áudio lo-fi
    */
   getLofiElement() {
      return this.lofi
   }
}


