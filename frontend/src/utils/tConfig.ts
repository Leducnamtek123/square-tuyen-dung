import i18n from '../i18n';

export const tConfig = (val: string | undefined | null): string => {
  if (!val) return '';
  return typeof val === 'string' ? i18n.t(`choices.${val}`, { ns: 'common', defaultValue: val }) : String(val);
};
