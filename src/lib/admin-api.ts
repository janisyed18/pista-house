import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";

export async function withAdmin<T>(handler: (context: { adminEmail: string }) => Promise<T>) {
  try {
    const session = await requireAdmin();
    const result = await handler({ adminEmail: session.user?.email ?? "admin" });
    return result instanceof Response ? result : NextResponse.json(result);
  } catch (error) {
    return adminApiError(error);
  }
}

export function adminApiError(error: unknown) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
  }

  console.error(error);
  return NextResponse.json({ error: "Admin request failed" }, { status: 500 });
}
