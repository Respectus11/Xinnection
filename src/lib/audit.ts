import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export type AuditInput = {
  actorType: "ADMIN" | "PROFESSIONAL" | "SYSTEM";
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  // Non-sensitive metadata only (reasons, statuses, ids). NEVER message
  // content, codes, tokens, or identifying data.
  metadata?: Record<string, unknown>;
};

// Shared server-side audit utility — called by every admin mutation (and by
// significant professional actions). This is the single funnel; it is not
// bolted on per page.
export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLogEntry.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch (err) {
    // An audit failure must never break the mutation, but it must be loud.
    // Content-free log: no message data, no identifiers beyond the action.
    console.error("[audit] failed to write audit entry for action", input.action, err);
  }
}
