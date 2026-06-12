ALTER TABLE "MenuItemOverride" ADD COLUMN "available" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CustomMenuItem" ADD COLUMN "available" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "CustomMenuItem_available_idx" ON "CustomMenuItem"("available");
