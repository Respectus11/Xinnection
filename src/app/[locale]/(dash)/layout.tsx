import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashShell } from "@/components/dash/DashShell";

export default async function DashLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await getSession();
  if (!session) {
    const { locale } = await params;
    redirect(`/${locale}/auth`);
  }

  return (
    <DashShell session={session}>
      {children}
    </DashShell>
  );
}
