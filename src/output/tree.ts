import type { CommandNode } from "../types.js";
import { color } from "../utils/color.js";

export function renderTree(commands: CommandNode[], prefix = ""): string {
  const lines: string[] = [];

  for (let i = 0; i < commands.length; i++) {
    const node = commands[i]!;
    const isLast = i === commands.length - 1;

    const connector = isLast ? "└── " : "├── ";
    const childPrefix = isLast ? "    " : "│   ";

    const label =
      node.children.length > 0
        ? color.bold(color.yellow(node.label))
        : color.bold(color.cyan(node.label));
    const descPart = node.desc ? `   ${color.dim(node.desc)}` : "";
    lines.push(`${color.dim(prefix + connector)}${label}${descPart}`);

    if (node.children.length > 0) {
      lines.push(renderTree(node.children, prefix + childPrefix));
    }
  }

  return lines.join("\n");
}
