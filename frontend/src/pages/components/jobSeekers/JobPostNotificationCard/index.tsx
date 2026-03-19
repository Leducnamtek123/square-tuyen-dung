import React from "react";
import { useSelector } from "react-redux";
import { Box, Button, Divider, IconButton, Pagination, Skeleton, Stack, Switch, Typography } from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faCalendarAlt, faCircleDollarToSlot, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import toastMessages from "../../../../utils/toastMessages";
import BackdropLoading from "../../../../components/loading/BackdropLoading";
import { confirmModal } from "../../../../utils/sweetalert2Modal";
import { convertMoney } from "../../../../utils/customData";
import NoDataCard from "../../../../components/NoDataCard";
import MuiImageCustom from "../../../../components/MuiImageCustom";
import FormPopup from "../../../../components/controls/FormPopup";
import JobPostNotificationForm from "../JobPostNotificationForm";
import errorHandling from "../../../../utils/errorHandling";
import jobPostNotificationService from "../../../../services/jobPostNotificationService";
import { useTranslation } from "react-i18next";

interface JobPostNotification {
  id: number;
  jobName: string;
  salary: number | null;
  frequency: number;
  isActive: boolean;
  career: number;
  city: number;
}



const ItemLoading = () => {

  const [parentWidth, setParentWidth] = React.useState(0);

  const [stackDirection, setStackDirection] = React.useState<'row' | 'column'>("column");

  React.useEffect(() => {

    const handleResize = () => {

      const element = document.getElementById("job-post-notification-loading");
      if (element) {
        setParentWidth(element.offsetWidth);
      }

    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);

  React.useEffect(() => {

    if (parentWidth < 600) {

      setStackDirection("column");

    } else {

      setStackDirection("row");

    }

  }, [parentWidth]);

  return (

    <div id="job-post-notification-loading">

      <Box>

        <Stack direction="row" spacing={3} alignItems="center">

          <Box flex={1}>

            <Stack spacing={1}>

              <Box>

                <Typography fontSize={18} fontWeight={"bold"}>

                  <Skeleton />

                </Typography>

              </Box>

              <Stack direction={stackDirection} spacing={3}>

                <Box>

                  <Typography fontWeight="bold" color="GrayText" fontSize={14}>

                    <Skeleton width={100} />

                  </Typography>

                </Box>

                <Box>

                  <Typography fontWeight="bold" color="GrayText" fontSize={14}>

                    <Skeleton width={100} />

                  </Typography>

                </Box>

                <Box>

                  <Typography fontWeight="bold" color="GrayText" fontSize={14}>

                    <Skeleton width={100} />

                  </Typography>

                </Box>

                <Box>

                  <Typography fontWeight="bold" color="GrayText" fontSize={14}>

                    <Skeleton width={100} />

                  </Typography>

                </Box>

              </Stack>

            </Stack>

          </Box>

          <Stack direction="row" spacing={1} alignItems="center">

            <Box>

              <Skeleton width={50} height={40} />

            </Box>

            <Box>

              <Skeleton width={50} height={40} />

            </Box>

            <Box>

              <Skeleton width={50} height={40} />

            </Box>

          </Stack>

        </Stack>

      </Box>

    </div>

  );

};

interface ActiveButtonComponentProps {
  id: number;
  isActive: boolean;
}

const ActiveButtonComponent = ({ id, isActive }: ActiveButtonComponentProps) => {

  const [checked, setChecked] = React.useState(isActive);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const handleUpdateActive = () => {

    const updateJobPostNotification = async (id: number) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await jobPostNotificationService.active(id) as any;

        const data = resData.data;

        setChecked(data.isActive);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    updateJobPostNotification(id);

  };

  return (

    <>

      <Switch checked={checked} onChange={handleUpdateActive} />

      {/* Start: full screen loading */}

      {isFullScreenLoading && <BackdropLoading />}

      {/* End: full screen loading */}

    </>

  );

};

interface ItemComponentProps {
  id: number;
  jobName: string;
  salary: number | null;
  frequency: number;
  isActive: boolean;
  career: number;
  city: number;
  handleShowUpdate: (id: number) => void;
  handleDelete: (id: number) => void;
}

const ItemComponent = ({

  id,

  jobName,

  salary,

  frequency,

  isActive,

  career,

  city,

  handleShowUpdate,

  handleDelete,

}: ItemComponentProps) => {

  const { t } = useTranslation(["jobSeeker", "common"]);

  const { allConfig } = useSelector((state: any) => state.config);

  const [parentWidth, setParentWidth] = React.useState(0);

  const [stackDirection, setStackDirection] = React.useState<'row' | 'column'>("column");

  React.useEffect(() => {

    const handleResize = () => {

      const element = document.getElementById("job-post-notification");
      if (element) {
        setParentWidth(element.offsetWidth);
      }

    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);

  React.useEffect(() => {

    if (parentWidth < 600) {

      setStackDirection("column");

    } else {

      setStackDirection("row");

    }

  }, [parentWidth]);

  return (

    <div id="job-post-notification">

      <Box

        sx={{

          px: 3,

          py: 2,

          borderRadius: 2,

          bgcolor: "background.paper",

          boxShadow: 0,

          "&:hover": {

            boxShadow: (theme) => theme.customShadows.medium,

            transform: "translateY(-2px)",

            transition: "all 0.3s ease-in-out",

          },

        }}

      >

        <Stack direction="row" spacing={3} alignItems="center">

          <Box flex={1}>

            <Stack spacing={2}>

              <Box>

                <Typography

                  fontSize={18}

                  fontWeight="600"

                  color="text.primary"

                  sx={{

                    overflow: "hidden",

                    textOverflow: "ellipsis",

                    display: "-webkit-box",

                    WebkitLineClamp: 2,

                    WebkitBoxOrient: "vertical",

                  }}

                >

                  {jobName}

                </Typography>

              </Box>

              <Stack

                direction={stackDirection}

                spacing={stackDirection === "column" ? 2 : 3}

                sx={{

                  "& .info-item": {

                    display: "flex",

                    alignItems: "center",

                    gap: 1,

                    color: "grey.600",

                    "& svg": {

                      fontSize: "1.2rem",

                      color: "grey.500",

                    },

                  },

                }}

              >

                <Box className="info-item">

                  <FontAwesomeIcon icon={faCircleDollarToSlot} />

                  {salary ? (

                    <Typography

                      component="span"

                      color="secondary.main"

                      fontWeight="600"

                    >

                      {convertMoney(salary)}

                    </Typography>

                  ) : (

                    <Typography

                      component="span"

                      fontSize="13px"

                      fontStyle="italic"

                      color="grey.400"

                    >

                      {t("jobSeeker:notUpdated")}

                    </Typography>

                  )}

                </Box>

                <Box className="info-item">

                  <FontAwesomeIcon icon={faLocationDot} />

                  {allConfig?.cityDict[city] ? (

                    <Typography component="span" fontSize="14px">

                      {allConfig?.cityDict[city]}

                    </Typography>

                  ) : (

                    <Typography

                      component="span"

                      fontSize="13px"

                      fontStyle="italic"

                      color="grey.400"

                    >

                      {t("jobSeeker:notUpdated")}

                    </Typography>

                  )}

                </Box>

                <Box className="info-item">

                  <FontAwesomeIcon icon={faBriefcase} />

                  {allConfig?.careerDict[career] ? (

                    <Typography component="span" fontSize="14px">

                      {allConfig?.careerDict[career]}

                    </Typography>

                  ) : (

                    <Typography

                      component="span"

                      fontSize="13px"

                      fontStyle="italic"

                      color="grey.400"

                    >

                      {t("jobSeeker:notUpdated")}

                    </Typography>

                  )}

                </Box>

                <Box className="info-item">

                  <FontAwesomeIcon icon={faCalendarAlt} />

                  {allConfig?.frequencyNotificationDict[frequency] ? (

                    <Typography component="span" fontSize="14px">

                      {allConfig?.frequencyNotificationDict[frequency]}

                    </Typography>

                  ) : (

                    <Typography

                      component="span"

                      fontSize="13px"

                      fontStyle="italic"

                      color="grey.400"

                    >

                      {t("jobSeeker:notUpdated")}

                    </Typography>

                  )}

                </Box>

              </Stack>

            </Stack>

          </Box>

          <Stack

            direction="row"

            spacing={1}

            alignItems="center"

            sx={{

              "& .MuiIconButton-root": {

                borderRadius: 2,

                transition: "all 0.2s",

                "&:hover": {

                  transform: "scale(1.1)",

                },

              },

            }}

          >

            <Box>

              <ActiveButtonComponent id={id} isActive={isActive} />

            </Box>

            <Box>

              <IconButton

                aria-label={t("common:actions.edit")}

                onClick={() => handleShowUpdate(id)}

                sx={{

                  color: "warning.main",

                  bgcolor: "warning.background",

                  "&:hover": {

                    bgcolor: "warning.background",

                  },

                }}

              >

                <ModeEditOutlineOutlinedIcon />

              </IconButton>

            </Box>

            <Box>

              <IconButton

                aria-label={t("common:actions.delete")}

                onClick={() => handleDelete(id)}

                sx={{

                  color: "error.main",

                  bgcolor: "error.background",

                  "&:hover": {

                    bgcolor: "error.background",

                  },

                }}

              >

                <DeleteOutlineOutlinedIcon />

              </IconButton>

            </Box>

          </Stack>

        </Stack>

      </Box>

    </div>

  );

};

const pageSize = 12;

const JobPostNotificationCard = () => {
  const { t } = useTranslation(["jobSeeker", "common"]);

  const { currentUser } = useSelector((state: any) => state.user);

  const [page, setPage] = React.useState(1);

  const [count, setCount] = React.useState(0);

  const [openPopup, setOpenPopup] = React.useState(false);

  const [isSuccess, setIsSuccess] = React.useState(false);

  const [isLoadingJobPostNotifications, setIsLoadingJobPostNotifications] =

    React.useState(true);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [jobPostNotifications, setJobPostNotifications] = React.useState<JobPostNotification[]>([]);

  const [editData, setEditData] = React.useState<any>(null);

  React.useEffect(() => {

    const loadJobPostNotification = async (params: any) => {

      setIsLoadingJobPostNotifications(true);

      try {

        const resData =

          await jobPostNotificationService.getJobPostNotifications(params) as any;

        const data = resData.data;

        setCount(data.count);

        setJobPostNotifications(data.results);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsLoadingJobPostNotifications(false);

      }

    };

    loadJobPostNotification({

      page: page,

      pageSize: pageSize,

    });

  }, [isSuccess, page]);

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {

    setPage(newPage);

  };

  const handleShowUpdate = (id: number) => {

    const loadJobPostNotificationDetailById = async (id: number) => {

      setIsFullScreenLoading(true);

      try {

        const resData =

          await jobPostNotificationService.getJobPostNotificationDetailById(id) as any;

        const data = resData.data;

        setEditData(data);

        setOpenPopup(true);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    loadJobPostNotificationDetailById(id);

  };

  const handleShowAdd = () => {

    setEditData(null);

    setOpenPopup(true);

  };

  const handleAddOrUpdate = (data: any) => {

    const create = async (data: any) => {

      setIsFullScreenLoading(true);

      try {

        await jobPostNotificationService.addJobPostNotification(data);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t("jobSeeker:jobManagement.notifications.addedSuccess"));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const update = async (data: any) => {

      setIsFullScreenLoading(true);

      try {

        await jobPostNotificationService.updateJobPostNotificationById(

          data.id,

          data

        );

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t("jobSeeker:jobManagement.notifications.updatedSuccess"));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    if ("id" in data) {

      update(data);

    } else {

      create(data);

    }

  };

  const handleDeleteJobPostNotification = (id: number) => {

    const del = async (id: number) => {

      try {

        await jobPostNotificationService.deleteJobPostNotificationDetailById(

          id

        );

        setIsSuccess(!isSuccess);

        toastMessages.success(t("jobSeeker:jobManagement.notifications.deletedSuccess"));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    confirmModal(

      () => del(id),

      t("jobSeeker:jobManagement.notifications.deleteTitle"),

      t("jobSeeker:jobManagement.notifications.deleteWarning"),

      "warning"

    );

  };

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

                <Typography

                  variant="body2"

                  color="text.secondary"

                  sx={{ mt: 0.5 }}

                >

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

                  background: (theme) => theme.palette.primary.gradient,

                  "&:hover": {

                    background: (theme) => theme.palette.primary.gradient,

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

          {isLoadingJobPostNotifications ? (

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

              <Button variant="contained" color="primary">

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

                    salary={value.salary}

                    frequency={value.frequency}

                    isActive={value.isActive}

                    career={value.career}

                    city={value.city}

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

      {/* Start: form  */}

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

        ) as any}

        buttonText={editData ? t("common:actions.save") : t("jobSeeker:jobManagement.notifications.create")}

        buttonIcon={null}

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

      >

        <JobPostNotificationForm

          handleAddOrUpdate={handleAddOrUpdate}

          editData={editData}

        />

      </FormPopup>

      {/* End: form */}

      {/* Start: full screen loading */}

      {isFullScreenLoading && <BackdropLoading />}

      {/* End: full screen loading */}

    </>

  );

};

export default JobPostNotificationCard;
