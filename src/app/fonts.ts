import { Noto_Sans, Noto_Sans_Ethiopic } from "next/font/google";

// Companion families, self-hosted by next/font at build time and subset per
// script (latin / ethiopic) for low-bandwidth performance.
export const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-ethiopic",
  display: "swap",
});
