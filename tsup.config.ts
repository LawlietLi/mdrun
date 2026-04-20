import { defineConfig } from "tsup";
import { version } from "./package.json";

export default defineConfig({
  entry: ["src/cli.ts", "src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  env: {
    MDRUN_VERSION: version,
  },
});
