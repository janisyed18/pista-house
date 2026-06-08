import { NextResponse } from "next/server";
import { z } from "zod";

import { sendContactAlert } from "@/lib/email";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(5),
});

export async function POST(request: Request) {
  const payload = schema.parse(await request.json());

  if (hasDatabase()) {
    await prisma.contactMessage.create({ data: payload });
    if (payload.subject.toLowerCase().includes("catering")) {
      await prisma.cateringEnquiry.create({
        data: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          message: payload.message,
        },
      });
    }
  }

  await sendContactAlert(payload);

  return NextResponse.json({ ok: true });
}
