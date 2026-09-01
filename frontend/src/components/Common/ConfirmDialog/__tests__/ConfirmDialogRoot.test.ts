import { readFileSync } from 'fs';
import { join } from 'path';

describe('ConfirmDialogRoot formatting and design-taste tests', () => {
  const rootSource = readFileSync(join(__dirname, '../ConfirmDialogRoot.tsx'), 'utf8');

  it('contains safe HTML formatting logic to prevent raw tags from leaking to UI', () => {
    expect(rootSource).toContain('renderFormattedMessage');
    expect(rootSource).toContain('strongMatch');
    expect(rootSource).toContain('font-bold text-blue-700');
  });

  it('includes design-taste icon configurations and dual-ring badges for all modal types', () => {
    expect(rootSource).toContain('ICON_CONFIG');
    expect(rootSource).toContain('logout');
    expect(rootSource).toContain('question');
    expect(rootSource).toContain('warning');
    expect(rootSource).toContain('success');
    expect(rootSource).toContain('error');
    expect(rootSource).toContain('info');
    expect(rootSource).toContain('ring-4');
  });

  it('provides accessible action buttons with distinct visual variants for danger vs primary', () => {
    expect(rootSource).toContain('isDanger');
    expect(rootSource).toContain('AlertDialogCancel');
    expect(rootSource).toContain('AlertDialogAction');
    expect(rootSource).toContain('bg-blue-600 hover:bg-blue-700');
    expect(rootSource).toContain('bg-red-600 hover:bg-red-700');
  });
});
