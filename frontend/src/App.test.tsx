/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('should be importable', async () => {
    // Verify the App module can be imported without errors
    const module = await import('./App');
    expect(module.default).toBeDefined();
  });
});
