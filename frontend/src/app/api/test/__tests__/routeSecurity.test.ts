import { existsSync } from 'fs';
import { join } from 'path';

describe('debug API route security', () => {
  it('does not publish the /api/test debug route', () => {
    expect(existsSync(join(__dirname, '../route.ts'))).toBe(false);
  });
});
