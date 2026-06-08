import { withAdmin } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxImageBytes = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  return withAdmin(async () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return Response.json(
        { error: "Cloudinary upload requires CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET" },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!allowedTypes.has(file.type)) {
      return Response.json({ error: "Only JPG, PNG and WebP images are supported" }, { status: 400 });
    }

    if (file.size > maxImageBytes) {
      return Response.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
    }

    const upload = new FormData();
    upload.set("file", file);
    upload.set("upload_preset", uploadPreset);
    upload.set("folder", process.env.CLOUDINARY_MENU_FOLDER ?? "pista-house/menu");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: upload,
    });

    if (!response.ok) {
      const detail = await response.text();
      return Response.json({ error: "Cloudinary upload failed", detail }, { status: 502 });
    }

    const data = (await response.json()) as { secure_url?: string; public_id?: string };
    if (!data.secure_url) {
      return Response.json({ error: "Cloudinary did not return an image URL" }, { status: 502 });
    }

    return { imageUrl: data.secure_url, publicId: data.public_id ?? null };
  });
}
