"use client";

import React, { useState, useMemo } from "react";
import { TriageQueueRow } from "./TriageQueueRow";
import { Thread, Category } from "@prisma/client";

type ThreadWithCategory = Thread & { category?: Category | null };

export function TriageQueueTable({ threads, currentUserId }: { threads: ThreadWithCategory[], currentUserId: string }) {
  const [activeTab, setActiveTab] = useState<"ALL" | "UNASSIGNED" | "MINE" | "ESCALATED">("ALL");
  const [sortBy, setSortBy] = useState("WAIT_LONGEST");

  // Dynamic counts
  const allCount = threads.length;
  const unassignedCount = threads.filter((t) => !t.claimedById).length;
  const myCount = threads.filter((t) => t.claimedById === currentUserId).length;
  const escalatedCount = threads.filter((t) => t.status === "ESCALATED").length;

  const filteredThreads = useMemo(() => {
    let result = [...threads];

    // Filter by tab
    if (activeTab === "ESCALATED") {
      result = result.filter((t) => t.status === "ESCALATED");
    } else if (activeTab === "UNASSIGNED") {
      result = result.filter((t) => !t.claimedById);
    } else if (activeTab === "MINE") {
      result = result.filter((t) => t.claimedById === currentUserId);
    }

    // Sort
    if (sortBy === "WAIT_LONGEST") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "NEWEST") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [threads, activeTab, sortBy, currentUserId]);

  return (
    <section className="bg-elevated-onyx rounded-2xl shadow-sm flex flex-col flex-1 border border-white/10 overflow-hidden">
      {/* Filter Header Ribbon */}
      <div className="px-5 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-elevated-onyx">
        {/* Queue Status Pill Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <button 
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "ALL" 
                ? "bg-surface-container-high text-starlight-white" 
                : "text-muted-silver hover:bg-surface-container hover:text-starlight-white"
            }`}
            type="button"
          >
            <span>All Incoming</span>
            <span className="px-1.5 rounded-full bg-surface-container-highest/40 text-xs">
              {allCount}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab("UNASSIGNED")}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "UNASSIGNED" 
                ? "bg-surface-container-high text-starlight-white" 
                : "text-muted-silver hover:bg-surface-container hover:text-starlight-white"
            }`}
            type="button"
          >
            <span>Unassigned</span>
            <span className="text-xs">{unassignedCount}</span>
          </button>
          <button 
            onClick={() => setActiveTab("MINE")}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "MINE" 
                ? "bg-surface-container-high text-starlight-white" 
                : "text-muted-silver hover:bg-surface-container hover:text-starlight-white"
            }`}
            type="button"
          >
            <span>My Cases</span>
            <span className="text-xs">{myCount}</span>
          </button>
          <button 
            onClick={() => setActiveTab("ESCALATED")}
            className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "ESCALATED" 
                ? "bg-rose/20 text-rose font-semibold border border-rose/30" 
                : "text-muted-silver hover:bg-surface-container hover:text-starlight-white"
            }`}
            type="button"
          >
            <span className="w-2 h-2 rounded-full bg-rose"></span>
            <span>Escalated</span>
            <span className="text-xs">{escalatedCount}</span>
          </button>
        </div>

        {/* Secondary Filters Dropdowns */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-silver">
            <span>Sort:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-low border border-white/10 rounded-full py-1 pl-3 pr-7 text-starlight-white font-medium focus:ring-1 focus:ring-secondary cursor-pointer outline-none"
            >
              <option value="WAIT_LONGEST">Longest Wait First</option>
              <option value="NEWEST">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Triage Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/30 text-muted-silver text-xs uppercase tracking-wider border-b border-white/10">
              <th className="py-3 px-5 font-semibold">Thread ID</th>
              <th className="py-3 px-5 font-semibold">Topic</th>
              <th className="py-3 px-5 font-semibold">Status</th>
              <th className="py-3 px-5 font-semibold">Wait Time</th>
              <th className="py-3 px-5 font-semibold">Assignment</th>
              <th className="py-3 px-5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm">
            {filteredThreads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-silver">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-3xl opacity-40">inbox</span>
                    <span>No threads match the selected filter.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredThreads.map((thread) => (
                <TriageQueueRow key={thread.id} thread={thread} currentUserId={currentUserId} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
