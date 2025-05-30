import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores([
        "config/",
        "node_modules/",
        "coverage/",
        "docs/"
    ]),
    {
        files: ["scripts/**/*.js"],
        plugins: { js, },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser },
        rules: {
            // Enforce camelcase for variable naming
            "camelcase": ["error", { properties: "always" }],
            // Enforce string templating instead of concatenation
            "prefer-template": ["error"],
            // Enforce type-safe === instead of ==
            "eqeqeq": ["error", "always"],
            // Prefer const whenever possible
            "prefer-const": "error"
        },
    },

    {
        // Same rules, but also make it not mad at jest
        files: ["__tests__/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.jest,
            },
        },
        rules: {
            "camelcase": ["error", { properties: "always" }],
            "prefer-template": ["error"],
            "eqeqeq": ["error", "always"],
            "prefer-const": "error"
        },
    },
]);
