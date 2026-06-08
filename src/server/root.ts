import { z } from "zod";

import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { getRestaurantStatus } from "@/lib/hours";
import { getMergedMenu } from "@/lib/menu";
import { router, publicProcedure } from "@/server/trpc";

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  restaurant: publicProcedure.query(() => RESTAURANT_CONFIG),
  menu: publicProcedure.query(() => getMergedMenu()),
  status: publicProcedure
    .input(z.object({ isoDate: z.string().optional() }).optional())
    .query(({ input }) => getRestaurantStatus(RESTAURANT_CONFIG.hours, input?.isoDate ? new Date(input.isoDate) : new Date())),
});

export type AppRouter = typeof appRouter;
