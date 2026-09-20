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
      className="btn-press flex items-center gap-2 rounded-full px-4 py-2 min-h-[38px] text-xs font-medium no-underline transition-all duration-200 cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-[#4ED8BD]"
      style={{
        background: "rgba(24, 35, 41, 0.92)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        color: "#FFFFFF",
      }}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: "#E53E3E" }}
      />
      <span>{hasActive ? "Continue conversation" : label}</span>
    </Link>
  );
}
