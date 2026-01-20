-- Drop indexes in reverse order
DROP INDEX IF EXISTS "IdempotencyKey_deletedAt_idx";
DROP INDEX IF EXISTS "IdempotencyKey_expiresAt_idx";
DROP INDEX IF EXISTS "IdempotencyKey_createdAt_idx";
DROP INDEX IF EXISTS "IdempotencyKey_webhookId_idx";
DROP INDEX IF EXISTS "IdempotencyKey_key_idx";
DROP INDEX IF EXISTS "IdempotencyKey_key_key";

DROP INDEX IF EXISTS "ApiKey_deletedAt_idx";
DROP INDEX IF EXISTS "ApiKey_expiresAt_idx";
DROP INDEX IF EXISTS "ApiKey_active_idx";
DROP INDEX IF EXISTS "ApiKey_userId_idx";
DROP INDEX IF EXISTS "ApiKey_key_idx";
DROP INDEX IF EXISTS "ApiKey_key_key";

DROP INDEX IF EXISTS "DeadLetterWebhook_deletedAt_idx";
DROP INDEX IF EXISTS "DeadLetterWebhook_webhookId_idx";
DROP INDEX IF EXISTS "DeadLetterWebhook_createdAt_idx";

DROP INDEX IF EXISTS "WebhookQueue_deletedAt_idx";
DROP INDEX IF EXISTS "WebhookQueue_webhookId_idx";
DROP INDEX IF EXISTS "WebhookQueue_priority_scheduledFor_idx";
DROP INDEX IF EXISTS "WebhookQueue_scheduledFor_idx";

DROP INDEX IF EXISTS "WebhookDelivery_deletedAt_idx";
DROP INDEX IF EXISTS "WebhookDelivery_webhookId_status_idx";
DROP INDEX IF EXISTS "WebhookDelivery_createdAt_idx";
DROP INDEX IF EXISTS "WebhookDelivery_status_idx";
DROP INDEX IF EXISTS "WebhookDelivery_idempotencyKey_idx";
DROP INDEX IF EXISTS "WebhookDelivery_webhookId_idx";

DROP INDEX IF EXISTS "Webhook_url_idx";
DROP INDEX IF EXISTS "Webhook_deletedAt_idx";
DROP INDEX IF EXISTS "Webhook_active_idx";

-- Drop tables
DROP TABLE IF EXISTS "IdempotencyKey";
DROP TABLE IF EXISTS "ApiKey";
DROP TABLE IF EXISTS "DeadLetterWebhook";
DROP TABLE IF EXISTS "WebhookQueue";
DROP TABLE IF EXISTS "WebhookDelivery";
DROP TABLE IF EXISTS "Webhook";
