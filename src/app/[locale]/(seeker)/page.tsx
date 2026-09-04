import { setRequestLocale } from "next-intl/server";
import { ComposeHero } from "./ComposeHero";

// Landing page: the working textarea is the hero — not an illustration of one.
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComposeHero />;
}
