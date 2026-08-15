import { db } from "./db";

export function audit(userId: string, action: string, entityType: string, entityId?: string, metadata?: unknown) {
  return db.auditEvent.create({ data: { userId, action, entityType, entityId, metadata: metadata ? JSON.stringify(metadata) : undefined } });
}
