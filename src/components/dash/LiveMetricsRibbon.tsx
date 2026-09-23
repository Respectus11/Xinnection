"use client";
import React from "react";
import { liveMetrics } from "@/data/mockData";

export function LiveMetricsRibbon() {
  return (
    <section className="grid grid-cols-4 gap-space-md">
      {/* Metric 1: Total Active Queue */}
      <div className="bg-pure-surface p-space-md rounded-DEFAULT shadow-sm flex items-center justify-between border-l-4 border-azure-blue">
        <div>
          <span className="text-body-sm font-body-sm text-warm-slate block">Total Active Queue</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-headline-md font-headline-md text-deep-midnight font-bold">{liveMetrics.totalQueue}</span>
            <span className="text-mono-data font-mono-data text-warm-slate">threads</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-azure-blue">
          <span className="material-symbols-outlined">forum</span>
        </div>
      </div>
      
      {/* Metric 2: Critical High-Risk */}
      <div className="bg-pure-surface p-space-md rounded-DEFAULT shadow-sm flex items-center justify-between border-l-4 border-vibrant-coral">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-body-sm font-body-sm text-deep-midnight font-medium">Critical & Escalated</span>
            <span className="inline-block w-2 h-2 rounded-full bg-vibrant-coral animate-ping"></span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-headline-md font-headline-md text-primary font-bold">{liveMetrics.escalations}</span>
            <span className="text-mono-data font-mono-data text-primary font-medium">Action Required</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-rose-bg flex items-center justify-center text-rose-text">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
        </div>
      </div>
      
      {/* Metric 3: Median Response Time */}
      <div className="bg-pure-surface p-space-md rounded-DEFAULT shadow-sm flex items-center justify-between border-l-4 border-peach-text">
        <div>
          <span className="text-body-sm font-body-sm text-warm-slate block">Median First Response</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-headline-md font-headline-md text-deep-midnight font-bold">3m 42s</span>
            <span className="text-mono-data font-mono-data text-mint-text font-medium">-18s vs benchmark</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-peach-bg flex items-center justify-center text-peach-text">
          <span className="material-symbols-outlined">timer</span>
        </div>
      </div>
      
      {/* Metric 4: Responders Available */}
      <div className="bg-pure-surface p-space-md rounded-DEFAULT shadow-sm flex items-center justify-between border-l-4 border-mint-text">
        <div>
          <span className="text-body-sm font-body-sm text-warm-slate block">Active Responders</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-headline-md font-headline-md text-deep-midnight font-bold">14</span>
            <span className="text-mono-data font-mono-data text-warm-slate">on shift (3 Tier-2 LCSW)</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-mint-bg flex items-center justify-center text-mint-text">
          <span className="material-symbols-outlined">clinical_notes</span>
        </div>
      </div>
    </section>
  );
}
