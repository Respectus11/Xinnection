"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Thread, ThreadStatus } from "@prisma/client";

export interface TriageQueueRowProps {
  thread: Thread;
}

export function TriageQueueRow({ thread }: Readonly<TriageQueueRowProps>) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleOpenCase = () => {
    router.push(`/professional/case/${thread.id}`);
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(thread.id);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
    setIsMenuOpen(false);
  };

  // Map thread status to a visual risk tier for the triage queue UI
  const riskStyles: Record<string, any> = {
    ESCALATED: {
      bgRow: "bg-rose-bg/10 hover:bg-rose-bg/20",
      dot: "bg-vibrant-coral animate-ping",
      status: "text-rose-text",
      tierLabel: "Tier 1 Crisis / Escalated",
      tierBadge: "bg-rose-bg text-rose-text border-rose-bg",
      time: "text-rose-text bg-rose-bg",
      isHigh: true,
      actionBtn: (
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenCase(); }}
          className="px-3.5 py-1.5 rounded-full bg-vibrant-coral hover:bg-primary text-pure-surface text-label-md font-label-md font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          type="button"
        >
          Claim & Intervene
        </button>
      ),
    },
    IN_PROGRESS: {
      bgRow: "hover:bg-peach-bg/20 transition-colors",
      dot: "bg-peach-text",
      status: "text-warm-slate",
      tierLabel: "Tier 2 In Progress",
      tierBadge: "bg-peach-bg text-peach-text border-peach-bg",
      time: "text-deep-midnight bg-transparent",
      isHigh: false,
      actionBtn: (
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenCase(); }}
          className="px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-deep-midnight text-label-md font-label-md font-medium transition-colors cursor-pointer"
          type="button"
        >
          Monitor
        </button>
      ),
    },
    OPEN: {
      bgRow: "hover:bg-surface-container-low transition-colors",
      dot: "bg-azure-blue",
      status: "text-warm-slate",
      tierLabel: "Tier 3 Open",
      tierBadge: "bg-secondary-fixed/30 text-azure-blue border-transparent",
      time: "text-warm-slate bg-transparent",
      isHigh: false,
      actionBtn: (
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenCase(); }}
          className="px-3 py-1 rounded-full text-warm-slate hover:text-deep-midnight hover:bg-surface-container-high text-label-md font-label-md font-medium transition-colors cursor-pointer"
          type="button"
        >
          Claim
        </button>
      ),
    },
    RESOLVED: {
      bgRow: "opacity-60 hover:bg-surface-container-low transition-colors",
      dot: "bg-mint-text",
      status: "text-warm-slate",
      tierLabel: "Resolved",
      tierBadge: "bg-surface-container-low text-warm-slate border-transparent",
      time: "text-warm-slate bg-transparent",
      isHigh: false,
      actionBtn: (
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenCase(); }}
          className="px-3 py-1 rounded-full text-warm-slate hover:bg-surface-container-high text-label-md font-label-md font-medium transition-colors cursor-pointer"
          type="button"
        >
          View Notes
        </button>
      ),
    },
  };

  const style = riskStyles[thread.status as ThreadStatus] || riskStyles.OPEN;

  return (
    <tr 
      onClick={handleOpenCase}
      className={`${style.bgRow} cursor-pointer transition-colors relative`}
    >
      <td className="py-3.5 px-space-md">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
          <span className="font-mono-data text-mono-data font-bold text-deep-midnight">
            {thread.id.split("-")[0].toUpperCase()}
          </span>
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
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-lavender-bg text-lavender-text">
            {thread.categoryId || "general"}
          </span>
        </div>
      </td>
      <td className="py-3.5 px-space-md">
        <p className="text-deep-midnight font-medium line-clamp-2 leading-relaxed font-mono-data max-w-xs truncate">
          Thread #{thread.id.slice(0, 8)}…
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
        <div className="flex items-center justify-end gap-1.5 relative">
          {style.actionBtn}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen((prev) => !prev); }}
              className="p-1.5 rounded-full text-warm-slate hover:bg-surface-container-high transition-colors cursor-pointer"
              title="More actions"
              type="button"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {isMenuOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-pure-surface border border-surface-container-high shadow-xl py-1 text-left text-xs font-label"
              >
                <button 
                  onClick={handleOpenCase}
                  className="w-full px-3 py-2 text-deep-midnight hover:bg-surface-container-low flex items-center gap-2"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>Open Triage Cockpit</span>
                </button>
                <button 
                  onClick={handleCopyId}
                  className="w-full px-3 py-2 text-deep-midnight hover:bg-surface-container-low flex items-center gap-2"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  <span>{copyFeedback ? "Copied ID!" : "Copy Thread ID"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
