import type { CommandNode } from "../types.js";

export type Platform = "linux" | "mac" | "windows";

export function currentPlatform(): Platform {
  if (process.platform === "win32") return "windows";
  if (process.platform === "darwin") return "mac";
  return "linux";
}

/** Returns true if the command has no os= restriction or it includes the current platform. */
export function platformMatches(node: CommandNode): boolean {
  if (!node.os || node.os.length === 0) return true;
  return node.os.includes(currentPlatform());
}

export interface Shell {
  bin: string;
  flag: string;
}

export function resolveShell(): Shell {
  if (currentPlatform() === "windows") {
    return { bin: "powershell", flag: "-Command" };
  }
  return { bin: "bash", flag: "-c" };
}
