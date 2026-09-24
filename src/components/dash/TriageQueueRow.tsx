"use client";
import React from "react";
import { Thread, ThreadStatus } from "@prisma/client";

export interface TriageQueueRowProps {
  thread: Thread;
}

export function TriageQueueRow({ thread }: Readonly<TriageQueueRowProps>) {
  // Map thread status to a visual risk tier for the triage queue UI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const riskStyles: Record<string, any> = {
    ESCALATED: {
      bgRow: "bg-rose-bg/10 hover:bg-rose-bg/20",
      dot: "bg-vibrant-coral animate-ping",
      status: "text-rose-text",
      tierLabel: "Tier 1 Crisis / Escalated",
      tierBadge: "bg-rose-bg text-rose-text border-rose-bg",
      time: "text-rose-text bg-rose-bg",
      isHigh: true,
      action: <button className="px-3.5 py-1.5 rounded-full bg-vibrant-coral hover:bg-primary text-pure-surface text-label-md font-label-md font-semibold shadow-sm transition-all active:scale-95">Claim &amp; Intervene</button>
    },
    IN_PROGRESS: {
      bgRow: "hover:bg-peach-bg/20 transition-colors",
      dot: "bg-peach-text",
      status: "text-warm-slate",
      tierLabel: "Tier 2 In Progress",
      tierBadge: "bg-peach-bg text-peach-text border-peach-bg",
      time: "text-deep-midnight bg-transparent",
      isHigh: false,
      action: <button className="px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-deep-midnight text-label-md font-label-md font-medium transition-colors">Monitor</button>
    },
    OPEN: {
      bgRow: "hover:bg-surface-container-low transition-colors",
      dot: "bg-azure-blue",
      status: "text-warm-slate",
      tierLabel: "Tier 3 Open",
      tierBadge: "bg-secondary-fixed text-azure-blue border-transparent",
      time: "text-warm-slate bg-transparent",
      isHigh: false,
      action: <button className="px-3 py-1 rounded-full text-warm-slate hover:text-deep-midnight hover:bg-surface-container-high text-label-md font-label-md font-medium transition-colors">Claim</button>
    },
    RESOLVED: {
      bgRow: "opacity-60 hover:bg-surface-container-low transition-colors",
      dot: "bg-mint-text",
      status: "text-warm-slate",
      tierLabel: "Resolved",
      tierBadge: "bg-surface-container-low text-warm-slate border-transparent",
      time: "text-warm-slate bg-transparent",
      isHigh: false,
      action: <button className="px-3 py-1 rounded-full text-warm-slate hover:bg-surface-container-high text-label-md font-label-md font-medium transition-colors">View Notes</button>
    },
  };

  const style = riskStyles[thread.status as ThreadStatus] || riskStyles.OPEN;

  return (
    <tr className={`${style.bgRow}`}>
      <td className="py-3.5 px-space-md">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
          <span className="font-mono-data text-mono-data font-bold text-deep-midnight">{thread.id.split("-")[0].toUpperCase()}</span>
        </div>
        <span className={`text-mono-data font-mono-data font-medium block mt-0.5 ml-4 ${style.status}`}>
          {thread.claimedById ? "Assigned" : "Unassigned"}
        </span>
      </td>
      <td className="py-3.5 px-space-md">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.tierBadge}`}>
          {style.isHigh && <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>}
          {style.tierLabel}
        </span>
      </td>
      <td className="py-3.5 px-space-md">
        <div className="flex flex-wrap gap-1">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-lavender-bg text-lavender-text">{thread.categoryId}</span>
        </div>
      </td>
      <td className="py-3.5 px-space-md">
        <p className="text-deep-midnight font-medium line-clamp-2 leading-relaxed font-mono-data">
          Thread {thread.id.slice(0, 8)}…
        </p>
      </td>
      <td className="py-3.5 px-space-md whitespace-nowrap">
        <span className={`font-mono-data text-mono-data font-bold px-2 py-0.5 rounded ${style.time}`}>
          {new Date(thread.createdAt).toLocaleDateString()}
        </span>
      </td>
      <td className="py-3.5 px-space-md whitespace-nowrap">
        {!thread.claimedById ? (
          <span className="text-mono-data font-mono-data text-warm-slate italic">Unassigned</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-secondary-fixed text-azure-blue flex items-center justify-center font-bold text-[10px]">P</span>
            <span className="text-body-sm font-body-sm text-deep-midnight">Assigned</span>
          </div>
        )}
      </td>
      <td className="py-3.5 px-space-md text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          {style.action}
          <button className="p-1 rounded-full text-warm-slate hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
