-- CreateIndex
CREATE INDEX "AnalyticsEvent_resourceId_type_timestamp_deletedAt_idx" ON "AnalyticsEvent"("resourceId", "type", "timestamp", "deletedAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_timestamp_deletedAt_idx" ON "AnalyticsEvent"("timestamp", "deletedAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_ip_timestamp_deletedAt_idx" ON "AnalyticsEvent"("ip", "timestamp", "deletedAt");
