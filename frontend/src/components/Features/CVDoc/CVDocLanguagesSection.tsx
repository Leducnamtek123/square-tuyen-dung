import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import i18next from 'i18next';
import type { CVDocLanguageSkill } from './types';
import { renderLanguageLevel } from './utils';

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
        {items.map((lang, index) => (
          <View key={`${lang?.language || 'language'}-${index}`} style={styles.languageItem}>
            <Text style={styles.languageName}>{i18next.t('common:cvDoc.labels.languagePrefix')}{lang?.language}</Text>
            <View style={styles.languageLevel}>
              {renderLanguageLevel(lang?.level, styles.levelDot, styles.levelDotEmpty)}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CVDocLanguagesSection;
