import React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { useParams } from 'next/navigation';

import { useTranslation } from "react-i18next";

import { Box, Divider, Fab, IconButton, Rating, Skeleton, Stack, Typography } from "@mui/material";
import DataTable from '../../../../components/Common/DataTable';

import AddIcon from '@mui/icons-material/Add';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';

import { confirmModal } from '../../../../utils/sweetalert2Modal';

import toastMessages from '../../../../utils/toastMessages';

import errorHandling from '../../../../utils/errorHandling';

import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';

import EmptyCard from '../../../../components/Common/EmptyCard';

import FormPopup from '../../../../components/Common/Controls/FormPopup';

import LanguageSkillForm from '../LanguageSkillForm';

import resumeService from '../../../../services/resumeService';

import languageSkillService from '../../../../services/languageSkillService';
import { tConfig } from '../../../../utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import type { FormValues as LanguageskillformFormValues } from '../LanguageSkillForm';
import type { Theme as StylesTheme } from '@mui/material/styles';
import type { ApiError } from '@/types/api';
import type { AxiosError } from 'axios';

import type { LanguageSkill } from '../../../../types/models';

interface LanguageSkillCardProps {
  title: string;
}



const Loading = (

  <Stack>

    <Box>

      <Stack

        direction="row"

        justifyContent="space-between"

        alignItems="center"

        spacing={2}

      >

        <Typography variant="h6" flex={1}>

          <Skeleton />

        </Typography>

        <Box>

          <Skeleton variant="circular" width={50} height={50} />

        </Box>

      </Stack>

    </Box>

    <Box sx={{ px: 1 }}>

      <Box sx={{ py: 2 }}>

        <Skeleton height={5} />

      </Box>

      {Array(4)

        .fill(0)

        .map((_, index) => (<Box sx={{ py: 0.5 }} key={index}>

          <Skeleton height={30} />

        </Box>

        ))}

    </Box>

  </Stack>

);

const LanguageSkillCard = ({ title }: LanguageSkillCardProps) => {

  const { t } = useTranslation(['jobSeeker', 'common']);

  const { slug: resumeSlug } = useParams<{ slug: string }>();

  const { allConfig } = useConfig();

  const [openPopup, setOpenPopup] = React.useState(false);

  const [isSuccess, setIsSuccess] = React.useState(false);

  const [isLoadingLanguageSkills, setIsLoadingLanguageSkills] =

    React.useState(true);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [languageSkills, setLanguageSkills] = React.useState<LanguageSkill[]>([]);

  const [editData, setEditData] = React.useState<LanguageSkill | null>(null);

  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]> | null>(null);

  React.useEffect(() => {

    const loadLanguageSkills = async (slug: string | undefined) => {
      if (!slug) return;

      setIsLoadingLanguageSkills(true);

      try {

        const resData = await resumeService.getLanguageSkills(slug);

        setLanguageSkills(resData);

      } catch (error: unknown) {

        errorHandling(error);

      } finally {

        setIsLoadingLanguageSkills(false);

      }

    };

    loadLanguageSkills(resumeSlug);

  }, [resumeSlug, isSuccess]);

  const handleShowUpdate = (id: string | number) => {

    setServerErrors(null);

    const loadLanguageSkillById = async (skillId: string | number) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await languageSkillService.getLanguageSkillById(skillId);

        setEditData(resData);

        setOpenPopup(true);

      } catch (error: unknown) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    loadLanguageSkillById(id);

  };

  const handleShowAdd = () => {

    setServerErrors(null);

    setEditData(null);

    setOpenPopup(true);

  };

  const handleAddOrUpdate = (data: LanguageskillformFormValues & { id?: string | number }) => {

    const create = async (payload: LanguageskillformFormValues & { resume?: string }) => {

      setIsFullScreenLoading(true);

      try {

        await languageSkillService.addLanguageSkills(payload);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.languageAddSuccess'));

      } catch (error: unknown) {

        errorHandling(error, (errs) => setServerErrors(errs as Record<string, string[]>));

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const update = async (payload: LanguageskillformFormValues & { id?: string | number }) => {

      setIsFullScreenLoading(true);

      try {

        await languageSkillService.updateLanguageSkillById(payload.id as string | number, payload);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.languageUpdateSuccess'));

      } catch (error: unknown) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    if ('id' in data) {

      update(data);

    } else {

      // create

      const dataCustom = {

        ...data,

        resume: resumeSlug,

      };

      create(dataCustom);

    }

  };

  const handleDeleteLanguageSkill = (id: string | number) => {

    const del = async (skillId: string | number) => {

      try {

        await languageSkillService.deleteLanguageSkillById(skillId);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.languageDeleteSuccess'));

      } catch (error: unknown) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    confirmModal(

      () => del(id),

      t('jobSeeker:profile.messages.deleteConfirmTitle', { item: t('jobSeeker:profile.sections.language') }),

      t('jobSeeker:profile.messages.deleteConfirmWarning'),

      'warning'

    );

  };

  return (

    <>

      <Box

        sx={{

          backgroundColor: 'background.paper',

          borderRadius: 3,

          p: 3,

          boxShadow: (theme: StylesTheme & { customShadows: Record<string, unknown> }) => theme.customShadows.card,

        }}

      >

        {isLoadingLanguageSkills ? (

          Loading

        ) : (

          <Stack spacing={3}>

            <Box>

              <Stack direction="row" justifyContent="space-between" alignItems="center">

                <Typography variant="h5" sx={{ fontWeight: 600 }}>

                  {title}

                </Typography>

                <Fab

                  size="small"

                  color="primary"

                  aria-label={t("common:actions.add")}

                  onClick={handleShowAdd}

                  sx={{

                    boxShadow: (theme: StylesTheme & { customShadows: Record<string, unknown> }) => theme.customShadows.medium,

                    "&:hover": {

                      transform: "scale(1.1)",

                    },

                    transition: "all 0.2s ease-in-out",

                  }}

                >

                  <AddIcon />

                </Fab>

              </Stack>

            </Box>

            <Divider sx={{ my: 0, borderColor: 'grey.500' }} />

            <Box>

                <DataTable
                  columns={[
                    {
                      header: t('jobSeeker:profile.fields.language'),
                      accessorKey: 'language',
                      cell: (info) => tConfig((allConfig as { languageDict?: Record<string, unknown> })?.languageDict?.[info.getValue() as string ?? ''] as string),
                    },
                    {
                      header: t('jobSeeker:profile.fields.level'),
                      accessorKey: 'level',
                      cell: (info) => (
                        <Rating name="level-read-only" value={info.getValue() as number || 0} size="large" readOnly />
                      ),
                    },
                    {
                      header: t('jobSeeker:profile.fields.actions'),
                      id: 'actions',
                      meta: { align: 'right' },
                      cell: (info) => (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            sx={{
                              color: 'secondary.main',
                              bgcolor: 'secondary.background',
                              '&:hover': {
                                bgcolor: 'secondary.light',
                                color: 'white',
                              },
                            }}
                            onClick={() => handleShowUpdate(info.row.original.id)}
                          >
                            <ModeEditOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{
                              color: 'error.main',
                              bgcolor: 'error.background',
                              '&:hover': {
                                bgcolor: 'error.main',
                                color: 'white',
                              },
                            }}
                            onClick={() => handleDeleteLanguageSkill(info.row.original.id)}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ),
                    },
                  ]}
                  data={languageSkills}
                  isLoading={isLoadingLanguageSkills}
                  hidePagination
                  emptyMessage={t('jobSeeker:profile.messages.noLanguageData')}
                />

            </Box>

          </Stack>

        )}

      </Box>

      {/* Start: form  */}

      <FormPopup title={t('jobSeeker:profile.sections.language')} openPopup={openPopup} setOpenPopup={setOpenPopup}>

        <LanguageSkillForm handleAddOrUpdate={handleAddOrUpdate as (data: LanguageskillformFormValues) => void} editData={editData} serverErrors={serverErrors} />

      </FormPopup>

      {/* End: form */}

      {/* Start: full screen loading */}

      {isFullScreenLoading && <BackdropLoading />}

      {/* End: full screen loading */}

    </>

  );

};

export default LanguageSkillCard;
