import type { CateringEnquiry } from "@prisma/client";

import { formatCents } from "@/lib/order";

export type AdminCateringEnquiry = ReturnType<typeof serializeAdminCateringEnquiry>;

export function serializeAdminCateringEnquiry(enquiry: CateringEnquiry) {
  return {
    id: enquiry.id,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    eventDate: enquiry.eventDate?.toISOString().slice(0, 10) ?? null,
    guestCount: enquiry.guestCount,
    status: enquiry.status,
    message: enquiry.message,
    notes: enquiry.notes,
    quotedAmountCents: enquiry.quotedAmountCents,
    displayQuote: enquiry.quotedAmountCents ? formatCents(enquiry.quotedAmountCents) : null,
    depositRequiredCents: enquiry.depositRequiredCents,
    displayDeposit: enquiry.depositRequiredCents ? formatCents(enquiry.depositRequiredCents) : null,
    depositPaidAt: enquiry.depositPaidAt?.toISOString() ?? null,
    reminderAt: enquiry.reminderAt?.toISOString() ?? null,
    createdAt: enquiry.createdAt.toISOString(),
    updatedAt: enquiry.updatedAt.toISOString(),
  };
}

export function demoAdminCateringEnquiries() {
  const now = new Date().toISOString();
  return [
    {
      id: "CAT-DEMO-501",
      name: "Ayesha Khan",
      email: "catering@example.com",
      phone: "+61 400 111 222",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      guestCount: 45,
      status: "QUOTE_REQUESTED" as const,
      message: "Family event catering for biryani, starters and desserts.",
      notes: "Call after 4pm. Ask about vegetarian count.",
      quotedAmountCents: null,
      displayQuote: null,
      depositRequiredCents: null,
      displayDeposit: null,
      depositPaidAt: null,
      reminderAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
