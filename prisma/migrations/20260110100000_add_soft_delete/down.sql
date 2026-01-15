-- Drop index for filtering soft-deleted records
DROP INDEX IF EXISTS "AnalyticsEvent_deletedAt_idx";

-- Remove soft-delete column from AnalyticsEvent
ALTER TABLE "AnalyticsEvent" DROP COLUMN "deletedAt";
