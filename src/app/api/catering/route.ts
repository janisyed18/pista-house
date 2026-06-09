import { NextResponse } from "next/server";

import { publicCateringSchema, toCateringCreateData } from "@/lib/catering";
import { sendCateringAlert } from "@/lib/email";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = publicCateringSchema.parse(await request.json());
  const data = toCateringCreateData(payload);

  if (!hasDatabase()) {
    await sendCateringAlert({ ...data, id: "CAT-DEMO" });
    return NextResponse.json({
      enquiry: {
        id: "CAT-DEMO",
        ...data,
        eventDate: data.eventDate?.toISOString() ?? null,
      },
      demo: true,
    });
  }

  const enquiry = await prisma.cateringEnquiry.create({ data });
  await sendCateringAlert({ ...data, id: enquiry.id });

  return NextResponse.json({
    enquiry: {
      id: enquiry.id,
      eventDate: enquiry.eventDate?.toISOString() ?? null,
      status: enquiry.status,
    },
    demo: false,
  });
}
