import React from 'react';
import i18next from 'i18next';
import type { CVDocExperience } from './types';
import { formatDate } from './utils';
import { Text, View } from './pdf';

type Props = {
  title: string;
  items?: CVDocExperience[];
  styles: any;
};

const CVDocExperienceSection = ({ title, items, styles }: Props) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.section, styles.sectionPageBreak]} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((exp) => (
        <View key={`${exp?.companyName || 'company'}-${exp?.jobName || 'job'}-${exp?.startDate || 'start'}-${exp?.endDate || 'end'}`} style={styles.experienceItem}>
          <View style={styles.experienceHeader}>
            <View>
              <Text style={styles.experienceTitle}>{exp?.jobName}</Text>
              <Text style={styles.experienceCompany}>{exp?.companyName}</Text>
            </View>
            <Text style={styles.experienceDate}>
              {formatDate(exp?.startDate)} - {formatDate(exp?.endDate) || i18next.t('common:cvDoc.labels.present')}
            </Text>
          </View>
          <Text style={styles.experienceDesc}>{exp?.description}</Text>
        </View>
      ))}
    </View>
  );
};

export default CVDocExperienceSection;
