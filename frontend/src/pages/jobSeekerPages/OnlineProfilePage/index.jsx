/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';

import { Box, Card, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import PersonPinOutlinedIcon from '@mui/icons-material/PersonPinOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ThumbsUpDownOutlinedIcon from '@mui/icons-material/ThumbsUpDownOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';

import { TabTitle } from '../../../utils/generalFunction';
import PersonalInfoCard from '../../components/jobSeekers/PersonalInfoCard';
import GeneralInfoCard from '../../components/jobSeekers/GeneralInfoCard';
import ExperienceDetailCard from '../../components/jobSeekers/ExperienceDetailCard';
import EducationDetailCard from '../../components/jobSeekers/EducationDetailCard';
import CertificateCard from '../../components/jobSeekers/CertificateCard';
import LanguageSkillCard from '../../components/jobSeekers/LanguageSkillCard';
import AdvancedSkillCard from '../../components/jobSeekers/AdvancedSkillCard';

const items = [
  { id: 0, value: 'Personal Information', icon: <PersonPinOutlinedIcon /> },
  { id: 1, value: 'General Information', icon: <WorkOutlineOutlinedIcon /> },
  { id: 2, value: 'Work Experience', icon: <ReceiptLongOutlinedIcon /> },
  { id: 3, value: 'Education Information', icon: <SchoolOutlinedIcon /> },
  { id: 4, value: 'Certificates', icon: <ThumbsUpDownOutlinedIcon /> },
  { id: 5, value: 'Language Skills', icon: <TranslateOutlinedIcon /> },
  { id: 6, value: 'Professional Skills', icon: <AutoFixHighOutlinedIcon /> },
];

const OnlineProfilePage = () => {
  TabTitle("Update Online Profile")
  const refs = React.useRef([]);

  const handleClickScroll = (index) => {
    refs.current[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <Box sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 7,
            lg: 9,
            xl: 9
          }}>
          <Stack spacing={3}>
            <Card 
              ref={(el) => (refs.current[0] = el)}
              sx={{
                '&:hover': {
                  boxShadow: (theme) => theme.customShadows.card,
                  borderColor: 'primary.main',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <PersonalInfoCard title="Personal Information" />
            </Card>
            <Card  ref={(el) => (refs.current[1] = el)}>
              <GeneralInfoCard title="General Information" />
            </Card>
            <Card ref={(el) => (refs.current[2] = el)}>
              <ExperienceDetailCard title="Work Experience" />
            </Card>
            <Card ref={(el) => (refs.current[3] = el)}>
              <EducationDetailCard title="Education Information" />
            </Card>
            <Card ref={(el) => (refs.current[4] = el)}>
              <CertificateCard title="Certificates" />
            </Card>
            <Card ref={(el) => (refs.current[5] = el)}>
              <LanguageSkillCard title="Language Skills" />
            </Card>
            <Card ref={(el) => (refs.current[6] = el)}>
              <AdvancedSkillCard title="Professional Skills" />
            </Card>
          </Stack>
        </Grid>
        <Grid
          sx={{
            display: {
              xs: 'none',
              sm: 'none', 
              md: 'block'
            }
          }}
          size={{
            xs: 12,
            sm: 12,
            md: 5,
            lg: 3,
            xl: 3
          }}>
          <Stack
            spacing={2}
            sx={{
              position: 'sticky',
              top: 80,
            }}
          >
            <Card 
              sx={{
                p: 3,
                background: (theme) => theme.palette.primary.gradient,
                color: 'white',
                border: 'none'
              }}
            >
              <Stack spacing={2}>
                <Typography 
                  variant="h6" 
                  sx={{
                    fontWeight: 600,
                    color: 'inherit'
                  }}
                >
                  Your Online Profile
                </Typography>

                <List sx={{ width: '100%' }}>
                  {items.map((item) => (
                    <ListItem
                      key={item.id}
                      disablePadding
                      sx={{ mb: 1 }}
                    >
                      <ListItemButton
                        onClick={() => handleClickScroll(item.id)}
                        sx={{
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.value}
                          slotProps={{
                            primary: {
                              fontSize: '0.9rem',
                              fontWeight: 500
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OnlineProfilePage;
