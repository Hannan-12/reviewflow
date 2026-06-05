import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The following are experimental React Compiler rules shipped by Next 16's
      // core-web-vitals config. They flag patterns that are valid in this codebase:
      //  - set-state-in-effect: client-only data (localStorage, fetch results) can
      //    only be read after mount, so setState-in-effect is the correct pattern.
      //  - purity: Date.now()/new Date() in async Server Components runs once per
      //    request on the server, not in a client render loop.
      //  - immutability: intentional ref/outer-scope writes in form + animation code.
      // Disabled at the project level rather than scattering inline suppressions.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
