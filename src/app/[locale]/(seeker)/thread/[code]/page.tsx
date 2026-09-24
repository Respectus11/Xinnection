import React from "react";
import { SeekerThreadView } from "@/components/seeker/SeekerThreadView";

export default async function ThreadPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <SeekerThreadView code={code} />;
}
