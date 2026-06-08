import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export class AdminAuthError extends Error {
  constructor() {
    super("Admin authentication required");
  }
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@pistahouse.com.au";

  if (session?.user?.email !== adminEmail) {
    throw new AdminAuthError();
  }
  return session;
}
