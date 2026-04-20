import { describe, test, expect } from "bun:test";
import { buildEnv } from "../../src/executor/variables.js";
import type { ArgSpec } from "../../src/types.js";

describe("buildEnv", () => {
  test("boolean flag maps to 'true' string", () => {
    const specs: ArgSpec[] = [{ name: "dry-run", required: false, type: "boolean" }];
    const env = buildEnv(specs, { "dry-run": true });
    expect(env["DRY_RUN"]).toBe("true");
    expect(env["dry_run"]).toBe("true");
  });

  test("string arg maps to its value", () => {
    const specs: ArgSpec[] = [{ name: "port", required: false, type: "string" }];
    const env = buildEnv(specs, { port: "3000" });
    expect(env["PORT"]).toBe("3000");
    expect(env["port"]).toBe("3000");
  });

  test("absent optional arg is not in env", () => {
    const specs: ArgSpec[] = [{ name: "port", required: false, type: "string" }];
    const env = buildEnv(specs, {});
    expect(env["PORT"]).toBeUndefined();
    expect(env["port"]).toBeUndefined();
  });

  test("default value is applied when arg is absent", () => {
    const specs: ArgSpec[] = [{ name: "port", required: false, type: "string", default: "8080" }];
    const env = buildEnv(specs, {});
    expect(env["port"]).toBe("8080");
    expect(env["PORT"]).toBe("8080");
  });

  test("provided value overrides default", () => {
    const specs: ArgSpec[] = [{ name: "port", required: false, type: "string", default: "8080" }];
    const env = buildEnv(specs, { port: "3000" });
    expect(env["port"]).toBe("3000");
  });

  test("hyphen-to-underscore conversion", () => {
    const specs: ArgSpec[] = [{ name: "dry-run", required: false, type: "boolean" }];
    const env = buildEnv(specs, { "dry-run": true });
    expect(env["dry_run"]).toBe("true");
    expect(env["DRY_RUN"]).toBe("true");
  });
});
