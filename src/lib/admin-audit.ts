import { hasDatabase, prisma } from "@/lib/prisma";

export type AuditLogInput = {
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  request?: Request;
};

export async function writeAdminAuditLog({ adminEmail, action, entityType, entityId, before, after, request }: AuditLogInput) {
  if (!hasDatabase()) {
    return;
  }

  await prisma.adminAuditLog.create({
    data: {
      adminEmail,
      action,
      entityType,
      entityId,
      before: before === undefined ? undefined : JSON.parse(JSON.stringify(before)),
      after: after === undefined ? undefined : JSON.parse(JSON.stringify(after)),
      ipAddress: request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request?.headers.get("user-agent"),
    },
  });
}
