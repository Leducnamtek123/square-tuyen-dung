import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import type { CVDocAdvancedSkill } from './types';

type Props = {
  title: string;
  items?: CVDocAdvancedSkill[];
  styles: any;
};

const CVDocSkillsSection = ({ title, items, styles }: Props) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.section, styles.sectionPageBreak]} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.skillsWrapper}>
        <View style={styles.skillsGrid}>
          {items.map((skill, index) => (
            <View key={`${skill?.name || 'skill'}-${index}`} style={styles.skillItem}>
              <Text>{skill?.name} ({skill?.level}/5)</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CVDocSkillsSection;
