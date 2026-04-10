import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'jest-transform-stub',
    '\\.(svg|png|jpg|jpeg|gif|webp)$': 'jest-transform-stub'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(query-string|decode-uri-component|split-on-first|filter-obj)/)'
  ],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
    }],
  },
};

export default config;
