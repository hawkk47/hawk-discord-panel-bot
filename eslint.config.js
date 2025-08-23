// ESLint flat config (Node 20+)
import js from "@eslint/js";
import pluginN from "eslint-plugin-n";
import pluginPromise from "eslint-plugin-promise";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        module: "readonly",
        __dirname: "readonly",
      },
    },
    plugins: {
      n: pluginN,
      promise: pluginPromise,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "n/no-missing-import": "off",
      "promise/always-return": "off",
      "promise/no-nesting": "off",
      "promise/no-promise-in-callback": "off",
      "promise/no-callback-in-promise": "off"
    },
    ignores: ["node_modules/**", "coverage/**"]
  }
];
