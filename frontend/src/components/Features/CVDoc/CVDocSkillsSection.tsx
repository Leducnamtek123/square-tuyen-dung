import React from 'react';
import type { CVDocAdvancedSkill } from './types';
import { Text, View } from './pdf';

type Props = {
  title: string;
  items?: CVDocAdvancedSkill[];
  styles: any;
};

const CVDocSkillsSection = ({ title, items, styles }: Props) => {
  if (!items || items.length === 0) return <View style={{ height: 0 }} />;

  return (
    <View style={[styles.section, styles.sectionPageBreak]} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.skillsWrapper}>
        <View style={styles.skillsGrid}>
          {items.map((skill) => (
            <View key={String(skill?.id)} style={styles.skillItem}>
              <Text>{skill?.name || ''} ({skill?.level ?? 0}/5)</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CVDocSkillsSection;
