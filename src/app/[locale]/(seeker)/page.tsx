import { setRequestLocale } from "next-intl/server";
import { SeekerComposer } from "@/components/seeker/SeekerComposer";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SeekerComposer />;
}
