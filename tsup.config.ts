import { defineConfig } from "tsup";
import { version } from "./package.json";

export default defineConfig([
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    dts: false,
    clean: true,
    banner: { js: "#!/usr/bin/env node" },
    env: { MDRUN_VERSION: version },
  },
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: false,
    env: { MDRUN_VERSION: version },
  },
]);
