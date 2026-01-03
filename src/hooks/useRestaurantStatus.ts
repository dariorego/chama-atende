import { useMemo, useState, useEffect } from 'react';
import { BusinessHours, DayHours } from '@/types/restaurant';

interface RestaurantStatusResult {
  isOpen: boolean;
  currentDayHours: DayHours | null;
  nextOpenTime: string | null;
  statusText: string;
}

// Map English weekday names to our keys
const WEEKDAY_MAP: Record<string, keyof BusinessHours> = {
  'sunday': 'sunday',
  'monday': 'monday',
  'tuesday': 'tuesday',
  'wednesday': 'wednesday',
  'thursday': 'thursday',
  'friday': 'friday',
  'saturday': 'saturday',
};

export function useRestaurantStatus(
  businessHours: BusinessHours | null | undefined,
  timezone: string = 'America/Sao_Paulo'
): RestaurantStatusResult {
  const [now, setNow] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!businessHours) {
      return {
        isOpen: false,
        currentDayHours: null,
        nextOpenTime: null,
        statusText: 'Horário não configurado'
      };
    }

    try {
      // Get current date/time in the configured timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        weekday: 'long',
      });

      const parts = formatter.formatToParts(now);
      const weekday = parts.find(p => p.type === 'weekday')?.value?.toLowerCase() || 'monday';
      const hour = parts.find(p => p.type === 'hour')?.value || '00';
      const minute = parts.find(p => p.type === 'minute')?.value || '00';
      const currentTime = `${hour}:${minute}`;

      // Map weekday to our structure
      const dayKey = WEEKDAY_MAP[weekday] || 'monday';
      const todayHours = businessHours[dayKey];

      if (!todayHours || todayHours.is_closed) {
        return {
          isOpen: false,
          currentDayHours: todayHours || null,
          nextOpenTime: null,
          statusText: 'Fechado hoje'
        };
      }

      // Compare times
      const openTime = todayHours.open;
      const closeTime = todayHours.close;

      // Helper to convert time to minutes for comparison
      const timeToMinutes = (time: string): number => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      const currentMinutes = timeToMinutes(currentTime);
      const openMinutes = timeToMinutes(openTime);
      const closeMinutes = timeToMinutes(closeTime);

      // Special case: closing after midnight (e.g., 23:00 - 02:00)
      let isOpenNow: boolean;
      if (closeMinutes < openMinutes) {
        // Restaurant closes after midnight
        isOpenNow = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
      } else {
        // Normal hours (closes same day)
        isOpenNow = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
      }

      if (isOpenNow) {
        return {
          isOpen: true,
          currentDayHours: todayHours,
          nextOpenTime: null,
          statusText: `Aberto até ${closeTime}`
        };
      }

      // Haven't opened yet today
      if (currentMinutes < openMinutes) {
        return {
          isOpen: false,
          currentDayHours: todayHours,
          nextOpenTime: openTime,
          statusText: `Abre às ${openTime}`
        };
      }

      // Already closed today
      return {
        isOpen: false,
        currentDayHours: todayHours,
        nextOpenTime: null,
        statusText: 'Fechado'
      };
    } catch (error) {
      console.error('Error calculating restaurant status:', error);
      return {
        isOpen: false,
        currentDayHours: null,
        nextOpenTime: null,
        statusText: 'Erro ao calcular status'
      };
    }
  }, [businessHours, timezone, now]);
}
