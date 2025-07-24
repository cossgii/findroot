import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier"; // eslint-config-prettier 임포트

export default defineConfig([
  // 1. Ignore generated files and directories
  {
    ignores: [
      ".next/**",
      "generated/**",
      "node_modules/**",
      "pnpm-lock.yaml",
      "postcss.config.js",
      "tailwind.config.ts",
      "next-env.d.ts",
      "tsconfig.json",
      "eslint.config.mjs", // Ignore itself
      "package.json",
      "prisma/**",
      "lib/**",
      "app/api/**",
      "src/services/**",
      "src/stores/**",
      "src/utils/**",
      "src/components/styles/**",
    ],
  },

  // 2. Base JavaScript/TypeScript configuration
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      js,
      "@typescript-eslint": tseslint.plugin,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      // Disable rules that conflict with Prettier or are too strict for generated files
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-require-imports": "off", // Allow require() in generated files
      "no-undef": "off", // Allow global variables like __REACT_DEVTOOLS_GLOBAL_HOOK__ in generated files
      "no-unused-expressions": "off", // Allow unused expressions in generated files
      "@typescript-eslint/no-unused-expressions": "off", // Allow unused expressions in generated files
      "no-fallthrough": "off", // Allow fallthrough in switch statements (often in generated code)
      "no-redeclare": "off", // Allow redeclaration (often in generated code)
      "no-case-declarations": "off", // Allow declarations in case blocks (often in generated code)
      "no-func-assign": "off", // Allow function reassignments (often in generated code) (Note: This rule is from eslint, not @typescript-eslint)
      "no-empty": "off", // Allow empty blocks (often in generated code)
      "no-useless-escape": "off", // Allow useless escapes (often in generated code)
      "no-prototype-builtins": "off", // Allow Object.prototype method access (often in generated code)
      "no-cond-assign": "off", // Allow assignment in conditional expressions (often in generated code)
      "no-unused-private-class-members": "off", // Allow unused private class members (often in generated code)
      "valid-typeof": "off", // Allow invalid typeof comparisons (often in generated code)
      "getter-return": "off", // Allow getters without return (often in generated code)
      "no-misleading-character-class": "off", // Allow misleading character classes (often in generated code)
      "no-constant-binary-expression": "off", // Allow constant binary expressions (often in generated code)
      "no-unsafe-finally": "off", // Allow unsafe finally blocks (often in generated code)
      "no-this-alias": "off", // Allow aliasing 'this' (often in generated code)
    },
  },

  // 3. React specific configuration
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: pluginReact,
    },
    extends: [
      pluginReact.configs.flat.recommended,
    ],
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed for React 17+ JSX Transform
      "react/prop-types": "off", // Use TypeScript for prop types
    },
  },

  // 4. Prettier integration (always last to override conflicting rules)
  prettierConfig,
]);
