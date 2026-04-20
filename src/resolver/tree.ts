import type { RawBlock, CommandNode, MetaBlock } from "../types.js";
import { parseArgsSyntax } from "../parser/args-syntax.js";
import { parseYamlBlock } from "../parser/yaml-block.js";
import { applyMetaBlock } from "./ref.js";

export interface BuildResult {
  commands: CommandNode[];
  meta: Map<string, MetaBlock>;
}

/**
 * Builds the CommandNode tree from all raw blocks in a Markdown file.
 *
 * Steps:
 * 1. Separate YAML metadata blocks (id= present, no cmd=) from command blocks.
 * 2. Parse each YAML block into a MetaBlock.
 * 3. For each command block, build a CommandNode and resolve ref= against meta.
 * 4. Insert nodes into the tree using dot-notation paths; create synthetic
 *    namespace nodes as needed.
 */
export function buildCommandTree(blocks: RawBlock[]): BuildResult {
  const meta = new Map<string, MetaBlock>();
  const commandBlocks: RawBlock[] = [];

  // Pass 1: collect metadata blocks
  for (const block of blocks) {
    if (block.tags.id && !block.tags.cmd) {
      const parsed = parseYamlBlock(block);
      if (parsed) meta.set(parsed.id, parsed);
    } else if (block.tags.cmd) {
      commandBlocks.push(block);
    }
  }

  // Pass 2: build nodes
  const roots: CommandNode[] = [];

  for (const block of commandBlocks) {
    const { cmd, args, desc, ref, os } = block.tags;
    if (!cmd) continue;

    const argSpecs = args ? parseArgsSyntax(args) : [];
    const osList = os ? os.split(",").map((s) => s.trim()) : undefined;

    let node: CommandNode = {
      name: cmd,
      label: cmd.includes(".") ? cmd.split(".").pop()! : cmd,
      args: argSpecs,
      script: block.body,
      children: [],
    };
    if (desc !== undefined) node.desc = desc;
    if (osList !== undefined) node.os = osList;
    if (block.line) node.line = block.line;

    // Resolve ref= cross-reference
    if (ref) {
      const metaBlock = meta.get(ref);
      if (metaBlock) {
        node = applyMetaBlock(node, metaBlock);
      }
    }

    insertNode(roots, node, cmd.split("."));
  }

  return { commands: roots, meta };
}

/**
 * Inserts a CommandNode into the tree at the path described by segments.
 * Creates synthetic namespace nodes for intermediate path segments.
 */
function insertNode(roots: CommandNode[], node: CommandNode, segments: string[]): void {
  if (segments.length === 0) return;

  if (segments.length === 1) {
    const existing = roots.find((n) => n.label === segments[0]);
    if (existing && existing.script) {
      // Same name already has a script — this is a multi-platform variant, store it.
      if (!existing.variants) existing.variants = [];
      if (node.os && node.script) {
        existing.variants.push({ os: node.os, script: node.script });
      }
      return;
    }
    if (existing && !existing.script) {
      // Promote the synthetic namespace node with real fields.
      existing.name = node.name;
      if (node.desc !== undefined) existing.desc = node.desc;
      existing.args = node.args;
      if (node.os !== undefined) existing.os = node.os;
      if (node.script !== undefined) existing.script = node.script;
      if (node.confirm !== undefined) existing.confirm = node.confirm;
      if (node.line !== undefined) existing.line = node.line;
    } else {
      roots.push(node);
    }
    return;
  }

  const [head, ...tail] = segments as [string, ...string[]];

  // Find or create the namespace node for head
  let parent = roots.find((n) => n.label === head);
  if (!parent) {
    const parentPath = node.name.split(".").slice(0, segments.length - tail.length).join(".");
    parent = {
      name: parentPath,
      label: head,
      args: [],
      children: [],
    };
    roots.push(parent);
  }

  insertNode(parent.children, node, tail);
}
