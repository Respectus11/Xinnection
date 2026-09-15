"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

const ACTIVE_CODE_KEY = "xinnection_active_code";

export function HeaderCheckReplyLink({ label }: { label: string }) {
  const [targetHref, setTargetHref] = useState("/thread");
  const [hasActive, setHasActive] = useState(false);

  useEffect(() => {
    try {
      const savedCode = window.localStorage.getItem(ACTIVE_CODE_KEY);
      if (savedCode && savedCode.trim()) {
        setTargetHref(`/thread/${encodeURIComponent(savedCode.trim())}`);
        setHasActive(true);
      }
    } catch {
      // Ignore localStorage read errors in restricted contexts
    }
  }, []);

  return (
    <Link
      href={targetHref}
      className="group flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium no-underline transition-all duration-200"
      style={{
        background: hasActive ? "rgba(34,153,130,0.18)" : "rgba(255,255,255,0.04)",
        border: hasActive ? "1px solid rgba(78,216,189,0.4)" : "1px solid rgba(255,255,255,0.1)",
        color: "#F1F5F9",
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full animate-glow-pulse"
        style={{ background: "#4ED8BD" }}
      />
      {hasActive ? "Continue conversation" : label}
    </Link>
  );
}
