import yaml from "js-yaml";
import type { MetaBlock, MetaArgSpec, ArgType } from "../types.js";
import type { RawBlock } from "../types.js";

/** Parses the body of a YAML code block (one with id= in its info string) into a MetaBlock. */
export function parseYamlBlock(block: RawBlock): MetaBlock | null {
  const { id } = block.tags;
  if (!id) return null;

  let parsed: unknown;
  try {
    parsed = yaml.load(block.body);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;

  const raw = parsed as Record<string, unknown>;

  const meta: MetaBlock = { id };

  if (typeof raw["desc"] === "string") meta.desc = raw["desc"];
  if (typeof raw["confirm"] === "string") meta.confirm = raw["confirm"];

  if (raw["args"] && typeof raw["args"] === "object") {
    meta.args = {};
    for (const [name, value] of Object.entries(raw["args"] as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;
      const v = value as Record<string, unknown>;
      const argSpec: MetaArgSpec = {};
      if (typeof v["required"] === "boolean") argSpec.required = v["required"];
      if (typeof v["short"] === "string") argSpec.short = v["short"];
      if (typeof v["default"] === "string") argSpec.default = v["default"];
      if (typeof v["desc"] === "string") argSpec.desc = v["desc"];
      if (typeof v["positional"] === "boolean") argSpec.positional = v["positional"];
      if (v["type"] === "string" || v["type"] === "number" || v["type"] === "boolean") {
        argSpec.type = v["type"] as ArgType;
      }
      meta.args[name] = argSpec;
    }
  }

  return meta;
}
