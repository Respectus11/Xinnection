import localFont from "next/font/local";

// All three families are self-hosted variable woff2 files (Fontsource builds,
// SIL OFL) checked into the repo — the build has zero dependency on fetching
// from Google Fonts at compile time, and visitors get no third-party font
// requests at runtime.
//
// Noto Sans (Latin) + Noto Sans Ethiopic are companion body/UI families:
// Latin glyphs render from Noto Sans, Ethiopic script falls through to Noto
// Sans Ethiopic, so a future script locale never breaks vertical rhythm.
export const notoSans = localFont({
  src: "./fonts/noto-sans-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-noto-sans",
  display: "swap",
});

export const notoEthiopic = localFont({
  src: "./fonts/noto-sans-ethiopic-ethiopic-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-noto-ethiopic",
  display: "swap",
});

// Display serif for headlines (Latin locales). Fraunces' optical-size axis
// carries the warm editorial print feel at display sizes. When a script
// companion locale is re-enabled, headings fall to Noto Sans Ethiopic via
// the data-script hook in globals.css — never a Latin serif on Ethiopic.
export const fraunces = localFont({
  src: "./fonts/fraunces-latin-standard-normal.woff2",
  weight: "100 900",
  variable: "--font-fraunces",
  display: "swap",
});
