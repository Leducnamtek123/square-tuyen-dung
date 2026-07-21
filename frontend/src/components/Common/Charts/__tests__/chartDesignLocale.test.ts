import {
  createCartesianOptions,
  createDoughnutOptions,
} from '../chartDesign';

const theme = {
  typography: {
    fontFamily: 'Arial',
  },
  customShadows: {},
} as any;

describe('chartDesign locale formatting', () => {
  it('formats cartesian axis and tooltip values with the requested language', () => {
    const enOptions = createCartesianOptions(theme, { language: 'en' } as any) as any;
    const viOptions = createCartesianOptions(theme, { language: 'vi' } as any) as any;

    expect(enOptions.scales.y.ticks.callback(1234.5)).toBe('1,234.5');
    expect(viOptions.scales.y.ticks.callback(1234.5)).toBe('1.234,5');

    expect(enOptions.plugins.tooltip.callbacks.label({
      dataset: { label: 'Applications' },
      parsed: { y: 1234.5 },
    })).toBe('Applications: 1,234.5');
  });

  it('formats doughnut tooltip values with the requested language', () => {
    const options = createDoughnutOptions(theme, 'en') as any;

    expect(options.plugins.tooltip.callbacks.label({
      label: 'Completed',
      parsed: 1234.5,
      dataset: { data: [1234.5, 1000] },
    })).toBe('Completed: 1,234.5 (55%)');
  });
});
