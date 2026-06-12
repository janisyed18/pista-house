import { z } from "zod";

import { withAdmin } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import {
  buildOrderingPauseState,
  getPersistedOrderingPauseStatus,
  saveOrderingPauseState,
  serializeOrderingPauseStatus,
} from "@/lib/ordering-pause";
import { hasDatabase } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pauseSchema = z.object({
  action: z.enum(["on", "pause_20", "pause_40", "pause_tomorrow", "pause_indefinite"]),
  message: z.string().max(180).optional().default(""),
});

export async function GET() {
  return withAdmin(async () => ({
    status: serializeOrderingPauseStatus(await getPersistedOrderingPauseStatus()),
    demo: !hasDatabase(),
  }));
}

export async function PATCH(request: Request) {
  return withAdmin(async ({ adminEmail }) => {
    if (!hasDatabase()) {
      return Response.json({ error: "Database is required to pause online ordering" }, { status: 503 });
    }

    const before = await getPersistedOrderingPauseStatus();
    const body = pauseSchema.parse(await request.json());
    const state = buildOrderingPauseState(body.action, body.message);
    await saveOrderingPauseState(state);
    const after = await getPersistedOrderingPauseStatus();

    await writeAdminAuditLog({
      adminEmail,
      action: state.enabled ? "pause_ordering" : "resume_ordering",
      entityType: "config",
      entityId: "ordering_pause",
      before,
      after,
      request,
    });

    return { status: serializeOrderingPauseStatus(after) };
  });
}
