"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SeekerHeader } from "@/components/seeker/SeekerHeader";
import { SeekerHero } from "@/components/seeker/SeekerHero";
import { ReflectionComposer } from "@/components/seeker/ReflectionComposer";
import { CategoryPillsGrid } from "@/components/seeker/CategoryPillsGrid";
import { SeekerBottomNav } from "@/components/seeker/SeekerBottomNav";

export default function SeekerLandingPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !categorySlug) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, categorySlug, language: "en" })
      });
      if (!res.ok) throw new Error("Failed to submit");
      const data = await res.json();
      router.push(`/en/code?c=${data.code}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-canvas-deep text-on-surface font-body-md min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container relative pb-52">
      <SeekerHeader />

      {/* Main Scrollable Canvas */}
      <main className="w-full max-w-md mx-auto pt-16 px-margin flex flex-col gap-6">
        <SeekerHero />
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
