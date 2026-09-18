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

  it('ensures alert-dialog opens as a clean centered popup without sliding from the top-left corner', () => {
    const alertDialogSource = readFileSync(join(__dirname, '../../../ui/alert-dialog.tsx'), 'utf8');
    expect(alertDialogSource).toContain('fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2');
    expect(alertDialogSource).toContain('z-[2000]');
    expect(alertDialogSource).toContain('flex flex-col');
    expect(alertDialogSource).toContain('zoom-in-95');
    expect(alertDialogSource).not.toContain('slide-in-from-left');
    expect(alertDialogSource).not.toContain('slide-in-from-top');
    expect(alertDialogSource).not.toContain('slide-out-to-left');
    expect(alertDialogSource).not.toContain('slide-out-to-top');
  });

  it('supports prompt input rendering with Enter key handling and autofocus', () => {
    expect(rootSource).toContain('input &&');
    expect(rootSource).toContain('handleConfirm();');
    expect(rootSource).toContain('inputRef');
  });
});

