import React from "react";
import { TriageQueueTable } from "@/components/dash/TriageQueueTable";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function ProfessionalDashboardPage() {
  const session = await getSession();
  
  // Include category to show category names
  const threads = await prisma.thread.findMany({
    where: { status: { in: ["OPEN", "IN_PROGRESS", "ESCALATED"] } },
    orderBy: { createdAt: "desc" },
    include: { category: true },
    take: 50,
  });

  const metrics = {
    unclaimed: threads.filter((t) => t.status === "OPEN").length,
    escalations: threads.filter((t) => t.status === "ESCALATED").length,
    myChats: threads.filter((t) => t.status === "IN_PROGRESS" && t.claimedById === session?.sub).length,
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-canvas-deep">
      {/* Top Utility Bar */}
      <header className="flex justify-between items-center w-full px-6 h-16 shrink-0 bg-elevated-onyx border-b border-white/10 z-10">
        <h1 className="text-lg font-bold text-starlight-white">Triage Queue</h1>
      </header>

      {/* Body Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
        {/* Real Metrics Ribbon */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-elevated-onyx p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-silver block">Waiting (Unclaimed)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl text-starlight-white font-bold">{metrics.unclaimed}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-muted-silver">
              <span className="material-symbols-outlined">inbox</span>
            </div>
          </div>
          
          <div className="bg-elevated-onyx p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-silver block">My Active Cases</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl text-starlight-white font-bold">{metrics.myChats}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">forum</span>
            </div>
          </div>

          <div className="bg-elevated-onyx p-4 rounded-xl border border-rose/30 flex items-center justify-between">
            <div>
              <span className="text-sm text-rose font-medium block">Escalated / Critical</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl text-starlight-white font-bold">{metrics.escalations}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center text-rose">
              <span className="material-symbols-outlined">warning</span>
            </div>
          </div>
        </section>

        <TriageQueueTable threads={threads} currentUserId={session?.sub || ""} />
      </div>
    </div>
  );
}
