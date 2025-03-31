import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

/** @type {import("eslint").Linter.Config[]} */
export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: {
            import: importPlugin,
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "jsx-a11y": jsxA11yPlugin,
        },
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: "module",
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
                ecmaFeatures: { jsx: true },
            },
            globals: { React: "readonly" },
        },
        settings: {
            react: { version: "detect" },
            "import/resolver": {
                typescript: {
                    project: "./tsconfig.json",
                    alwaysTryTypes: true,
                    bun: true,
                },
            },
        },
        rules: {
            // React hooks rules
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            // Import rules
            "import/no-unresolved": "error",
            "import/named": "error",
            "import/default": "error",
            "import/namespace": "error",
            "import/order": [
                "error",
                {
                    groups: [
                        "builtin",
                        "external",
                        "internal",
                        "parent",
                        "sibling",
                        "index",
                    ],
                    "newlines-between": "always",
                    alphabetize: { order: "asc", caseInsensitive: true },
                },
            ],
            "import/no-duplicates": "error",

            // Accessibility rules
            "jsx-a11y/alt-text": "error",
            "jsx-a11y/anchor-has-content": "error",
            "jsx-a11y/anchor-is-valid": "error",
            "jsx-a11y/aria-props": "error",
            "jsx-a11y/aria-role": "error",

            // Error prevention rules
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "no-debugger": "error",
            "no-alert": "error",
            "no-var": "error",
            "prefer-const": "error",
        },
    },
    {
        files: ["src/**/*.{ts,tsx,json,md}"],
        plugins: { prettier: prettierPlugin },
        rules: { ...prettier.rules, "prettier/prettier": "error" },
    },
];
