import { describe, test, expect } from "bun:test";
import { buildCommandTree } from "../../src/resolver/tree.js";
import type { RawBlock } from "../../src/types.js";

function block(cmd: string, body = "echo ok", extra: Partial<RawBlock["tags"]> = {}): RawBlock {
  return { tags: { lang: "bash", cmd, ...extra }, body, line: 1 };
}

describe("buildCommandTree", () => {
  test("single top-level command", () => {
    const { commands } = buildCommandTree([block("build")]);
    expect(commands).toHaveLength(1);
    expect(commands[0]!.name).toBe("build");
    expect(commands[0]!.label).toBe("build");
    expect(commands[0]!.script).toBe("echo ok");
  });

  test("creates synthetic namespace node for dot-notation", () => {
    const { commands } = buildCommandTree([block("db.migrate"), block("db.seed")]);
    expect(commands).toHaveLength(1);
    const db = commands[0]!;
    expect(db.label).toBe("db");
    expect(db.script).toBeUndefined();
    expect(db.children).toHaveLength(2);
    expect(db.children.map((c) => c.label)).toEqual(["migrate", "seed"]);
  });

  test("deep nesting", () => {
    const { commands } = buildCommandTree([
      block("docker.image.build"),
      block("docker.image.push"),
      block("docker.container.start"),
    ]);
    expect(commands).toHaveLength(1);
    const docker = commands[0]!;
    expect(docker.label).toBe("docker");
    expect(docker.children).toHaveLength(2);
    const image = docker.children.find((c) => c.label === "image")!;
    expect(image.children).toHaveLength(2);
  });

  test("resolves ref= cross-reference", () => {
    const yamlBlock: RawBlock = {
      tags: { lang: "yaml", id: "meta1" },
      body: "desc: Deploy the app\nconfirm: Deploy to $env?",
      line: 1,
    };
    const cmdBlock = block("deploy", "echo deploy", { ref: "meta1" });
    const { commands } = buildCommandTree([yamlBlock, cmdBlock]);
    expect(commands[0]!.desc).toBe("Deploy the app");
    expect(commands[0]!.confirm).toBe("Deploy to $env?");
  });

  test("parses inline args= into ArgSpec", () => {
    const { commands } = buildCommandTree([block("serve", "echo serve", { args: "[-p/--port=<port>=3000]" })]);
    const spec = commands[0]!.args[0]!;
    expect(spec.name).toBe("port");
    expect(spec.short).toBe("p");
    expect(spec.default).toBe("3000");
  });

  test("parses os= into string array", () => {
    const { commands } = buildCommandTree([block("build", "echo build", { os: "linux,mac" })]);
    expect(commands[0]!.os).toEqual(["linux", "mac"]);
  });

  test("multiple top-level commands", () => {
    const { commands } = buildCommandTree([block("build"), block("test"), block("lint")]);
    expect(commands).toHaveLength(3);
    expect(commands.map((c) => c.label)).toEqual(["build", "test", "lint"]);
  });
});
