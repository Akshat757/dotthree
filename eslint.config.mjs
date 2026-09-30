import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'coverage/**',
      'public/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
      '*.config.*',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...jsxA11y.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
      // SRS §11.3 rule 6 — no raw <img>; use <Img>.
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='img']",
          message: 'Use the <Img> component (src/components/ui/img.tsx) — never a raw <img>.',
        },
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message:
            'dangerouslySetInnerHTML is permitted only in src/components/mdx/** and src/lib/seo/** (JSON-LD).',
        },
      ],
      // SRS §5.1 / §10 — components never import concrete adapters.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/adapters/impl/**', '@/lib/adapters/impl/**'],
              message: 'Import adapters only from "@/lib/adapters" (src/lib/adapters/index.ts).',
            },
          ],
        },
      ],
      '@next/next/no-img-element': 'error',
    },
  },
  {
    // The single legal raw <img> site.
    files: ['src/components/ui/img.tsx'],
    rules: { 'no-restricted-syntax': 'off', '@next/next/no-img-element': 'off' },
  },
  {
    // The single legal import site for concrete adapters, plus their own tests.
    files: ['src/lib/adapters/index.ts', 'src/lib/adapters/impl/**/*.ts', 'src/lib/adapters/**/*.test.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // Repo-authored MDX + JSON-LD are the only sanctioned innerHTML sites.
    files: ['src/components/mdx/**/*.tsx', 'src/lib/seo/**/*.tsx', 'src/components/seo/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='img']",
          message: 'Use the <Img> component.',
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.ts', 'e2e/**/*.ts', '**/*.test.{ts,tsx}', 'vitest.setup.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  prettier,
);
