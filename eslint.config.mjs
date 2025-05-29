import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
     "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/prefer-as-const": "true", // Disable this rule
      "react-hooks/exhaustive-deps": "off",
      "no-console": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-restricted-syntax": "off",
      "no-shadow": "off",
      "no-empty-function": "off",
      "no-use-before-define": "off",
      "no-param-reassign": "off",
      "consistent-return": "off",
      "import/no-unresolved": "off",
      "import/prefer-default-export": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
    },
  },
];

export default eslintConfig;
