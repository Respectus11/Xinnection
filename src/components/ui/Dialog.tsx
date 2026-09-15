"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "./icons";

export function Dialog({
  open,
  onClose,
  labelledBy,
  title,
  closeLabel = "Close",
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  title: string;
  closeLabel?: string;
  children: React.ReactNode;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    surfaceRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "Tab" && surfaceRef.current) {
        const focusables = surfaceRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === surfaceRef.current)
        ) {
          event.preventDefault();
          last.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: "rgba(9,13,21,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="dialog-surface w-full max-w-lg rounded-2xl p-6 focus:outline-none sm:p-7"
        style={{
          background: "rgba(14,22,36,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(78,216,189,0.15)",
          color: "#F1F5F9",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id={labelledBy}
            className="display text-xl font-bold"
            style={{ color: "#F1F5F9" }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="-m-1 rounded-lg p-1 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 hover:text-[#F1F5F9]"
            style={{ color: "rgba(148,163,184,0.7)" }}
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
