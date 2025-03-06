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
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_", // Ignora parâmetros que começam com '_'
          varsIgnorePattern: "^_", // Ignora variáveis que começam com '_'
          args: "none", // Ignora todos os parâmetros não utilizados
          vars: "local", // Ignora variáveis locais não utilizadas
        },
      ],
    },
  },
];

export default eslintConfig;
