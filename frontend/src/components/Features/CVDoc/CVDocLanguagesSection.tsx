import React from 'react';
import i18next from 'i18next';
import type { CVDocLanguageSkill } from './types';
import { LanguageLevelDots } from './utils';
import { Text, View } from './pdf';

type Props = {
  title: string;
  items?: CVDocLanguageSkill[];
  styles: any;
};

const CVDocLanguagesSection = ({ title, items, styles }: Props) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.section, styles.sectionPageBreak]} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.languageWrapper}>
        {items.map((lang) => (
          <View key={`${lang?.language || 'language'}-${lang?.level || 'level'}`} style={styles.languageItem}>
            <Text style={styles.languageName}>{i18next.t('common:cvDoc.labels.languagePrefix')}{lang?.language}</Text>
            <View style={styles.languageLevel}>
              <LanguageLevelDots level={lang?.level} levelDot={styles.levelDot} levelDotEmpty={styles.levelDotEmpty} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CVDocLanguagesSection;
