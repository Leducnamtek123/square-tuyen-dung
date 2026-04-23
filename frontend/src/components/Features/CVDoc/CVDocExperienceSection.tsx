import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import i18next from 'i18next';
import type { CVDocExperience } from './types';
import { formatDate } from './utils';

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
      {items.map((exp, index) => (
        <View key={`${exp?.companyName || 'company'}-${exp?.jobName || 'job'}-${index}`} style={styles.experienceItem}>
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
