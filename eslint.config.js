import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import * as nodeDependenciesPlugin from 'eslint-plugin-node-dependencies';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintRule from './eslint-rule/index.cjs';

export default tseslint.config([
  globalIgnores(['**/dist/**', '**/*.d.ts', 'test/**/case*/']),
  ...nodeDependenciesPlugin.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      // 全局变量：https://eslint.org/docs/latest/use/configure/language-options
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...eslintRule,
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-unresolved': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-unused-vars': 'off',
    },
  },
  // 配置格式化脚本时 先用 prettier 格式化，再用 eslint 格式化一遍
  // 关闭所有不必要的或可能与 Prettier 冲突的规则。请注意，此配置仅关闭规则， 因此只有将其与其他配置一起使用才有意义。
  eslintConfigPrettier,
]);
