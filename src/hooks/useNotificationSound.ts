import { useCallback, useRef } from 'react';
import { useAdminSettings } from './useAdminSettings';

export function useNotificationSound() {
  const { restaurant } = useAdminSettings();
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = useCallback(() => {
    // Verificar se som está habilitado
    if (!restaurant?.notification_settings?.sound_enabled) {
      return;
    }

    try {
      // Criar AudioContext se não existir
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Criar som de notificação (beep duplo)
      const playBeep = (startTime: number, frequency: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      };

      const now = ctx.currentTime;
      playBeep(now, 800);        // Primeiro beep
      playBeep(now + 0.35, 1000); // Segundo beep (mais agudo)
      
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [restaurant?.notification_settings?.sound_enabled]);

  // Função para testar som (ignora configuração)
  const playTestSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      const playBeep = (startTime: number, frequency: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      };

      const now = ctx.currentTime;
      playBeep(now, 800);
      playBeep(now + 0.35, 1000);
    } catch (error) {
      console.error('Error playing test sound:', error);
    }
  }, []);

  return { playNotificationSound, playTestSound };
}
