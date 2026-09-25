import React from "react";
import { SeekerThreadView } from "@/components/seeker/SeekerThreadView";

export default async function ThreadPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code);
  return <SeekerThreadView code={decodedCode} />;
}
