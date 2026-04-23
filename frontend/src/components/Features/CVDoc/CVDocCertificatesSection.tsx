import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import i18next from 'i18next';
import type { CVDocCertificate } from './types';
import { formatDate } from './utils';

type Props = {
  title: string;
  items?: CVDocCertificate[];
  styles: any;
};

const CVDocCertificatesSection = ({ title, items, styles }: Props) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.section, styles.sectionPageBreak]} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((cert, index) => (
        <View key={`${cert?.name || 'cert'}-${cert?.trainingPlace || 'place'}-${index}`} style={styles.experienceItem}>
          <View style={styles.experienceHeader}>
            <View>
              <Text style={styles.experienceTitle}>{cert?.name}</Text>
              <Text style={styles.experienceCompany}>{cert?.trainingPlace}</Text>
            </View>
            <Text style={styles.experienceDate}>
              {formatDate(cert?.startDate)}
              {cert?.expirationDate ? ` - ${formatDate(cert?.expirationDate)}` : ` - ${i18next.t('common:cvDoc.labels.noExpiration')}`}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default CVDocCertificatesSection;
