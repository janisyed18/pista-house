import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { sendGuestMessage } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const messageSchema = z.object({
  entityType: z.enum(["order", "reservation", "catering"]),
  entityId: z.string().min(1),
  to: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(3),
});

export async function POST(request: Request) {
  return withAdmin(async ({ adminEmail }) => {
    const body = messageSchema.parse(await request.json());
    const result = await sendGuestMessage({ to: body.to, subject: body.subject, message: body.message });

    await writeAdminAuditLog({
      adminEmail,
      action: "message",
      entityType: body.entityType,
      entityId: body.entityId,
      after: { to: body.to, subject: body.subject, skipped: "skipped" in result ? result.skipped : false },
      request,
    });

    return { ok: true, result };
  });
}
