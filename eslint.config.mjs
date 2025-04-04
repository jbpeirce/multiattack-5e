import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
// eslint-disable-next-line import/default
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import ember from "eslint-plugin-ember";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    ignores: [
      "**/blueprints/*/files/",
      "**/dist/",
      "**/coverage/",
      "!.*",
      ".*/",
      "**/.node_modules.ember-try/",
      "**/.*",
    ],
  },

  {
    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:ember/recommended",
        "plugin:prettier/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ),
    ),

    plugins: {
      ember: fixupPluginRules(ember),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 2017,
      sourceType: "module",
    },

    settings: {
      "import/resolver": {
        typescript: true,

        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },

    rules: {
      "@typescript-eslint/no-var-requires": 0,
      semi: [2, "always"],

      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],

      "sort-imports": [
        "error",
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
          allowSeparatedGroups: true,
        },
      ],

      "import/no-unresolved": [
        2,
        {
          ignore: ["^@ember"],
        },
      ],

      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["sibling", "parent"],
            "index",
            "unknown",
          ],

          "newlines-between": "always",

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);
