import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { LookupResult } from "../types.js";
import { FileNotFoundError } from "./errors.js";

export const DEFAULT_FILES = ["mdrun.md", "BUILD.md", "SKILL.md", "README.md"] as const;

/** Searches cwd for the first existing default file. Returns null if none found. */
export async function findDefaultFile(): Promise<LookupResult | null> {
  for (const name of DEFAULT_FILES) {
    const path = join(process.cwd(), name);
    if (existsSync(path)) {
      return { path, source: readFileSync(path, "utf8") };
    }
  }
  return null;
}

/** Reads the given path and returns a LookupResult. Throws FileNotFoundError if missing. */
export async function readFile(path: string): Promise<LookupResult> {
  if (!existsSync(path)) {
    throw new FileNotFoundError(path);
  }
  return { path, source: readFileSync(path, "utf8") };
}
