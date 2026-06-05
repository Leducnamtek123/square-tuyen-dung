import fs from 'fs';
import path from 'path';

import { BACKEND_CHOICE_VALUES } from '../../../../utils/backendChoiceValues';
import { createEmptyJobNotificationFormData } from '../types';

describe('Admin JobNotificationsPage frequency contract', () => {
  it('uses a backend-supported frequency when opening the add form', () => {
    const defaultFrequency = createEmptyJobNotificationFormData().frequency;

    expect(BACKEND_CHOICE_VALUES.frequencyNotification).toContain(defaultFrequency);
    expect(defaultFrequency).not.toBe(7);
  });

  it('does not render stale legacy frequency options that the backend rejects', () => {
    const dialogSource = fs.readFileSync(
      path.join(__dirname, '../JobNotificationFormDialog.tsx'),
      'utf8',
    );

    expect(dialogSource).not.toContain('value={7}');
    expect(dialogSource).not.toContain('value={30}');
  });

  it('does not fallback edit state to the stale legacy weekly value', () => {
    const pageSource = fs.readFileSync(
      path.join(__dirname, '../index.tsx'),
      'utf8',
    );

    expect(pageSource).not.toContain('?? 7');
  });
});
