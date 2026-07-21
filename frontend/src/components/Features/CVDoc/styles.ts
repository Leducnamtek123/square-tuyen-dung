import { StyleSheet } from './pdf';

export const DEFAULT_THEME_COLOR = '#140861';

export const createCVDocStyles = (themeColor: string) =>
  StyleSheet.create({
    page: {
      padding: 0,
      backgroundColor: '#FFFFFF',
      fontFamily: 'Roboto',
    },
    firstPage: {
      marginTop: 0,
    },
    header: {
      padding: '40 40 25 40',
      backgroundColor: themeColor,
      color: '#FFFFFF',
      position: 'relative',
    },
    headerContent: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 30,
    },
    avatarContainer: {
      width: 120,
      height: 120,
      borderRadius: '50%',
      backgroundColor: '#FFFFFF',
      padding: 3,
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover',
    },
    nameSection: {
      flex: 1,
    },
    name: {
      fontSize: 28,
      fontWeight: 900,
      textTransform: 'uppercase',
      marginBottom: 5,
    },
    title: {
      fontSize: 18,
      fontWeight: 500,
      opacity: 0.9,
    },
    contactInfo: {
      marginTop: 20,
      flexDirection: 'row',
      gap: 40,
    },
    contactItem: {
      fontSize: 12,
      opacity: 0.9,
    },
    body: {
      padding: '25 40 40 40',
      fontSize: 12,
    },
    section: {
      marginBottom: 25,
      breakInside: 'avoid',
      paddingTop: 0,
      minPresenceAhead: 100,
    },
    sectionPageBreak: {
      marginTop: 30,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: themeColor,
      marginBottom: 15,
      paddingBottom: 6,
      borderBottom: 1,
      borderBottomColor: themeColor,
    },
    infoGrid: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 20,
    },
    infoItem: {
      width: '47%',
      flexDirection: 'row',
      gap: 10,
    },
    infoLabel: {
      color: themeColor,
      fontWeight: 500,
      width: 100,
      minWidth: 100,
    },
    infoValue: {
      flex: 1,
    },
    experienceItem: {
      marginBottom: 15,
      breakInside: 'avoid',
    },
    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    experienceTitle: {
      fontWeight: 700,
      color: themeColor,
      marginBottom: 3,
    },
    experienceCompany: {
      fontWeight: 500,
      marginBottom: 2,
    },
    experienceDate: {
      fontStyle: 'italic',
      color: '#666666',
      fontSize: 11,
    },
    experienceDesc: {
      marginTop: 6,
      lineHeight: 1.5,
    },
    skillsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    skillItem: {
      backgroundColor: `${themeColor}10`,
      padding: '6 12',
      borderRadius: 4,
      color: themeColor,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    languageName: {
      width: 120,
      fontWeight: 500,
    },
    languageLevel: {
      flex: 1,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    levelDot: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: themeColor,
    },
    levelDotEmpty: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: themeColor,
    },
    infoGridWrapper: {
      breakInside: 'avoid',
    },
    skillsWrapper: {
      breakInside: 'avoid',
    },
    languageWrapper: {
      breakInside: 'avoid',
    },
    logoContainer: {
      position: 'absolute',
      top: -25,
      right: 0,
      width: 50,
      height: 50,
      backgroundColor: '#FFFFFF',
      padding: 4,
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: '42px',
      height: '42px',
    },
  });
