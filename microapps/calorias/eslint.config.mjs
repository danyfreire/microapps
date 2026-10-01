import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Archivos sin contexto de módulos (service worker y script de build):
    "public/sw.js",
    "scripts/**",
    "coverage/**",
  ]),
  {
    rules: {
      // Permitir parámetros intencionalmente no usados (prefijo _) y
      // el patrón de descarte en destructuring rest ({ day: _day, ...meal }).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
]);

export default eslintConfig;
