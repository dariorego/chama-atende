import { useEffect, useState } from "react";

export interface AvailabilitySchedule {
  availability_enabled?: boolean | null;
  available_days?: number[] | null;
  available_from?: string | null;
  available_to?: string | null;
}

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export const DAY_SHORT_LABELS: Record<number, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

export const DAY_INITIALS: Record<number, string> = {
  0: "D",
  1: "S",
  2: "T",
  3: "Q",
  4: "Q",
  5: "S",
  6: "S",
};

/** "HH:MM" or "HH:MM:SS" -> minutes since midnight. Returns null when invalid. */
function toMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const [h, m] = time.split(":");
  const hours = Number(h);
  const minutes = Number(m ?? 0);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

export function normalizeTime(time: string | null | undefined): string {
  if (!time) return "";
  return time.slice(0, 5);
}

interface ZonedNow {
  weekday: number;
  minutes: number;
}

function getZonedNow(timezone: string, reference: Date): ZonedNow {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      weekday: "short",
    }).formatToParts(reference);

    const weekdayName = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    const map: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return { weekday: map[weekdayName] ?? reference.getDay(), minutes: (hour % 24) * 60 + minute };
  } catch {
    return { weekday: reference.getDay(), minutes: reference.getHours() * 60 + reference.getMinutes() };
  }
}

/**
 * Checks whether an item/category is available right now.
 * Without configuration (availability_enabled false) it is always available.
 * Supports windows that cross midnight (e.g. 18:00 -> 02:00): the day selection
 * refers to the day the window starts.
 */
export function isAvailableNow(
  schedule: AvailabilitySchedule | null | undefined,
  timezone: string = "America/Sao_Paulo",
  reference: Date = new Date(),
): boolean {
  if (!schedule?.availability_enabled) return true;

  const days = schedule.available_days?.length ? schedule.available_days : ALL_DAYS;
  const from = toMinutes(schedule.available_from);
  const to = toMinutes(schedule.available_to);
  const { weekday, minutes } = getZonedNow(timezone, reference);

  const previousDay = (weekday + 6) % 7;

  // No time limits: only the weekday matters.
  if (from === null && to === null) return days.includes(weekday);

  const start = from ?? 0;
  const end = to ?? 24 * 60;

  if (start < end) {
    return days.includes(weekday) && minutes >= start && minutes < end;
  }

  // Crosses midnight
  const inLateBlock = minutes >= start && days.includes(weekday);
  const inEarlyBlock = minutes < end && days.includes(previousDay);
  return inLateBlock || inEarlyBlock;
}

/** Human friendly label, e.g. "Seg–Sex 11:30–15:00". Returns null when always available. */
export function formatAvailabilityLabel(schedule: AvailabilitySchedule | null | undefined): string | null {
  if (!schedule?.availability_enabled) return null;

  const days = (schedule.available_days?.length ? schedule.available_days : ALL_DAYS)
    .slice()
    .sort((a, b) => a - b);

  let daysLabel: string;
  if (days.length === 7) {
    daysLabel = "Todos os dias";
  } else if (days.length === 5 && days.join(",") === "1,2,3,4,5") {
    daysLabel = "Seg–Sex";
  } else if (days.length === 2 && days.join(",") === "0,6") {
    daysLabel = "Fim de semana";
  } else {
    daysLabel = days.map((d) => DAY_SHORT_LABELS[d]).join(", ");
  }

  const from = normalizeTime(schedule.available_from);
  const to = normalizeTime(schedule.available_to);
  const timeLabel = from && to ? `${from}–${to}` : from ? `a partir de ${from}` : to ? `até ${to}` : "";

  return timeLabel ? `${daysLabel} ${timeLabel}` : daysLabel;
}

/** Re-renders every minute so availability windows flip automatically. */
export function useAvailabilityClock(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return now;
}
