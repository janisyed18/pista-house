import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { demoAdminCateringEnquiries, serializeAdminCateringEnquiry } from "@/lib/admin-catering";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cateringSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  eventDate: z.string().optional().or(z.literal("")),
  guestCount: z.number().int().positive().nullable().optional(),
  message: z.string().min(1),
  notes: z.string().optional().or(z.literal("")),
  quotedAmount: z.number().nonnegative().nullable().optional(),
  depositRequired: z.number().nonnegative().nullable().optional(),
  reminderAt: z.string().optional().or(z.literal("")),
});

export async function GET() {
  return withAdmin(async () => {
    if (!hasDatabase()) {
      return { enquiries: demoAdminCateringEnquiries(), demo: true };
    }

    const enquiries = await prisma.cateringEnquiry.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 200 });
    return { enquiries: enquiries.map(serializeAdminCateringEnquiry), demo: false };
  });
}

export async function POST(request: Request) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to save catering enquiries" }, { status: 503 });
    }

    const body = cateringSchema.parse(await request.json());
    const enquiry = await prisma.cateringEnquiry.create({ data: toCateringData(body) });
    await writeAdminAuditLog({ adminEmail, action: "create", entityType: "catering", entityId: enquiry.id, after: enquiry, request });
    return { enquiry: serializeAdminCateringEnquiry(enquiry) };
  });
}

function toCateringData(body: z.infer<typeof cateringSchema>) {
  return {
    name: body.name,
    email: body.email,
    phone: body.phone || null,
    eventDate: body.eventDate ? new Date(`${body.eventDate}T00:00:00`) : null,
    guestCount: body.guestCount ?? null,
    message: body.message,
    notes: body.notes || null,
    quotedAmountCents: body.quotedAmount ? Math.round(body.quotedAmount * 100) : null,
    depositRequiredCents: body.depositRequired ? Math.round(body.depositRequired * 100) : null,
    reminderAt: body.reminderAt ? new Date(body.reminderAt) : null,
  };
}
