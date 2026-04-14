import React from "react";
import { useAppSelector } from '@/redux/hooks';
import { Box, Button, Divider, Pagination, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { confirmModal } from "../../../../utils/sweetalert2Modal";
import errorHandling from "../../../../utils/errorHandling";
import toastMessages from "../../../../utils/toastMessages";
import jobPostNotificationService from "../../../../services/jobPostNotificationService";
import { useTranslation } from "react-i18next";
import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";
import NoDataCard from "../../../../components/Common/NoDataCard";
import MuiImageCustom from "../../../../components/Common/MuiImageCustom";
import FormPopup from "../../../../components/Common/Controls/FormPopup";
import JobPostNotificationForm, { JobPostNotificationFormValues } from "../JobPostNotificationForm";
import ItemLoading from "./ItemLoading";
import ItemComponent from "./ItemComponent";
import { useJobPostNotifications, useJobPostNotificationMutations } from "../hooks/useJobSeekerQueries";

import type { JobPostNotification } from "../../../../services/jobPostNotificationService";
import type { Theme as MaterialTheme } from '@mui/material';
import type { AxiosError } from 'axios';

const pageSize = 12;

const JobPostNotificationCard = () => {
  const { t } = useTranslation(["jobSeeker", "common"]);
  const { currentUser } = useAppSelector((state) => state.user);

  const [page, setPage] = React.useState(1);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [editData, setEditData] = React.useState<Partial<JobPostNotificationFormValues> & { id?: number } | null>(null);

  const { data, isLoading } = useJobPostNotifications({ page, pageSize });
  const jobPostNotifications: JobPostNotification[] = (data?.results || []);
  const count = data?.count || 0;

  const { addMutation, updateMutation, deleteMutation } = useJobPostNotificationMutations();

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleShowUpdate = async (id: number) => {
    setIsFullScreenLoading(true);
    try {
      const resData = await jobPostNotificationService.getJobPostNotificationDetailById(id);
      setEditData(resData as unknown as Partial<JobPostNotificationFormValues> & { id?: number });
      setOpenPopup(true);
    } catch (error) {
      errorHandling(error);
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  const handleShowAdd = () => {
    setEditData(null);
    setOpenPopup(true);
  };

  const handleAddOrUpdate = (formData: JobPostNotificationFormValues & { id?: number }) => {
    if ("id" in formData && formData.id) {
      updateMutation.mutate({ id: formData.id, data: { ...formData } as Record<string, unknown> }, {
        onSuccess: () => {
          setOpenPopup(false);
          toastMessages.success(t("jobSeeker:jobManagement.notifications.updatedSuccess"));
        },
      });
    } else {
      addMutation.mutate({ ...formData } as Record<string, unknown>, {
        onSuccess: () => {
          setOpenPopup(false);
          toastMessages.success(t("jobSeeker:jobManagement.notifications.addedSuccess"));
        },
      });
    }
  };

  const handleDeleteJobPostNotification = (id: number) => {
    confirmModal(
      () => deleteMutation.mutate(id, {
        onSuccess: () => {
          toastMessages.success(t("jobSeeker:jobManagement.notifications.deletedSuccess"));
        },
      }),
      t("jobSeeker:jobManagement.notifications.deleteTitle"),
      t("jobSeeker:jobManagement.notifications.deleteWarning"),
      "warning"
    );
  };

  const isMutating = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <Box sx={{ boxShadow: 0, p: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 } }}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack flex={1}>
              <Box>
                <Typography variant="h5" fontWeight="600" color="text.primary">
                  {t("jobSeeker:jobManagement.notifications.title")}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {t("jobSeeker:jobManagement.notifications.subtitle")}
                </Typography>
              </Box>
            </Stack>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleShowAdd}
                sx={{
                  px: 3,
                  py: 1,
                  background: (theme: MaterialTheme) => theme.palette.primary.main,
                  "&:hover": {
                    background: (theme: MaterialTheme) => theme.palette.primary.main,
                    opacity: 0.9,
                  },
                }}
              >
                {t("jobSeeker:jobManagement.notifications.create")}
              </Button>
            </Box>
          </Stack>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box>
          {isLoading ? (
            <Stack spacing={4}>
              {Array.from(Array(5).keys()).map((value) => (
                <ItemLoading key={value} />
              ))}
            </Stack>
          ) : jobPostNotifications.length === 0 ? (
            <NoDataCard
              title={t("jobSeeker:jobManagement.notifications.empty")}
              svgKey="ImageSvg10"
            >
              <Button variant="contained" color="primary" onClick={handleShowAdd}>
                {t("jobSeeker:jobManagement.notifications.createNow")}
              </Button>
            </NoDataCard>
          ) : (
            <Box>
              <Stack spacing={4}>
                {jobPostNotifications.map((value) => (
                  <ItemComponent
                    key={value.id}
                    id={value.id}
                    jobName={value.jobName}
                    salary={value.salary || null}
                    frequency={value.frequency || 0}
                    isActive={value.isActive}
                    career={value.career || 0}
                    city={value.city || 0}
                    handleShowUpdate={handleShowUpdate}
                    handleDelete={handleDeleteJobPostNotification}
                  />
                ))}
              </Stack>
              <Box>
                <Stack>
                  {Math.ceil(count / pageSize) > 1 && (
                    <Pagination
                      siblingCount={0}
                      color="primary"
                      size="medium"
                      variant="text"
                      sx={{ margin: "0 auto", mt: 5 }}
                      count={Math.ceil(count / pageSize)}
                      page={page}
                      onChange={handleChangePage}
                    />
                  )}
                </Stack>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <FormPopup
        title={(
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box>
              <MuiImageCustom
                width={100}
                height={100}
                src={"https://vieclam24h.vn/img/mail-bro%202.png"}
                shiftDuration={0}
              />
            </Box>
            <Stack>
              <Box>
                <Typography variant="h5">{t("jobSeeker:jobManagement.notifications.modalTitle")}</Typography>
              </Box>
              <Box>
                <Typography color="#757575">{currentUser?.email}</Typography>
              </Box>
            </Stack>
          </Stack>
        ) as React.ReactElement}
        buttonText={editData ? t("common:actions.save") : t("jobSeeker:jobManagement.notifications.create")}
        buttonIcon={null}
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <JobPostNotificationForm handleAddOrUpdate={handleAddOrUpdate} editData={editData} />
      </FormPopup>

      {(isFullScreenLoading || isMutating) && <BackdropLoading />}
    </>
  );
};

export default JobPostNotificationCard;
