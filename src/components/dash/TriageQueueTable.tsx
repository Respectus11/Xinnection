"use client";
import React from "react";
import { TriageQueueRow } from "./TriageQueueRow";
import { Thread } from "@prisma/client";

export function TriageQueueTable({ threads }: { threads: Thread[] }) {
  return (
    <section className="bg-pure-surface rounded-DEFAULT shadow-sm flex flex-col flex-1 border border-surface-container-high/40 overflow-hidden">
      {/* Filter Header Ribbon */}
      <div className="px-space-md py-space-sm border-b border-surface-container-high/60 flex flex-wrap items-center justify-between gap-space-sm bg-pure-surface">
        {/* Queue Status Pill Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <button className="px-3 py-1.5 rounded-full text-label-md font-label-md font-semibold bg-deep-midnight text-surface-container-lowest shadow-sm flex items-center gap-1.5 whitespace-nowrap">
            <span>All Incoming</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest/20 text-mono-data font-mono-data text-xs">42</span>
          </button>
          <button className="px-3 py-1.5 rounded-full text-label-md font-label-md text-warm-slate hover:bg-surface-container-low hover:text-deep-midnight transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-vibrant-coral"></span>
            <span>Critical & Severe</span>
            <span className="text-mono-data font-mono-data text-xs text-warm-slate">5</span>
          </button>
          <button className="px-3 py-1.5 rounded-full text-label-md font-label-md text-warm-slate hover:bg-surface-container-low hover:text-deep-midnight transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <span>Unassigned</span>
            <span className="text-mono-data font-mono-data text-xs text-warm-slate">18</span>
          </button>
          <button className="px-3 py-1.5 rounded-full text-label-md font-label-md text-warm-slate hover:bg-surface-container-low hover:text-deep-midnight transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <span>Awaiting Peer Handoff</span>
            <span className="text-mono-data font-mono-data text-xs text-warm-slate">7</span>
          </button>
        </div>

        {/* Secondary Filters Dropdowns */}
        <div className="flex items-center gap-space-sm text-body-sm font-body-sm">
          <div className="flex items-center gap-1 text-warm-slate">
            <span className="text-mono-data font-mono-data">Filter:</span>
            <select className="bg-surface-container-low border-0 rounded-full py-1 pl-3 pr-7 text-body-sm font-body-sm text-deep-midnight font-medium focus:ring-1 focus:ring-azure-blue cursor-pointer outline-none">
              <option>All Tiers</option>
              <option>Tier 1 (Crisis/Suicide)</option>
              <option>Tier 2 (Elevated)</option>
              <option>Tier 3 (Moderate)</option>
            </select>
          </div>
          <div className="flex items-center gap-1 text-warm-slate">
            <span className="text-mono-data font-mono-data">Sort:</span>
            <select className="bg-surface-container-low border-0 rounded-full py-1 pl-3 pr-7 text-body-sm font-body-sm text-deep-midnight font-medium focus:ring-1 focus:ring-azure-blue cursor-pointer outline-none">
              <option>Longest Wait First</option>
              <option>Risk: Highest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Triage Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50 text-warm-slate text-mono-data font-mono-data uppercase tracking-wider border-b border-surface-container-high/60">
              <th className="py-3 px-space-md font-semibold">Thread ID & Status</th>
              <th className="py-3 px-space-md font-semibold">Risk Tier</th>
              <th className="py-3 px-space-md font-semibold">Themes</th>
              <th className="py-3 px-space-md font-semibold w-1/3">Snippet Preview</th>
              <th className="py-3 px-space-md font-semibold">Wait Time</th>
              <th className="py-3 px-space-md font-semibold">Assigned Responder</th>
              <th className="py-3 px-space-md font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high/40 text-body-sm font-body-sm">
            {threads.map((thread) => (
              <TriageQueueRow key={thread.id} thread={thread} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
