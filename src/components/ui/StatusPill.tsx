import { Badge } from "./Badge";

// Case status as a dignified indicator: RESOLVED earns eucalyptus,
// ESCALATED speaks in the flag register, everything else stays quiet.
export function StatusPill({ status, label }: { status: string; label: string }) {
  const tone =
    status === "RESOLVED"
      ? "eucalyptus"
      : status === "ESCALATED"
        ? "flag"
        : status === "IN_PROGRESS"
          ? "gold"
          : "neutral";
  return <Badge tone={tone}>{label}</Badge>;
}
