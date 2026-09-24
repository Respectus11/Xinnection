import React from "react";
import { redirect } from "next/navigation";
import { SeekerThreadView } from "@/components/seeker/SeekerThreadView";

export default async function SeekerThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (!code) redirect("/");
  return <SeekerThreadView code={code} />;
}
