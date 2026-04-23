import React from 'react';
import i18next from 'i18next';
import { salaryString } from '@/utils/customData';
import type { ExtendedResume } from './types';
import { Text, View } from './pdf';

type Props = {
  resume: ExtendedResume;
  styles: any;
};

const CVDocInfoSection = ({ resume, styles }: Props) => {
  return (
    <View style={[styles.section, styles.sectionPageBreak]} wrap={false}>
      <Text style={styles.sectionTitle}>{i18next.t('common:cvDoc.sections.generalInfo')}</Text>
      <View style={styles.infoGridWrapper}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{i18next.t('common:cvDoc.labels.position')}</Text>
            <Text style={styles.infoValue}>{resume?.positionChooseData?.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{i18next.t('common:cvDoc.labels.experience')}</Text>
            <Text style={styles.infoValue}>{resume?.experienceChooseData?.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{i18next.t('common:cvDoc.labels.education')}</Text>
            <Text style={styles.infoValue}>{resume?.academicLevelChooseData?.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{i18next.t('common:cvDoc.labels.salary')}</Text>
            <Text style={styles.infoValue}>{salaryString(resume.salaryMin || undefined, resume.salaryMax || undefined)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{i18next.t('common:cvDoc.labels.workplace')}</Text>
            <Text style={styles.infoValue}>{resume?.typeOfWorkplaceChooseData?.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{i18next.t('common:cvDoc.labels.jobType')}</Text>
            <Text style={styles.infoValue}>{resume?.jobTypeChooseData?.name}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CVDocInfoSection;
