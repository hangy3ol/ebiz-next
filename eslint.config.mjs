import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginImport from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),

  {
    // import 정렬 룰 추가
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js 내장 모듈 (예: fs, path)
            'external', // 외부 패키지 (예: react, next, axios, @mui 등)
            'internal', // 내부 alias 모듈 (예: @/ 또는 src/)
            ['parent', 'sibling', 'index'], // 상대 경로 import
          ],
          pathGroups: [
            {
              pattern: '@/**', // @/로 시작하는 내부 경로는 internal 그룹에 포함
              group: 'internal',
              position: 'after', // external 뒤에 위치
            },
          ],
          alphabetize: {
            order: 'asc', // 알파벳순 정렬
            caseInsensitive: true, // 대소문자 구분 없이 정렬
          },
          'newlines-between': 'always', // 그룹 간 한 줄 띄우기
        },
      ],
    },
  },
];

export default eslintConfig;
