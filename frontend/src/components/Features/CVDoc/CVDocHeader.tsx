import React from 'react';
import i18next from 'i18next';
import { LOGO_IMAGES } from '@/configs/constants';
import type { CVDocProps } from './types';
import { formatDate } from './utils';
import { Image, Text, View } from './pdf';

type Props = Pick<CVDocProps, 'resume' | 'user'> & {
  styles: any;
};

const getAbsoluteUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return undefined;
};

const CVDocHeader = ({ resume, user, styles }: Props) => {
  const logoUrl = getAbsoluteUrl(LOGO_IMAGES.LOGO_WITH_BG);
  const avatarUrl = getAbsoluteUrl(resume?.user?.avatarUrl || user?.avatarUrl);

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          {logoUrl ? <Image style={styles.logo} src={logoUrl} /> : <View style={{ height: 0 }} />}
        </View>
        <View style={styles.avatarContainer}>
          {avatarUrl ? <Image style={styles.avatar} src={avatarUrl} /> : <View style={{ height: 0 }} />}
        </View>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{resume?.user?.fullName || user?.fullName || ''}</Text>
          <Text style={styles.title}>{resume?.title || ''}</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>{i18next.t('common:cvDoc.labels.email')} {user?.email || ''}</Text>
            <Text style={styles.contactItem}>{i18next.t('common:cvDoc.labels.phone')} {(user as { phone?: string } | undefined)?.phone || ''}</Text>
            <Text style={styles.contactItem}>{i18next.t('common:cvDoc.labels.updatedAt')} {formatDate(resume?.updateAt)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CVDocHeader;
