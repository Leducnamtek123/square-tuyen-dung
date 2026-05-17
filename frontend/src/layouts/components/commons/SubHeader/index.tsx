'use client';

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppBar, Box, Chip, Container, IconButton, Stack, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl } from '@fortawesome/free-solid-svg-icons';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import commonService from '../../../../services/commonService';
import SubHeaderDialog from '../SubHeaderDialog';
import { buildJobPostFilter, searchJobPost } from '../../../../redux/filterSlice';
import { ROUTES } from '../../../../configs/constants';
import { localizeRoutePath } from '../../../../configs/routeLocalization';

interface CareerItem {
  id: string | number;
  name: string;
  metadata?: object;
}

const SubHeader = () => {
  const { t, i18n } = useTranslation('common');
  const dispatch = useDispatch();
  const { push } = useRouter();
  const [open, setOpen] = React.useState(false);
  const [topCareers, setTopCareers] = React.useState<CareerItem[]>([]);
  const careerScrollRef = React.useRef<HTMLDivElement | null>(null);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  React.useEffect(() => {
    const getTopCareers = async () => {
      try {
        const resData = await commonService.getTop10Careers();
        setTopCareers(
          (Array.isArray(resData) ? resData : [])
            .map((item: { name?: string; metadata?: object; id?: number | string | null }) => ({
              ...item,
              id: item.id === null || item.id === undefined ? '' : String(item.id),
              name: String(item.name ?? '').trim(),
            }))
            .filter((item) => item.id && item.name)
        );
      } catch {
        // Silent fallback
      }
    };

    getTopCareers();
  }, []);

  const handleFilter = (id: string | number) => {
    dispatch(searchJobPost(buildJobPostFilter({ careerId: String(id) })));
    setOpen(false);
    push(localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language));
  };

  const handleScrollNext = () => {
    careerScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' });
  };

  return (
    <>
      <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
        <AppBar
          position="static"
          sx={{
            bgcolor: (theme) => (theme.palette.mode === 'light' ? 'white' : 'black'),
            boxShadow: 0,
            borderBottom: 1,
            borderColor: (theme) =>
              theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.primary.dark,
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              variant="dense"
              sx={{
                color: (theme) => (theme.palette.mode === 'light' ? 'black' : 'white'),
                py: 0.75,
                gap: 1.25,
              }}
            >
              <Box
                sx={{
                  cursor: 'pointer',
                  width: 42,
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '14px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.background,
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={() => setOpen(true)}
              >
                <FontAwesomeIcon
                  icon={faListUl}
                  fontSize={20}
                  style={{ color: theme.palette.primary.main }}
                />
              </Box>

              {!isSmall && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0,
                    gap: 1,
                  }}
                >
                  <Stack
                    ref={careerScrollRef}
                    direction="row"
                    spacing={1}
                    sx={{
                      overflowX: 'auto',
                      scrollbarWidth: 'none',
                      flex: 1,
                      minWidth: 0,
                      '&::-webkit-scrollbar': {
                        display: 'none',
                      },
                    }}
                  >
                    {topCareers.map((item) => (
                      <Chip
                        key={item.id}
                        label={item.name}
                        clickable
                        onClick={() => handleFilter(item.id)}
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          borderColor: 'rgba(26, 64, 125, 0.14)',
                          backgroundColor: 'rgba(255,255,255,0.80)',
                          flexShrink: 0,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.background,
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    ))}
                  </Stack>

                  <IconButton
                    aria-label={t('next', { defaultValue: 'Next' })}
                    onClick={handleScrollNext}
                    size="small"
                    sx={{
                      flexShrink: 0,
                      width: 34,
                      height: 34,
                      border: '1px solid rgba(26, 64, 125, 0.14)',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      color: theme.palette.primary.main,
                      boxShadow: '0 1px 6px rgba(15, 57, 127, 0.08)',
                      '&:hover': {
                        bgcolor: theme.palette.primary.background,
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </Box>

      <SubHeaderDialog
        open={open}
        setOpen={setOpen}
        topCareers={topCareers}
        handleFilter={handleFilter}
      />
    </>
  );
};

export default SubHeader;
