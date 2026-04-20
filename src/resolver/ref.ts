import type { CommandNode, MetaBlock, ArgSpec } from "../types.js";

/**
 * Merges a MetaBlock into a CommandNode.
 * MetaBlock fields win over inline tag fields for desc and confirm.
 * MetaBlock args are merged into ArgSpec[] by name; YAML entries override inline ones.
 */
export function applyMetaBlock(node: CommandNode, meta: MetaBlock): CommandNode {
  const result: CommandNode = { ...node };

  if (meta.desc) result.desc = meta.desc;
  if (meta.confirm) result.confirm = meta.confirm;

  if (meta.args) {
    const specMap = new Map<string, ArgSpec>(node.args.map((s) => [s.name, s]));

    for (const [name, metaArg] of Object.entries(meta.args)) {
      const existing = specMap.get(name) ?? {
        name,
        required: false,
        type: "string" as const,
      };

      const merged: ArgSpec = { ...existing };
      if (metaArg.required !== undefined) merged.required = metaArg.required;
      if (metaArg.short !== undefined) merged.short = metaArg.short;
      if (metaArg.type !== undefined) merged.type = metaArg.type;
      if (metaArg.default !== undefined) merged.default = metaArg.default;
      if (metaArg.desc !== undefined) merged.desc = metaArg.desc;
      if (metaArg.positional !== undefined) merged.positional = metaArg.positional;

      specMap.set(name, merged);
    }

    result.args = Array.from(specMap.values());
  }

  return result;
}
