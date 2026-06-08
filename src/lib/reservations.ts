import type { DayKey, TradingHours } from "@/config/restaurant";
import { timeToMinutes } from "@/lib/hours";

const dayKeys: DayKey[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function generateReservationSlots(
  dateString: string,
  hours: Record<DayKey, TradingHours>,
) {
  const date = dateString ? new Date(`${dateString}T12:00:00`) : new Date();
  const day = dayKeys[date.getDay()];
  const dayHours = hours[day];
  const open = timeToMinutes(dayHours.open);
  const close = timeToMinutes(dayHours.close);
  const windows = [
    [12 * 60, 15 * 60],
    [17 * 60 + 30, 21 * 60 + 30],
  ];

  return windows.flatMap(([start, end]) => {
    const safeStart = Math.max(start, open);
    const safeEnd = Math.min(end, close);
    const slots: string[] = [];
    for (let minutes = safeStart; minutes <= safeEnd; minutes += 15) {
      slots.push(minutesToTime(minutes));
    }
    return slots;
  });
}

function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}
