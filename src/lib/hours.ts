import type { DayKey, TradingHours } from "@/config/restaurant";

const ORDERED_DAYS: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

type LocalParts = {
  dayIndex: number;
  minutes: number;
};

export type RestaurantStatus = {
  isOpen: boolean;
  todayLabel: string;
  countdownLabel: string;
  day: DayKey;
  open: string;
  close: string;
};

export function getRestaurantStatus(
  hours: Record<DayKey, TradingHours>,
  now = new Date(),
  timeZone = "Australia/Sydney",
): RestaurantStatus {
  const local = getLocalParts(now, timeZone);
  const today = ORDERED_DAYS[local.dayIndex];
  const todayHours = hours[today];
  const openMinutes = timeToMinutes(todayHours.open);
  const closeMinutes = timeToMinutes(todayHours.close);
  const isOpen = local.minutes >= openMinutes && local.minutes < closeMinutes;
  const targetMinutes = isOpen ? closeMinutes : nextOpenMinutes(hours, local.dayIndex, local.minutes);
  const deltaMinutes = targetMinutes - local.minutes;

  return {
    isOpen,
    todayLabel: `Today: ${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}`,
    countdownLabel: `${isOpen ? "Closes" : "Opens"} in ${formatDuration(deltaMinutes)}`,
    day: today,
    open: todayHours.open,
    close: todayHours.close,
  };
}

export function formatTime(time: string) {
  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

export function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

function nextOpenMinutes(hours: Record<DayKey, TradingHours>, dayIndex: number, currentMinutes: number) {
  const today = ORDERED_DAYS[dayIndex];
  const todayOpen = timeToMinutes(hours[today].open);

  if (currentMinutes < todayOpen) {
    return todayOpen;
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDay = ORDERED_DAYS[(dayIndex + offset) % 7];
    return offset * 24 * 60 + timeToMinutes(hours[nextDay].open);
  }

  return todayOpen;
}

function formatDuration(minutes: number) {
  const clamped = Math.max(0, minutes);
  const hours = Math.floor(clamped / 60);
  const remainingMinutes = clamped % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function getLocalParts(date: Date, timeZone: string): LocalParts {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const weekday = parts.find((part) => part.type === "weekday")?.value.toLowerCase();
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const dayIndex = ORDERED_DAYS.indexOf(weekday as DayKey);

  return {
    dayIndex: dayIndex >= 0 ? dayIndex : 0,
    minutes: hour * 60 + minute,
  };
}
