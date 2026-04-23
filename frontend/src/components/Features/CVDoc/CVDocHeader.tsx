import React from 'react';
import { Image, Text, View } from '@react-pdf/renderer';
import i18next from 'i18next';
import { LOGO_IMAGES } from '@/configs/constants';
import type { CVDocProps } from './types';
import { formatDate } from './utils';

type Props = Pick<CVDocProps, 'resume' | 'user'> & {
  styles: any;
};

const CVDocHeader = ({ resume, user, styles }: Props) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <Image style={styles.logo} src={LOGO_IMAGES.LOGO_WITH_BG} />
        </View>
        <View style={styles.avatarContainer}>
          <Image style={styles.avatar} src={resume?.user?.avatarUrl || '/images/default_avatar.png'} />
        </View>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{resume?.user?.fullName}</Text>
          <Text style={styles.title}>{resume?.title}</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>{i18next.t('common:cvDoc.labels.email')} {user?.email}</Text>
            <Text style={styles.contactItem}>{i18next.t('common:cvDoc.labels.phone')} {(user as { phone?: string } | undefined)?.phone}</Text>
            <Text style={styles.contactItem}>{i18next.t('common:cvDoc.labels.updatedAt')} {formatDate(resume?.updateAt)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CVDocHeader;
