import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

// Enforces the "Asynchronous programming and Promises" section of
// docs/typescript-programming-style-guide.md. The rules need type information,
// so they apply to the TypeScript projects only (not to this config file).
export default defineConfig(
    {
        ignores: [
            "dist",
            ".generated",
        ],
    },
    {
        files: ["**/*.{ts,tsx}"],
        extends: [tseslint.configs.base],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        linterOptions: {
            reportUnusedDisableDirectives: "error",
        },
        rules: {
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-misused-promises": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/return-await": ["error", "in-try-catch"],
            "@typescript-eslint/only-throw-error": "error",
            "@typescript-eslint/prefer-promise-reject-errors": "error",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
        },
    },
);
