import React from 'react';
import i18next from 'i18next';
import type { CVDocEducation } from './types';
import { formatDate } from './utils';
import { Text, View } from './pdf';

type Props = {
  title: string;
  items?: CVDocEducation[];
  styles: any;
};

const CVDocEducationSection = ({ title, items, styles }: Props) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.section, styles.sectionPageBreak]} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((edu) => (
        <View key={`${edu?.trainingPlaceName || 'school'}-${edu?.degreeName || 'degree'}-${edu?.startDate || 'start'}-${edu?.completedDate || 'end'}`} style={styles.experienceItem}>
          <View style={styles.experienceHeader}>
            <View>
              <Text style={styles.experienceTitle}>{edu?.degreeName}</Text>
              <Text style={styles.experienceCompany}>{edu?.trainingPlaceName}</Text>
              <Text style={[styles.experienceCompany, { fontSize: 11 }]}>{i18next.t('common:cvDoc.labels.major')} {edu?.major}</Text>
            </View>
            <Text style={styles.experienceDate}>
              {formatDate(edu?.startDate)} - {formatDate(edu?.completedDate)}
            </Text>
          </View>
          {edu?.description && <Text style={styles.experienceDesc}>{edu?.description}</Text>}
        </View>
      ))}
    </View>
  );
};

export default CVDocEducationSection;
