import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Internationalized routing only. Authentication is enforced in layouts and
// route handlers — API paths are excluded from this matcher and never rely
// on middleware for access control.
export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
