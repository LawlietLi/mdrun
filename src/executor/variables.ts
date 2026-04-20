import type { ArgSpec } from "../types.js";

/**
 * Converts parsed CLI args into shell environment variables.
 *
 * Each arg is injected in two forms:
 *   --dry-run=true  → DRY_RUN=true  (POSIX convention)
 *                   → dry_run=true  (spec's $dry_run style)
 *
 * Default values from ArgSpec are applied when the arg is absent.
 */
export function buildEnv(
  argSpecs: ArgSpec[],
  parsedArgs: Record<string, string | boolean>,
): Record<string, string> {
  const env: Record<string, string> = {};

  for (const spec of argSpecs) {
    const rawValue = parsedArgs[spec.name];
    let value: string | undefined;

    if (rawValue !== undefined) {
      value = String(rawValue);
    } else if (spec.default !== undefined) {
      value = spec.default;
    }

    if (value === undefined) continue;

    const snakeCase = spec.name.replace(/-/g, "_");
    const upperSnake = snakeCase.toUpperCase();

    env[snakeCase] = value;
    env[upperSnake] = value;
  }

  return env;
}
