-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "resourceId" TEXT,
    "category" TEXT,
    "url" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "timestamp" INTEGER NOT NULL,
    "properties" TEXT
);
INSERT INTO "new_AnalyticsEvent" ("category", "id", "ip", "properties", "resourceId", "timestamp", "type", "url", "userAgent") SELECT "category", "id", "ip", "properties", "resourceId", "timestamp", "type", "url", "userAgent" FROM "AnalyticsEvent";
DROP TABLE "AnalyticsEvent";
ALTER TABLE "new_AnalyticsEvent" RENAME TO "AnalyticsEvent";
CREATE INDEX "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");
CREATE INDEX "AnalyticsEvent_resourceId_idx" ON "AnalyticsEvent"("resourceId");
CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");
CREATE INDEX "AnalyticsEvent_ip_idx" ON "AnalyticsEvent"("ip");
CREATE INDEX "AnalyticsEvent_timestamp_type_idx" ON "AnalyticsEvent"("timestamp", "type");
CREATE INDEX "AnalyticsEvent_timestamp_resourceId_idx" ON "AnalyticsEvent"("timestamp", "resourceId");
CREATE INDEX "AnalyticsEvent_resourceId_type_idx" ON "AnalyticsEvent"("resourceId", "type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
