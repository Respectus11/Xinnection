import React from "react";
import { ProCaseView } from "@/components/dash/ProCaseView";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function ProfessionalCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const thread = await prisma.thread.findUnique({
    where: { id },
  });

  if (!thread) {
    return notFound();
  }

  // We should fetch messages via API client side to support polling, 
  // or fetch initial here. For now, pass thread to view.
  return <ProCaseView threadId={thread.id} />;
}
