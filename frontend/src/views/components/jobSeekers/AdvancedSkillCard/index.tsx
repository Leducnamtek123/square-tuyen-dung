import React from 'react';

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

import AdvancedSkillForm, { FormValues as AdvancedSkillFormValues } from '../AdvancedSkillForm';

import resumeService from '../../../../services/resumeService';

import advancedSkillService from '../../../../services/advancedSkillService';
import { Theme } from '@mui/material/styles';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

import type { AdvancedSkill } from '../../../../types/models';

interface AdvancedSkillCardProps {
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

const AdvancedSkillCard = ({ title }: AdvancedSkillCardProps) => {

  const { t } = useTranslation(['jobSeeker', 'common']);

  const { slug: resumeSlug } = useParams<{ slug: string }>();

  const [openPopup, setOpenPopup] = React.useState(false);

  const [isSuccess, setIsSuccess] = React.useState(false);

  const [isLoadingAdvancedSkills, setIsLoadingAdvancedSkills] =

    React.useState(true);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [advancedSkills, setAdvancedSkills] = React.useState<AdvancedSkill[]>([]);

  const [editData, setEditData] = React.useState<AdvancedSkill | null>(null);

  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]> | null>(null);

  React.useEffect(() => {

    const loadAdvancedSkills = async (slug: string | undefined) => {
      if (!slug) return;

      setIsLoadingAdvancedSkills(true);

      try {

        const resData = await resumeService.getAdvancedSkills(slug);

        setAdvancedSkills(resData);

      } catch (error: unknown) {

        errorHandling(error);

      } finally {

        setIsLoadingAdvancedSkills(false);

      }

    };

    loadAdvancedSkills(resumeSlug);

  }, [resumeSlug, isSuccess]);

  const handleShowUpdate = (id: string | number) => {

    setServerErrors(null);

    const loadAdvancedSkillById = async (skillId: string | number) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await advancedSkillService.getAdvancedSkillById(skillId);

        setEditData(resData);

        setOpenPopup(true);

      } catch (error: unknown) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    loadAdvancedSkillById(id);

  };

  const handleShowAdd = () => {

    setServerErrors(null);

    setEditData(null);

    setOpenPopup(true);

  };

  const handleAddOrUpdate = (data: AdvancedSkillFormValues & { id?: string | number }) => {

    const create = async (payload: AdvancedSkillFormValues & { resume?: string }) => {

      setIsFullScreenLoading(true);

      try {

        await advancedSkillService.addAdvancedSkills(payload);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.skillAddSuccess'));

      } catch (error: unknown) {

        errorHandling(error, (errs) => setServerErrors(errs as Record<string, string[]>));

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const update = async (payload: AdvancedSkillFormValues & { id?: string | number }) => {

      setIsFullScreenLoading(true);

      try {

        await advancedSkillService.updateAdvancedSkillById(payload.id as string | number, payload);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.skillUpdateSuccess'));

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

  const handleDeleteAdvancedSkill = (id: string | number) => {

    const del = async (skillId: string | number) => {

      try {

        await advancedSkillService.deleteAdvancedSkillById(skillId);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.skillDeleteSuccess'));

      } catch (error: unknown) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    confirmModal(

      () => del(id),

      t('jobSeeker:profile.messages.deleteConfirmTitle', { item: t('jobSeeker:profile.sections.skills') }),

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

          boxShadow: (theme: Theme) => theme.customShadows.card,

        }}

      >

        {isLoadingAdvancedSkills ? (

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

                    boxShadow: (theme: Theme) => theme.customShadows.medium,

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
                      header: t('jobSeeker:profile.fields.skill'),
                      accessorKey: 'name',
                    },
                    {
                      header: t('jobSeeker:profile.fields.level'),
                      accessorKey: 'level',
                      cell: (info: { getValue: () => unknown }) => (
                        <Rating name="level-read-only" value={info.getValue() as number || 0} size="large" readOnly />
                      ),
                    },
                    {
                      header: t('jobSeeker:profile.fields.actions'),
                      id: 'actions',
                      meta: { align: 'right' },
                      cell: (info: { row: { original: AdvancedSkill } }) => (
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
                            onClick={() => handleDeleteAdvancedSkill(info.row.original.id)}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ),
                    },
                  ]}
                  data={advancedSkills}
                  isLoading={isLoadingAdvancedSkills}
                  hidePagination
                  emptyMessage={t('jobSeeker:profile.messages.noSkillData')}
                />

            </Box>

          </Stack>

        )}

      </Box>

      {/* Start: form  */}

      <FormPopup title={t('jobSeeker:profile.sections.skills')} openPopup={openPopup} setOpenPopup={setOpenPopup}>

        <AdvancedSkillForm handleAddOrUpdate={handleAddOrUpdate as (data: AdvancedSkillFormValues) => void} editData={editData} serverErrors={serverErrors} />

      </FormPopup>

      {/* End: form */}

      {/* Start: full screen loading */}

      {isFullScreenLoading && <BackdropLoading />}

      {/* End: full screen loading */}

    </>

  );

};

export default AdvancedSkillCard;

