-- Add soft-delete column to AnalyticsEvent
ALTER TABLE "AnalyticsEvent" ADD COLUMN "deletedAt" INTEGER;

-- Create index for filtering soft-deleted records
CREATE INDEX "AnalyticsEvent_deletedAt_idx" ON "AnalyticsEvent"("deletedAt");
