import { describe, test, expect } from "bun:test";
import { currentPlatform, platformMatches } from "../../src/executor/platform.js";
import type { CommandNode } from "../../src/types.js";

function node(os?: string[]): CommandNode {
  return { name: "cmd", label: "cmd", args: [], children: [], script: "echo hi", os };
}

describe("platform", () => {
  test("currentPlatform returns a known value", () => {
    const platform = currentPlatform();
    expect(["linux", "mac", "windows"]).toContain(platform);
  });

  test("platformMatches returns true when os is undefined", () => {
    expect(platformMatches(node(undefined))).toBe(true);
  });

  test("platformMatches returns true when os includes current platform", () => {
    const platform = currentPlatform();
    expect(platformMatches(node([platform]))).toBe(true);
  });

  test("platformMatches returns false when os excludes current platform", () => {
    const platform = currentPlatform();
    const other = platform === "linux" ? "windows" : "linux";
    expect(platformMatches(node([other]))).toBe(false);
  });

  test("platformMatches returns true for empty os array", () => {
    expect(platformMatches(node([]))).toBe(true);
  });
});
