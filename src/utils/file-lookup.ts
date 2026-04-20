import { join } from "path";
import type { LookupResult } from "../types.js";
import { FileNotFoundError } from "./errors.js";

export const DEFAULT_FILES = ["mdrun.md", "BUILD.md", "SKILL.md", "README.md"] as const;

/** Searches cwd for the first existing default file. Returns null if none found. */
export async function findDefaultFile(): Promise<LookupResult | null> {
  for (const name of DEFAULT_FILES) {
    const path = join(process.cwd(), name);
    const file = Bun.file(path);
    if (await file.exists()) {
      return { path, source: await file.text() };
    }
  }
  return null;
}

/** Reads the given path and returns a LookupResult. Throws FileNotFoundError if missing. */
export async function readFile(path: string): Promise<LookupResult> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new FileNotFoundError(path);
  }
  return { path, source: await file.text() };
}
