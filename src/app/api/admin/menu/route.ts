import { withAdmin } from "@/lib/admin-api";
import { getMergedMenu } from "@/lib/menu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withAdmin(async () => {
    const categories = await getMergedMenu({ includeHidden: true });
    return { categories };
  });
}
