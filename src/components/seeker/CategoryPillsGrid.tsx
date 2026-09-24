"use client";
import React from "react";
import { seekerCategories } from "@/data/mockData";

export function CategoryPillsGrid() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="font-headline-sm text-headline-sm font-semibold text-starlight-white tracking-tight">Theme Context</h2>
        <span className="font-body-sm text-body-sm text-muted-silver">Select if applicable</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id="theme-pill-group">
        {seekerCategories.map((category) => {
          // A bit of custom mapping to replicate the vibrant colors exactly as in the Stitch design.
          // In a fully integrated tailwind setup, these could map to dynamic classes.
          const colorMap: Record<string, { bg: string, border: string, dotBg: string, dotShadow: string, textColor: string }> = {
            anxiety: {
              bg: "bg-tertiary/10", border: "border-tertiary/25 hover:border-tertiary/60",
              dotBg: "bg-tertiary", dotShadow: "shadow-[0_0_8px_rgba(82,222,162,0.8)]", textColor: "text-tertiary-fixed"
            },
            relationships: {
              bg: "bg-lavender/15", border: "border-lavender/30 hover:border-lavender/70",
              dotBg: "bg-secondary-fixed", dotShadow: "shadow-[0_0_8px_rgba(79,70,229,0.8)]", textColor: "text-secondary-fixed"
            },
            grief: {
              bg: "bg-peach/15", border: "border-peach/30 hover:border-peach/70",
              dotBg: "bg-peach", dotShadow: "shadow-[0_0_8px_rgba(234,88,12,0.8)]", textColor: "text-primary-fixed"
            },
            burnout: {
              bg: "bg-rose/15", border: "border-rose/30 hover:border-rose/70",
              dotBg: "bg-rose", dotShadow: "shadow-[0_0_8px_rgba(219,39,119,0.8)]", textColor: "text-primary-fixed-dim"
            },
            loneliness: {
              bg: "bg-secondary-container/20", border: "border-secondary-container/40 hover:border-secondary-container/80",
              dotBg: "bg-secondary", dotShadow: "shadow-[0_0_8px_rgba(5,102,217,0.8)]", textColor: "text-on-secondary-container"
            },
            transitions: {
              bg: "bg-surface-container-high", border: "border-outline-variant/60 hover:border-primary/50",
              dotBg: "bg-primary", dotShadow: "shadow-[0_0_8px_rgba(255,179,176,0.6)]", textColor: "text-on-surface-variant"
            }
          };

          const style = colorMap[category.id] || colorMap.anxiety;

          return (
            <button 
              key={category.id}
              className={`group relative flex items-center gap-2.5 p-3 rounded-xl ${style.bg} border ${style.border} transition-all duration-150 text-left active:scale-95`} 
              type="button"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${style.dotBg} ${style.dotShadow}`}></span>
              <span className={`font-body-md text-body-md font-medium ${style.textColor}`}>{category.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
