import { useCallback, useRef } from 'react';
import { useTenantSettings } from './useAdminSettings';
import type { NotificationSoundType } from '@/types/restaurant';
import som1Asset from '@/assets/som.mp3.asset.json';
import som2Asset from '@/assets/som3.mp3.asset.json';
import som3Asset from '@/assets/som4.mp3.asset.json';

const AUDIO_FILES: Partial<Record<NotificationSoundType, string>> = {
  toque1: som1Asset.url,
  toque2: som2Asset.url,
  toque3: som3Asset.url,
};

function playAudioFile(url: string, volume: number) {
  const audio = new Audio(url);
  audio.volume = Math.max(0, Math.min(1, volume));
  void audio.play().catch((error) => console.error('Error playing notification audio:', error));
}

type Ctx = AudioContext;

function getAudioContext(ref: React.MutableRefObject<Ctx | null>): Ctx {
  if (!ref.current) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ref.current = new AC();
  }
  if (ref.current.state === 'suspended') {
    void ref.current.resume();
  }
  return ref.current;
}

/** Toca um dos três padrões sonoros com o volume informado (0 - 2). */
export function playSoundPattern(ctx: Ctx, type: NotificationSoundType, volume: number) {
  const vol = Math.max(0, Math.min(2, volume));
  if (vol === 0) return;

  const file = AUDIO_FILES[type];
  if (file) {
    playAudioFile(file, Math.min(1, vol));
    return;
  }

  const beep = (
    startOffset: number,
    frequency: number,
    duration: number,
    wave: OscillatorType = 'sine',
    endFrequency?: number,
  ) => {
    const start = ctx.currentTime + startOffset;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) {
      oscillator.frequency.linearRampToValueAtTime(endFrequency, start + duration);
    }

    gainNode.gain.setValueAtTime(Math.min(0.95, vol * 0.4), start);
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

    oscillator.start(start);
    oscillator.stop(start + duration);
  };

  switch (type) {
    case 'campainha':
      beep(0, 1200, 0.14, 'triangle');
      beep(0.18, 1200, 0.14, 'triangle');
      beep(0.36, 1400, 0.2, 'triangle');
      break;
    case 'alerta':
      beep(0, 500, 0.45, 'sawtooth', 1100);
      beep(0.5, 500, 0.45, 'sawtooth', 1100);
      break;
    case 'sino':
    default:
      beep(0, 800, 0.3);
      beep(0.35, 1000, 0.3);
      break;
  }
}

export function useNotificationSound() {
  const { restaurant } = useTenantSettings();
  const audioContextRef = useRef<Ctx | null>(null);

  const settings = restaurant?.notification_settings;
  const enabled = settings?.sound_enabled ?? true;
  const soundType = (settings?.sound_type as NotificationSoundType) || 'sino';
  const volume = typeof settings?.sound_volume === 'number' ? settings.sound_volume : 70;
  const repeatEnabled = settings?.sound_repeat_enabled ?? false;
  const repeatSeconds =
    typeof settings?.sound_repeat_seconds === 'number' && settings.sound_repeat_seconds >= 5
      ? settings.sound_repeat_seconds
      : 30;

  const playNotificationSound = useCallback(() => {
    if (!enabled) return;
    try {
      playSoundPattern(getAudioContext(audioContextRef), soundType, volume / 100);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [enabled, soundType, volume]);

  // Testa um som específico (ignora a configuração salva)
  const playTestSound = useCallback((type?: NotificationSoundType, testVolume?: number) => {
    try {
      playSoundPattern(
        getAudioContext(audioContextRef),
        type || soundType,
        (testVolume ?? volume) / 100,
      );
    } catch (error) {
      console.error('Error playing test sound:', error);
    }
  }, [soundType, volume]);

  return { playNotificationSound, playTestSound, repeatEnabled, repeatSeconds };
}
