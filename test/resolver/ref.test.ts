import { describe, test, expect } from "bun:test";
import { applyMetaBlock } from "../../src/resolver/ref.js";
import type { CommandNode, MetaBlock } from "../../src/types.js";

function baseNode(): CommandNode {
  return {
    name: "deploy",
    label: "deploy",
    args: [{ name: "env", required: false, type: "string" }],
    children: [],
    script: "echo deploy",
  };
}

describe("applyMetaBlock", () => {
  test("overwrites desc and confirm", () => {
    const meta: MetaBlock = { id: "m", desc: "Deploy the app", confirm: "Deploy to $env?" };
    const result = applyMetaBlock(baseNode(), meta);
    expect(result.desc).toBe("Deploy the app");
    expect(result.confirm).toBe("Deploy to $env?");
  });

  test("merges new args from meta", () => {
    const meta: MetaBlock = {
      id: "m",
      args: {
        env: { required: true, desc: "Target environment" },
        "dry-run": { type: "boolean", desc: "Dry run" },
      },
    };
    const result = applyMetaBlock(baseNode(), meta);
    const envSpec = result.args.find((a) => a.name === "env")!;
    expect(envSpec.required).toBe(true);
    expect(envSpec.desc).toBe("Target environment");
    const dryRun = result.args.find((a) => a.name === "dry-run")!;
    expect(dryRun.type).toBe("boolean");
  });

  test("does not mutate original node", () => {
    const node = baseNode();
    const meta: MetaBlock = { id: "m", desc: "New desc" };
    applyMetaBlock(node, meta);
    expect(node.desc).toBeUndefined();
  });
});
