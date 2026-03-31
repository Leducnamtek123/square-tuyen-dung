import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Paper, 
  Stack, 
  Typography, 
  Skeleton, 
  Box, 
  alpha, 
  useTheme 
} from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { useEmployerGeneralStatistics } from '../hooks/useEmployerQueries';

interface StatItemProps {
  title: string;
  value: number | undefined;
  color: string;
  Icon: React.ElementType;
  loading: boolean;
}

const StatItem = ({ title, value, color, Icon, loading }: StatItemProps) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.5),
        boxShadow: (theme) => theme.customShadows?.z1,
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows?.z8,
        }
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: alpha(color, 0.12),
              color: color,
            }}
          >
            <Icon sx={{ fontSize: 26 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.secondary', lineHeight: 1.2 }}>
            {title}
          </Typography>
        </Stack>

        {loading ? (
          <Skeleton width="60%" height={48} variant="text" sx={{ borderRadius: 1 }} />
        ) : (
          <Typography 
            sx={{ 
                color: 'text.primary', 
                fontSize: '2.5rem', 
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-1px'
            }}
          >
            {value?.toLocaleString() ?? 0}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

const EmployerQuantityStatistics = () => {

  const { t } = useTranslation('employer');

  const { data, isLoading } = useEmployerGeneralStatistics();

  return (

    <Grid container spacing={3}>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 6,

          lg: 3

        }}>

        <StatItem

          title={t('statItem.title.totaljobposts', 'Total Job Posts')}

          value={data?.totalJobPost}

          color="#3f8600"

          Icon={DescriptionOutlinedIcon}

          loading={isLoading}

        />

      </Grid>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 6,

          lg: 3

        }}>

        <StatItem

          title={t('statItem.title.pendingjobposts', 'Pending Job Posts')}

          value={data?.totalJobPostingPendingApproval}

          color="#ff9800"

          Icon={AccessTimeOutlinedIcon}

          loading={isLoading}

        />

      </Grid>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 6,

          lg: 3

        }}>

        <StatItem

          title={t('statItem.title.expiredjobposts', 'Expired Job Posts')}

          value={data?.totalJobPostExpired}

          color="#cf1322"

          Icon={HighlightOffOutlinedIcon}

          loading={isLoading}

        />

      </Grid>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 6,

          lg: 3

        }}>

        <StatItem

          title={t('statItem.title.totalapplications', 'Total Applications')}

          value={data?.totalApply}

          color="#00b0ff"

          Icon={GroupsOutlinedIcon}

          loading={isLoading}

        />

      </Grid>

    </Grid>

  );

};

export default EmployerQuantityStatistics;
