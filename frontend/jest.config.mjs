/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^query-string$': '<rootDir>/src/__mocks__/queryString.cjs',
    '\\.(css|less|scss|sass)$': 'jest-transform-stub',
    '\\.(svg|png|jpg|jpeg|gif|webp)$': 'jest-transform-stub'
  },
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
    }],
  },
};

export default config;
