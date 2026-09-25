"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SeekerHeader } from "@/components/seeker/SeekerHeader";
import { SeekerHero } from "@/components/seeker/SeekerHero";
import { ReflectionComposer } from "@/components/seeker/ReflectionComposer";
import { CategoryPillsGrid } from "@/components/seeker/CategoryPillsGrid";
import { SeekerBottomNav } from "@/components/seeker/SeekerBottomNav";

export default function HomePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [content, setContent] = useState("");
  const [categorySlug, setCategorySlug] = useState("other");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || !categorySlug || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, categorySlug, language: locale }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit reflection");
      }
      const data = await res.json();
      router.push(`/${locale}/code?c=${data.code}`);
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitError(error.message || "Failed to connect to anonymous relay. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-canvas-deep text-on-surface font-body-md min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container relative pb-52">
      <SeekerHeader />

      {/* Main Scrollable Canvas */}
      <main className="w-full max-w-md mx-auto pt-16 px-margin flex flex-col gap-6">
        <SeekerHero />
        
        {submitError && (
          <div className="p-3.5 rounded-xl bg-error-container/30 border border-error/40 text-error text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{submitError}</span>
          </div>
        )}

        <ReflectionComposer content={content} onChange={setContent} />
        <CategoryPillsGrid selectedCategory={categorySlug} onSelect={setCategorySlug} />
      </main>

      <SeekerBottomNav 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        disabled={!content.trim() || !categorySlug} 
      />
    </div>
  );
}
