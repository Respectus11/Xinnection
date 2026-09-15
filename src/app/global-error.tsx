"use client";

// Last-resort boundary: renders when the root layout itself fails. Kept
// deliberately self-contained (inline styles only) so it renders even if the
// stylesheet pipeline is what broke. Calm, warm, on-palette.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#EDEFE4",
          color: "#10161F",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "26rem",
            textAlign: "center",
            background: "#FFFFFF",
            border: "1px solid #DCDFCF",
            borderRadius: "10px",
            padding: "2rem",
          }}
        >
          <h1 style={{ fontSize: "1.35rem", fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ lineHeight: 1.6, color: "rgba(16,22,31,0.75)", margin: "0.75rem 0 0" }}>
            This page hit an unexpected problem. It is not your fault — please try
            again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.25rem",
              background: "#C9A227",
              color: "#10161F",
              border: "none",
              borderRadius: "6px",
              padding: "0.6rem 1.25rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
