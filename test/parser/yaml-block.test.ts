import { describe, test, expect } from "bun:test";
import { parseYamlBlock } from "../../src/parser/yaml-block.js";
import type { RawBlock } from "../../src/types.js";

function makeBlock(id: string, body: string): RawBlock {
  return { tags: { lang: "yaml", id }, body, line: 1 };
}

describe("parseYamlBlock", () => {
  test("parses basic desc and confirm", () => {
    const block = makeBlock("deploy-meta", `desc: Deploy the app\nconfirm: Deploy to $env?`);
    const meta = parseYamlBlock(block);
    expect(meta?.id).toBe("deploy-meta");
    expect(meta?.desc).toBe("Deploy the app");
    expect(meta?.confirm).toBe("Deploy to $env?");
  });

  test("parses args", () => {
    const block = makeBlock(
      "meta1",
      `args:\n  env:\n    required: true\n    desc: Target environment\n  port:\n    type: number\n    default: "3000"`,
    );
    const meta = parseYamlBlock(block);
    expect(meta?.args?.["env"]?.required).toBe(true);
    expect(meta?.args?.["env"]?.desc).toBe("Target environment");
    expect(meta?.args?.["port"]?.type).toBe("number");
    expect(meta?.args?.["port"]?.default).toBe("3000");
  });

  test("returns null when id is missing", () => {
    const block: RawBlock = { tags: { lang: "yaml" }, body: "desc: foo", line: 1 };
    expect(parseYamlBlock(block)).toBeNull();
  });

  test("returns null on invalid YAML", () => {
    const block = makeBlock("bad", "{ invalid yaml: [");
    expect(parseYamlBlock(block)).toBeNull();
  });
});
