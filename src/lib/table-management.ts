export type ReservationTable = {
  id: string;
  name: string;
  capacity: number;
  active: boolean;
};

export type ReservationCapacityBooking = {
  date: string | Date;
  time: string;
  status: string;
  tableId?: string | null;
};

export function findAvailableTable({
  tables,
  bookings,
  date,
  time,
  partySize,
}: {
  tables: ReservationTable[];
  bookings: ReservationCapacityBooking[];
  date: string;
  time: string;
  partySize: number;
}) {
  const bookedTableIds = new Set(
    bookings
      .filter((booking) => isBlockingBooking(booking, date, time))
      .map((booking) => booking.tableId)
      .filter(Boolean),
  );

  return tables
    .filter((table) => table.active && table.capacity >= partySize && !bookedTableIds.has(table.id))
    .sort((a, b) => a.capacity - b.capacity || a.name.localeCompare(b.name))[0];
}

export function filterAvailableReservationSlots({
  slots,
  tables,
  bookings,
  date,
  partySize,
}: {
  slots: string[];
  tables: ReservationTable[];
  bookings: ReservationCapacityBooking[];
  date: string;
  partySize: number;
}) {
  const activeTables = tables.filter((table) => table.active);
  if (activeTables.length === 0) {
    return slots;
  }

  return slots.filter((time) => Boolean(findAvailableTable({ tables: activeTables, bookings, date, time, partySize })));
}

function isBlockingBooking(booking: ReservationCapacityBooking, date: string, time: string) {
  return normalizeDate(booking.date) === date && booking.time === time && booking.status !== "CANCELLED";
}

function normalizeDate(date: string | Date) {
  return date instanceof Date ? date.toISOString().slice(0, 10) : date.slice(0, 10);
}
