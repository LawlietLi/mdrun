import type { InfoStringTags } from "../types.js";

const KNOWN_KEYS = ["cmd", "args", "desc", "spec", "confirm", "os", "id"] as const;
type KnownKey = (typeof KNOWN_KEYS)[number];

/**
 * Parses a fenced code block info string into structured tags.
 *
 * Input:  "bash cmd=db.migrate desc=Migrate the database os=linux,mac"
 * Output: { lang: "bash", cmd: "db.migrate", desc: "Migrate the database", os: "linux,mac" }
 *
 * Values may contain spaces; each value runs until the next `key=` boundary.
 * The first token with no `=` is the language identifier.
 */
export function parseInfoString(raw: string): InfoStringTags {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  const tags: InfoStringTags = {};

  // Find positions of all "key=" boundaries for known keys.
  // We build a sorted list of { key, start } so we can slice values between boundaries.
  const boundaries: Array<{ key: KnownKey; start: number; valueStart: number }> = [];

  for (const key of KNOWN_KEYS) {
    const pattern = new RegExp(`(?:^|\\s)${key}=`, "g");
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(trimmed)) !== null) {
      const start = match.index + (match[0].startsWith(" ") ? 1 : 0);
      boundaries.push({ key, start, valueStart: start + key.length + 1 });
    }
  }

  boundaries.sort((a, b) => a.start - b.start);

  // Extract values between consecutive boundaries.
  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i];
    if (!boundary) continue;
    const { key, valueStart } = boundary;
    const nextBoundary = boundaries[i + 1];
    const rawValue = nextBoundary
      ? trimmed.slice(valueStart, nextBoundary.start)
      : trimmed.slice(valueStart);
    (tags as Record<string, string>)[key] = rawValue.trim();
  }

  // Everything before the first boundary (or the whole string if no boundaries) is the lang token.
  const firstBoundary = boundaries[0];
  const langPart = firstBoundary ? trimmed.slice(0, firstBoundary.start) : trimmed;
  const langToken = langPart.trim().split(/\s+/)[0];
  if (langToken) {
    tags.lang = langToken;
  }

  return tags;
}
