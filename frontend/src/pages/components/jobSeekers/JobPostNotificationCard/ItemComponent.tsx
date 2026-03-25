import React from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faCalendarAlt, faCircleDollarToSlot, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useAppSelector } from '@/redux/hooks';
import { convertMoney } from "../../../../utils/customData";
import { tConfig } from '../../../../utils/tConfig';
import ActiveButtonComponent from "./ActiveButtonComponent";

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
  const { allConfig } = useAppSelector((state) => state.config);
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
            boxShadow: (theme: any) => theme.customShadows?.medium || 2,
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
                    <Typography component="span" color="secondary.main" fontWeight="600">
                      {convertMoney(salary)}
                    </Typography>
                  ) : (
                    <Typography component="span" fontSize="13px" fontStyle="italic" color="grey.400">
                      {t("jobSeeker:notUpdated")}
                    </Typography>
                  )}
                </Box>
                <Box className="info-item">
                  <FontAwesomeIcon icon={faLocationDot} />
                  {tConfig((allConfig as any)?.cityDict?.[city]) ? (
                    <Typography component="span" fontSize="14px">
                      {tConfig((allConfig as any)?.cityDict?.[city])}
                    </Typography>
                  ) : (
                    <Typography component="span" fontSize="13px" fontStyle="italic" color="grey.400">
                      {t("jobSeeker:notUpdated")}
                    </Typography>
                  )}
                </Box>
                <Box className="info-item">
                  <FontAwesomeIcon icon={faBriefcase} />
                  {tConfig((allConfig as any)?.careerDict?.[career]) ? (
                    <Typography component="span" fontSize="14px">
                      {tConfig((allConfig as any)?.careerDict?.[career])}
                    </Typography>
                  ) : (
                    <Typography component="span" fontSize="13px" fontStyle="italic" color="grey.400">
                      {t("jobSeeker:notUpdated")}
                    </Typography>
                  )}
                </Box>
                <Box className="info-item">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  {tConfig((allConfig as any)?.frequencyNotificationDict?.[frequency]) ? (
                    <Typography component="span" fontSize="14px">
                      {tConfig((allConfig as any)?.frequencyNotificationDict?.[frequency])}
                    </Typography>
                  ) : (
                    <Typography component="span" fontSize="13px" fontStyle="italic" color="grey.400">
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

export default ItemComponent;
