import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

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
    redirect(`/${locale}/auth/login`);
  }

  // Passing session could be useful for providers, but Next doesn't support 
  // server components directly passing data deeply without a Provider.
  // We'll just enforce auth at the layout level.
  return <>{children}</>;
}
