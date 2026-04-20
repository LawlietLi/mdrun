import type { CommandNode } from "../types.js";

/** Serialises the command tree to a pretty-printed JSON string. */
export function renderJson(commands: CommandNode[]): string {
  return JSON.stringify(commands, null, 2);
}
