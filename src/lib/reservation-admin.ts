export type AdminBookingStatus = "REQUESTED" | "CONFIRMED" | "CANCELLED";

const bookingTransitions: Record<AdminBookingStatus, AdminBookingStatus[]> = {
  REQUESTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
};

export function getNextBookingStatuses(status: AdminBookingStatus) {
  return bookingTransitions[status] ?? [];
}

export function canTransitionBookingStatus(from: AdminBookingStatus, to: AdminBookingStatus) {
  return getNextBookingStatuses(from).includes(to);
}
