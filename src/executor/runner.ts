import { spawnSync } from "child_process";
import type { CommandNode, RunOptions, ExecutionResult } from "../types.js";
import { currentPlatform, platformMatches, resolveShell } from "./platform.js";
import { buildEnv } from "./variables.js";
import { promptConfirm } from "./confirm.js";

/**
 * Executes a CommandNode's script with the given options.
 *
 * Handles: platform filtering, multi-platform variants, confirmation prompt,
 * env injection, shell spawn.
 */
export async function executeCommand(
  node: CommandNode,
  options: RunOptions,
): Promise<ExecutionResult> {
  // Resolve the script to run: check variants first, then fall back to node.script.
  const script = resolveScript(node);
  if (script === null) {
    return { exitCode: 0, skipped: true, aborted: false };
  }

  if (!script) {
    console.error(`mdrun: "${node.name}" is a command group, not an executable command.`);
    return { exitCode: 1, skipped: false, aborted: false };
  }

  const env = buildEnv(node.args, options.args);
  const fullEnv = { ...process.env, ...env } as Record<string, string>;

  if (node.confirm) {
    const confirmed = await promptConfirm(node.confirm, env);
    if (!confirmed) {
      console.log("Aborted.");
      return { exitCode: 0, skipped: false, aborted: true };
    }
  }

  const shell = resolveShell();
  const result = spawnSync(shell.bin, [shell.flag, script], {
    env: fullEnv,
    stdio: "inherit",
  });

  const exitCode = result.status ?? 1;
  return { exitCode, skipped: false, aborted: false };
}

/**
 * Returns the script to execute for the current platform.
 * - If the node has variants, picks the first variant matching the current platform.
 * - If the node itself matches (or has no os= restriction), uses node.script.
 * - Returns null if no variant matches (skipped).
 * - Returns undefined if the node has no script (namespace).
 */
function resolveScript(node: CommandNode): string | null | undefined {
  const platform = currentPlatform();

  // If there are variants, the node + variants together cover all platforms.
  if (node.variants && node.variants.length > 0) {
    // Check the primary node first
    if (platformMatches(node)) return node.script;
    // Then check each variant
    const match = node.variants.find((v) => v.os.includes(platform));
    if (match) return match.script;
    return null; // no variant for this platform
  }

  // No variants — plain platform filter on the node itself
  if (!platformMatches(node)) return null;
  return node.script;
}
