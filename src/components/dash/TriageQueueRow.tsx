"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Thread, ThreadStatus, Category } from "@prisma/client";

export interface TriageQueueRowProps {
  thread: Thread & { category?: Category | null };
  currentUserId: string;
}

export function TriageQueueRow({ thread, currentUserId }: Readonly<TriageQueueRowProps>) {
  const router = useRouter();

  const handleOpenCase = () => {
    router.push(`/professional/case/${thread.id}`);
  };

  const isMine = thread.claimedById === currentUserId;

  const riskStyles: Record<string, { bgRow: string; dot: string; statusLabel: string; statusPill: string; actionBtn: React.ReactNode }> = {
    ESCALATED: {
      bgRow: "bg-rose/5 hover:bg-rose/10",
      dot: "bg-rose animate-ping",
      statusLabel: "Escalated",
      statusPill: "bg-rose/20 text-rose border-rose/30",
      actionBtn: (
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenCase(); }}
          className="px-3.5 py-1.5 rounded-full bg-rose hover:bg-rose/80 text-starlight-white text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          type="button"
        >
          {isMine ? "Continue" : "Claim"}
        </button>
      ),
    },
    IN_PROGRESS: {
      bgRow: "hover:bg-surface-container/30 transition-colors",
      dot: "bg-secondary",
      statusLabel: "In Progress",
      statusPill: "bg-secondary/20 text-secondary border-secondary/30",
      actionBtn: (
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenCase(); }}
          className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-starlight-white text-sm font-medium transition-colors cursor-pointer"
          type="button"
        >
          {isMine ? "Open" : "View"}
        </button>
      ),
    },
    OPEN: {
      bgRow: "hover:bg-surface-container/30 transition-colors",
      dot: "bg-mint",
      statusLabel: "Open",
      statusPill: "bg-mint/20 text-mint border-mint/30",
      actionBtn: (
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenCase(); }}
          className="px-3 py-1 rounded-full text-muted-silver border border-white/10 hover:text-starlight-white hover:bg-surface-container-high text-sm font-medium transition-colors cursor-pointer"
          type="button"
        >
          Claim
        </button>
      ),
    },
  };

  const style = riskStyles[thread.status as ThreadStatus] || riskStyles.OPEN;

  return (
    <tr 
      onClick={handleOpenCase}
      className={`${style.bgRow} cursor-pointer transition-colors`}
    >
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
          <span className="font-mono-data font-bold text-starlight-white">
            {thread.id.split("-")[0].toUpperCase()}
          </span>
        </div>
      </td>
      <td className="py-3.5 px-5">
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container text-starlight-white border border-white/10 uppercase">
          {thread.category?.slug || "GENERAL"}
        </span>
      </td>
      <td className="py-3.5 px-5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.statusPill}`}>
          {style.statusLabel}
        </span>
      </td>
      <td className="py-3.5 px-5 whitespace-nowrap text-muted-silver">
        {new Date(thread.createdAt).toLocaleDateString()} {new Date(thread.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </td>
      <td className="py-3.5 px-5 whitespace-nowrap">
        {!thread.claimedById ? (
          <span className="text-muted-silver italic">Unassigned</span>
        ) : isMine ? (
          <span className="text-starlight-white font-medium">Me</span>
        ) : (
          <span className="text-starlight-white">Assigned</span>
        )}
      </td>
      <td className="py-3.5 px-5 text-right whitespace-nowrap">
        {style.actionBtn}
      </td>
    </tr>
  );
}
