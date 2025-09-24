import { fileURLToPath } from "url";
import path from "path";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["eslint.config.js", "vite.config.ts"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },

    plugins: {
      "@typescript-eslint": tseslint,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },

												
												
	
    rules: {
      "@typescript-eslint/dot-notation": "off",
      "react/react-in-jsx-scope": "off",
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
			
					   
	 
   
  
