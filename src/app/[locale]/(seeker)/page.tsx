import React from "react";
import { SeekerHeader } from "@/components/seeker/SeekerHeader";
import { SeekerHero } from "@/components/seeker/SeekerHero";
import { ReflectionComposer } from "@/components/seeker/ReflectionComposer";
import { CategoryPillsGrid } from "@/components/seeker/CategoryPillsGrid";
import { SeekerBottomNav } from "@/components/seeker/SeekerBottomNav";

export default function SeekerLandingPage() {
  return (
    <div className="bg-canvas-deep text-on-surface font-body-md min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container relative pb-52">
      <SeekerHeader />

      {/* Main Scrollable Canvas */}
      <main className="w-full max-w-md mx-auto pt-16 px-margin flex flex-col gap-6">
        <SeekerHero />
        <ReflectionComposer />
        <CategoryPillsGrid />
      </main>

      <SeekerBottomNav />
    </div>
  );
}
