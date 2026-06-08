import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { serializeAdminCateringEnquiry } from "@/lib/admin-catering";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cateringUpdateSchema = z.object({
  status: z.enum(["QUOTE_REQUESTED", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional().or(z.literal("")),
  quotedAmount: z.number().nonnegative().nullable().optional(),
  depositRequired: z.number().nonnegative().nullable().optional(),
  depositPaid: z.boolean().default(false),
  reminderAt: z.string().optional().or(z.literal("")),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to update catering enquiries" }, { status: 503 });
    }

    const body = cateringUpdateSchema.parse(await request.json());
    const before = await prisma.cateringEnquiry.findUnique({ where: { id: params.id } });
    if (!before) {
      return Response.json({ error: "Catering enquiry not found" }, { status: 404 });
    }

    const enquiry = await prisma.cateringEnquiry.update({
      where: { id: params.id },
      data: {
        status: body.status,
        notes: body.notes || null,
        quotedAmountCents: body.quotedAmount ? Math.round(body.quotedAmount * 100) : null,
        depositRequiredCents: body.depositRequired ? Math.round(body.depositRequired * 100) : null,
        depositPaidAt: body.depositPaid ? (before.depositPaidAt ?? new Date()) : null,
        reminderAt: body.reminderAt ? new Date(body.reminderAt) : null,
      },
    });

    await writeAdminAuditLog({ adminEmail, action: "update", entityType: "catering", entityId: enquiry.id, before, after: enquiry, request });
    return { enquiry: serializeAdminCateringEnquiry(enquiry) };
  });
}
