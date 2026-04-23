import React from 'react';
import { Box, Typography } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import { ABOUT_IMAGES, APP_NAME } from '../../../configs/constants';
import AboutFeatureCard from './AboutFeatureCard';
import AboutDetailSection from './AboutDetailSection';

const AboutUsPage = () => {
  const { t } = useTranslation('about');

  TabTitle(t('tabTitle', { appName: APP_NAME }));

  const features = [
    {
      title: t('features.careerTitle'),
      icon: WorkOutlineIcon,
      description: t('features.careerDesc'),
    },
    {
      title: t('features.cvTitle'),
      icon: PersonOutlineIcon,
      description: t('features.cvDesc'),
    },
    {
      title: t('features.locationTitle'),
      icon: LocationOnOutlinedIcon,
      description: t('features.locationDesc'),
    },
    {
      title: t('features.notificationTitle'),
      icon: NotificationsNoneIcon,
      description: t('features.notificationDesc'),
    },
  ];

  const sections = [
    {
      title: t('features.careerTitle'),
      descriptions: [t('features.careerDesc')],
      imageSrc: ABOUT_IMAGES.AI_SKILLS,
      reverse: false,
    },
    {
      title: t('cvProfileDetail.title'),
      descriptions: [t('cvProfileDetail.desc1'), t('cvProfileDetail.desc2'), t('cvProfileDetail.desc3')],
      imageSrc: ABOUT_IMAGES.CANDIDATE_CRM,
      reverse: true,
    },
    {
      title: t('aroundJobDetail.title'),
      descriptions: [t('aroundJobDetail.desc1'), t('aroundJobDetail.desc2'), t('aroundJobDetail.desc3')],
      imageSrc: ABOUT_IMAGES.COMPANY_VERIFICATION,
      reverse: false,
    },
    {
      title: t('notificationDetail.title'),
      descriptions: [t('notificationDetail.desc1'), t('notificationDetail.desc2'), t('notificationDetail.desc3')],
      imageSrc: ABOUT_IMAGES.LIVE_INTERVIEW,
      reverse: true,
    },
  ];

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', py: 5, px: 3 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            mb: 2,
            background: 'primary.main',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}
        >
          {t('heading')}
        </Typography>

        <Typography sx={{ maxWidth: '800px', margin: '0 auto', color: 'text.secondary', lineHeight: 1.8 }}>
          {t('description', { appName: APP_NAME })}
        </Typography>
      </Box>

      <Box sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <AboutFeatureCard title={feature.title} description={feature.description} icon={feature.icon} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Typography
        variant="h4"
        sx={{
          mb: 4,
          textAlign: 'center',
          background: 'primary.main',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
        }}
      >
        {t('mobileAppHeading', { appName: APP_NAME })}
      </Typography>

      {sections.map((section) => (
        <AboutDetailSection
          key={section.title}
          title={section.title}
          descriptions={section.descriptions}
          imageSrc={section.imageSrc}
          reverse={section.reverse}
        />
      ))}
    </Box>
  );
};

export default AboutUsPage;
