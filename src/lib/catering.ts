import { z } from "zod";

export const cateringEventTypes = ["Wedding", "Birthday", "Corporate", "Family function", "Religious event", "Other"] as const;
export const cateringServiceStyles = ["Pickup", "Delivery", "Staffed service", "Not sure"] as const;
export const cateringMenuInterests = ["Biryani", "Curries", "Starters", "Naans", "Desserts", "Drinks", "Vegetarian menu", "Custom package"] as const;

export const publicCateringSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().optional().or(z.literal("")),
  eventDate: z.string().optional().or(z.literal("")),
  eventTime: z.string().trim().optional().or(z.literal("")),
  guestCount: z.coerce.number().int().positive().max(5000).nullable().optional(),
  eventType: z.enum(cateringEventTypes),
  serviceStyle: z.enum(cateringServiceStyles),
  suburb: z.string().trim().optional().or(z.literal("")),
  menuInterests: z.array(z.enum(cateringMenuInterests)).default([]),
  dietaryNeeds: z.string().trim().max(500).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(1600),
});

export type PublicCateringPayload = z.infer<typeof publicCateringSchema>;

export function toCateringCreateData(payload: PublicCateringPayload) {
  return {
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    eventDate: payload.eventDate ? new Date(`${payload.eventDate}T00:00:00`) : null,
    guestCount: payload.guestCount ?? null,
    message: formatCateringMessage(payload),
    notes: formatCateringAdminNotes(payload),
  };
}

export function formatCateringMessage(payload: PublicCateringPayload) {
  return [
    `Event type: ${payload.eventType}`,
    payload.eventDate ? `Event date: ${payload.eventDate}${payload.eventTime ? ` at ${payload.eventTime}` : ""}` : null,
    payload.guestCount ? `Guests: ${payload.guestCount}` : null,
    `Service style: ${payload.serviceStyle}`,
    payload.suburb ? `Suburb/venue: ${payload.suburb}` : null,
    payload.menuInterests.length ? `Menu interests: ${payload.menuInterests.join(", ")}` : null,
    payload.dietaryNeeds ? `Dietary needs: ${payload.dietaryNeeds}` : null,
    payload.budget ? `Budget: ${payload.budget}` : null,
    `Customer message: ${payload.message}`,
  ].filter(Boolean).join("\n");
}

export function formatCateringAdminNotes(payload: PublicCateringPayload) {
  return [
    "Public website catering request.",
    `Service style: ${payload.serviceStyle}.`,
    payload.suburb ? `Suburb/venue: ${payload.suburb}.` : null,
    payload.budget ? `Budget: ${payload.budget}.` : null,
  ].filter(Boolean).join(" ");
}
