import { Resend } from "resend";

import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { formatCartLineCustomization, type CartLine } from "@/lib/order";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM_EMAIL ?? "Pista House <orders@pistahouse.com.au>";

export async function sendOrderConfirmation({
  to,
  orderId,
  lines,
}: {
  to?: string;
  orderId: string;
  lines: CartLine[];
}) {
  if (!resend || !to) {
    return { skipped: true };
  }

  return resend.emails.send({
    from,
    to,
    subject: `Pista House order ${orderId}`,
    html: `<h1>Order received</h1><p>Your Pista House pickup order is being prepared.</p>${renderLines(lines)}`,
  });
}

export async function sendReservationEmails(payload: {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  partySize: number;
}) {
  if (!resend) {
    return { skipped: true };
  }

  await resend.emails.send({
    from,
    to: payload.email,
    subject: "Pista House reservation request",
    html: `<h1>Reservation requested</h1><p>${payload.name}, your table for ${payload.partySize} on ${payload.date} at ${payload.time} has been received.</p><p>Reference: ${payload.id}</p>`,
  });

  return resend.emails.send({
    from,
    to: RESTAURANT_CONFIG.email,
    subject: `New reservation: ${payload.name}`,
    html: `<h1>New booking</h1><p>${payload.name} requested ${payload.partySize} seats on ${payload.date} at ${payload.time}.</p>`,
  });
}

export async function sendReservationStatusEmail(payload: {
  to: string;
  id: string;
  name: string;
  date: string;
  time: string;
  partySize: number;
  status: "CONFIRMED" | "CANCELLED";
}) {
  if (!resend) {
    return { skipped: true };
  }

  const confirmed = payload.status === "CONFIRMED";

  return resend.emails.send({
    from,
    to: payload.to,
    subject: confirmed ? "Pista House reservation confirmed" : "Pista House reservation update",
    html: `<h1>${confirmed ? "Reservation confirmed" : "Reservation cancelled"}</h1><p>${payload.name}, your table for ${payload.partySize} on ${payload.date} at ${payload.time} is ${payload.status.toLowerCase()}.</p><p>Reference: ${payload.id}</p>`,
  });
}

export async function sendContactAlert(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!resend) {
    return { skipped: true };
  }

  return resend.emails.send({
    from,
    to: RESTAURANT_CONFIG.email,
    replyTo: payload.email,
    subject: `Website enquiry: ${payload.subject}`,
    html: `<h1>${payload.subject}</h1><p><strong>${payload.name}</strong> (${payload.email})</p><p>${payload.message}</p>`,
  });
}

export async function sendCateringAlert(payload: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  eventDate?: Date | null;
  guestCount?: number | null;
  message: string;
  notes?: string | null;
}) {
  if (!resend) {
    return { skipped: true };
  }

  return resend.emails.send({
    from,
    to: RESTAURANT_CONFIG.email,
    replyTo: payload.email,
    subject: `Catering request: ${payload.name}`,
    html: `<h1>New catering request</h1><p><strong>Reference:</strong> ${escapeHtml(payload.id)}</p><p><strong>${escapeHtml(payload.name)}</strong> (${escapeHtml(payload.email)})</p><p><strong>Phone:</strong> ${escapeHtml(payload.phone ?? "Not provided")}</p><p><strong>Date:</strong> ${escapeHtml(payload.eventDate?.toISOString().slice(0, 10) ?? "Not provided")}</p><p><strong>Guests:</strong> ${escapeHtml(payload.guestCount?.toString() ?? "Not provided")}</p><pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(payload.message)}</pre>${payload.notes ? `<p><strong>Admin notes:</strong> ${escapeHtml(payload.notes)}</p>` : ""}`,
  });
}

export async function sendGuestMessage(payload: {
  to?: string | null;
  subject: string;
  message: string;
}) {
  if (!resend || !payload.to) {
    return { skipped: true };
  }

  return resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: `<p>${escapeHtml(payload.message).replace(/\n/g, "<br>")}</p>`,
  });
}

function renderLines(lines: CartLine[]) {
  return `<ul>${lines.map((line) => {
    const customization = formatCartLineCustomization(line);
    return `<li>${line.quantity} x ${line.name}${customization ? `<br><small>${escapeHtml(customization)}</small>` : ""}</li>`;
  }).join("")}</ul>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
