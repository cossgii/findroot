import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginNext from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  {
    ignores: [
      '.next/**',
      'generated/**',
      'node_modules/**',
      'pnpm-lock.yaml',
      'postcss.config.js',
      'tailwind.config.ts',
      'next-env.d.ts',
      'tsconfig.json',
      'eslint.config.mjs',
      'next.config.js',
      'package.json',
      'prisma/**',
      'lib/**',
      'app/api/**',
      'src/services/**',
      'src/stores/**',
      'src/utils/**',
      'src/components/styles/**',
      '__mocks__/fileMock.js',
      '__mocks__/@auth/prisma-adapter.js',
      'babel.config.js',
      'jest.config.js',
      'jest.setup.js',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      js,
      '@typescript-eslint': tseslint.plugin,
    },
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-fallthrough': 'off',
      'no-redeclare': 'off',
      'no-case-declarations': 'off',
      'no-func-assign': 'off',
      'no-empty': 'off',
      'no-useless-escape': 'off',
      'no-prototype-builtins': 'off',
      'no-cond-assign': 'off',
      'no-unused-private-class-members': 'off',
      'valid-typeof': 'off',
      'getter-return': 'off',
      'no-misleading-character-class': 'off',
      'no-constant-binary-expression': 'off',
      'no-unsafe-finally': 'off',
      'no-this-alias': 'off',
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: pluginReact,
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      ...pluginNext.configs.recommended.rules,
      '@next/next/no-img-element': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettierConfig,
]);
