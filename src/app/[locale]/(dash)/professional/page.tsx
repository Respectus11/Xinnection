import React from "react";
import { DashboardSidebar } from "@/components/dash/DashboardSidebar";
import { LiveMetricsRibbon } from "@/components/dash/LiveMetricsRibbon";
import { TriageQueueTable } from "@/components/dash/TriageQueueTable";
import { prisma } from "@/lib/db";

export default async function ProfessionalDashboardPage() {
  const threads = await prisma.thread.findMany({
    where: { status: { in: ["OPEN", "IN_PROGRESS", "ESCALATED"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const metrics = {
    totalQueue: threads.length,
    escalations: threads.filter((t) => t.status === "ESCALATED").length,
    activeChats: threads.filter((t) => t.status === "IN_PROGRESS").length,
    handoffLog: threads.filter((t) => t.status === "RESOLVED").length,
  };
  return (
    <div className="bg-canvas-sunrise text-deep-midnight font-body-md antialiased h-screen overflow-hidden flex">
      {/* Left Navigation Sidebar */}
      <DashboardSidebar metrics={metrics} />

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-canvas-sunrise">
        
        {/* Top Utility Bar */}
        <header className="flex justify-between items-center w-full px-space-lg h-16 shrink-0 bg-pure-surface shadow-sm z-10">
          {/* Search and view badge */}
          <div className="flex items-center gap-space-md flex-1 max-w-xl">
            <div className="relative w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-slate">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
              </span>
              <input 
                className="w-full pl-9 pr-4 py-2 rounded-full bg-surface-container-low border-0 text-body-sm font-body-sm text-deep-midnight placeholder-warm-slate focus:ring-2 focus:ring-azure-blue transition-all outline-none" 
                placeholder="Search Thread ID, keywords, seeker..." 
                type="text"
              />
            </div>
            
            {/* Quick Emergency Broadcast Warning Status / Action */}
            <button className="inline-flex items-center gap-2 px-space-md py-1.5 rounded-full bg-rose-bg text-rose-text border border-rose-bg hover:bg-rose-text hover:text-pure-surface text-label-md font-label-md font-semibold transition-all active:scale-95 shadow-sm">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              <span>Emergency Broadcast</span>
            </button>
          </div>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-space-sm">
            <button className="inline-flex items-center gap-2 px-space-md py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high text-deep-midnight text-label-md font-label-md font-medium transition-colors cursor-pointer active:scale-95">
              <span className="material-symbols-outlined text-base">drive_file_move</span>
              <span>Batch Assign</span>
            </button>
            
            <div className="h-6 w-px bg-surface-container-high mx-1"></div>
            
            <button className="p-2 rounded-full text-warm-slate hover:bg-surface-container-low hover:text-deep-midnight transition-colors relative" title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-vibrant-coral ring-2 ring-pure-surface"></span>
            </button>
            <button className="p-2 rounded-full text-warm-slate hover:bg-surface-container-low hover:text-deep-midnight transition-colors" title="Filter Presets">
              <span className="material-symbols-outlined">tune</span>
            </button>
            <button className="p-2 rounded-full text-warm-slate hover:bg-surface-container-low hover:text-deep-midnight transition-colors" title="Clinical Protocol Help">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </header>

        {/* Body Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-space-lg py-space-md flex flex-col gap-space-md custom-scrollbar">
          <LiveMetricsRibbon metrics={metrics} />
          <TriageQueueTable threads={threads} />
        </div>
      </main>
    </div>
  );
}
