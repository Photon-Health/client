import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import solidPlugin from 'eslint-plugin-solid/configs/typescript';
import globals from 'globals';

export default tseslint.config(
  // Global ignores (replaces .eslintignore + ignorePatterns)
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'apps/app/src/gql/**',
      '**/__generated__/**',
      '**/*.test.tsx',
      '**/*.test.ts',
      '**/*.stories.tsx',
      '**/storybook-static/*',
      '**/playwright-report/**',
      '**/coverage/**',
    ],
  },

  // Base: eslint recommended + typescript-eslint recommended
  js.configs.recommended,
  tseslint.configs.recommended,

  // Global settings for all files
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        require: 'readonly',
        process: 'readonly',
        google: 'readonly',
        Keyframe: 'readonly',
        PropertyIndexedKeyframes: 'readonly',
        KeyframeAnimationOptions: 'readonly',
        GeolocationPosition: 'readonly',
        __COMMIT_HASH__: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-template-curly-in-string': 'error',
      'prefer-const': ['error'],
      'no-undef': 'off', // TypeScript handles this
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // React apps (apps/app, apps/patient)
  {
    files: ['apps/app/**/*.{ts,tsx}', 'apps/patient/**/*.{ts,tsx}'],
    ...reactPlugin.configs.flat.recommended,
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/function-component-definition': 'off',
      'react/no-unescaped-entities': 'off',
      'no-empty': 'off',
      'no-nested-ternary': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-namespace': 'off',
    },
  },

  // Solid packages (components, elements)
  {
    files: [
      'packages/components/**/*.{ts,tsx}',
      'packages/elements/**/*.{ts,tsx}',
    ],
    ...solidPlugin,
  },
);
