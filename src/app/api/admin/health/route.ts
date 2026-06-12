import { withAdmin } from "@/lib/admin-api";
import { hasDatabase } from "@/lib/prisma";
import { getSmsConfig } from "@/lib/sms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withAdmin(async () => ({
    services: {
      database: hasDatabase(),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
      stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      cloudinaryUpload: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET),
      resendEmail: Boolean(process.env.RESEND_API_KEY),
      twilioSms: getSmsConfig().enabled,
      adminPasswordHash: Boolean(process.env.ADMIN_PASSWORD_HASH),
    },
  }));
}
