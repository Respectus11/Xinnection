/**
 * Normalizes user-supplied plain text for storage.
 *
 * Messages are plain text and are ALWAYS rendered through React (which
 * escapes). Output encoding at render time is the real XSS defence, so this
 * function deliberately does NOT try to strip markup with regexes (fragile)
 * and never decodes HTML entities (which could re-introduce angle brackets).
 * It removes characters that have no business in a chat message: NUL and other
 * control characters, bidi-override/zero-width format characters used for
 * spoofing, and normalizes to NFC. Newlines and tabs are preserved.
 */
export function sanitizePlainText(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF]/g, "")
    .trim();
}
