"use client";

import React, { useState, useMemo } from "react";
import { TriageQueueRow } from "./TriageQueueRow";
import { Thread } from "@prisma/client";

export function TriageQueueTable({ threads }: { threads: Thread[] }) {
  const [activeTab, setActiveTab] = useState<"ALL" | "CRITICAL" | "UNASSIGNED" | "RESOLVED">("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("WAIT_LONGEST");

  // Dynamic counts
  const allCount = threads.length;
  const criticalCount = threads.filter((t) => t.status === "ESCALATED").length;
  const unassignedCount = threads.filter((t) => !t.claimedById).length;
  const resolvedCount = threads.filter((t) => t.status === "RESOLVED").length;

  const filteredThreads = useMemo(() => {
    let result = [...threads];

    // Filter by tab
    if (activeTab === "CRITICAL") {
      result = result.filter((t) => t.status === "ESCALATED");
    } else if (activeTab === "UNASSIGNED") {
      result = result.filter((t) => !t.claimedById && t.status !== "RESOLVED");
    } else if (activeTab === "RESOLVED") {
      result = result.filter((t) => t.status === "RESOLVED");
    }

    // Filter by Tier
    if (tierFilter === "TIER_1") {
      result = result.filter((t) => t.status === "ESCALATED");
    } else if (tierFilter === "TIER_2") {
      result = result.filter((t) => t.status === "IN_PROGRESS");
    } else if (tierFilter === "TIER_3") {
      result = result.filter((t) => t.status === "OPEN");
    }

    // Sort
    if (sortBy === "WAIT_LONGEST") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "RISK_HIGHEST") {
      const rank = (status: string) => (status === "ESCALATED" ? 3 : status === "IN_PROGRESS" ? 2 : 1);
      result.sort((a, b) => rank(b.status) - rank(a.status));
    } else if (sortBy === "NEWEST") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [threads, activeTab, tierFilter, sortBy]);

  return (
    <section className="bg-pure-surface rounded-2xl shadow-sm flex flex-col flex-1 border border-surface-container-high/40 overflow-hidden">
      {/* Filter Header Ribbon */}
      <div className="px-space-md py-space-sm border-b border-surface-container-high/60 flex flex-wrap items-center justify-between gap-space-sm bg-pure-surface">
        {/* Queue Status Pill Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <button 
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-full text-label-md font-label-md font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "ALL" 
                ? "bg-deep-midnight text-pure-surface shadow-sm" 
                : "text-warm-slate hover:bg-surface-container-low hover:text-deep-midnight"
            }`}
            type="button"
          >
            <span>All Incoming</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest/40 text-mono-data font-mono-data text-xs">
              {allCount}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab("CRITICAL")}
            className={`px-3 py-1.5 rounded-full text-label-md font-label-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "CRITICAL" 
                ? "bg-rose-bg text-rose-text font-semibold border border-rose-bg shadow-sm" 
                : "text-warm-slate hover:bg-surface-container-low hover:text-deep-midnight"
            }`}
            type="button"
          >
            <span className="w-2 h-2 rounded-full bg-vibrant-coral"></span>
            <span>Critical & Severe</span>
            <span className="text-mono-data font-mono-data text-xs">{criticalCount}</span>
          </button>
          <button 
            onClick={() => setActiveTab("UNASSIGNED")}
            className={`px-3 py-1.5 rounded-full text-label-md font-label-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "UNASSIGNED" 
                ? "bg-deep-midnight text-pure-surface font-semibold shadow-sm" 
                : "text-warm-slate hover:bg-surface-container-low hover:text-deep-midnight"
            }`}
            type="button"
          >
            <span>Unassigned</span>
            <span className="text-mono-data font-mono-data text-xs">{unassignedCount}</span>
          </button>
          <button 
            onClick={() => setActiveTab("RESOLVED")}
            className={`px-3 py-1.5 rounded-full text-label-md font-label-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "RESOLVED" 
                ? "bg-mint-bg text-mint-text font-semibold shadow-sm" 
                : "text-warm-slate hover:bg-surface-container-low hover:text-deep-midnight"
            }`}
            type="button"
          >
            <span>Resolved / Log</span>
            <span className="text-mono-data font-mono-data text-xs">{resolvedCount}</span>
          </button>
        </div>

        {/* Secondary Filters Dropdowns */}
        <div className="flex items-center gap-space-sm text-body-sm font-body-sm">
          <div className="flex items-center gap-1 text-warm-slate">
            <span className="text-mono-data font-mono-data">Filter:</span>
            <select 
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-surface-container-low border-0 rounded-full py-1 pl-3 pr-7 text-body-sm font-body-sm text-deep-midnight font-medium focus:ring-1 focus:ring-azure-blue cursor-pointer outline-none"
            >
              <option value="ALL">All Tiers</option>
              <option value="TIER_1">Tier 1 (Crisis/Suicide)</option>
              <option value="TIER_2">Tier 2 (Elevated)</option>
              <option value="TIER_3">Tier 3 (Moderate)</option>
            </select>
          </div>
          <div className="flex items-center gap-1 text-warm-slate">
            <span className="text-mono-data font-mono-data">Sort:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-low border-0 rounded-full py-1 pl-3 pr-7 text-body-sm font-body-sm text-deep-midnight font-medium focus:ring-1 focus:ring-azure-blue cursor-pointer outline-none"
            >
              <option value="WAIT_LONGEST">Longest Wait First</option>
              <option value="RISK_HIGHEST">Risk: Highest First</option>
              <option value="NEWEST">Newest First</option>
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
            {filteredThreads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-warm-slate font-mono-data">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-3xl opacity-40">inbox</span>
                    <span>No threads match the selected filter.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredThreads.map((thread) => (
                <TriageQueueRow key={thread.id} thread={thread} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
