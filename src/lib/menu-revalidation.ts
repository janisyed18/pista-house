import { revalidatePath } from "next/cache";

export function revalidateMenuSurfaces() {
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/order");
}
