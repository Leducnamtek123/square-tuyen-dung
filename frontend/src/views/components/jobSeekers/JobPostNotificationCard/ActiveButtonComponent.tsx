import React from "react";
import { Switch } from "@mui/material";
import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";
import jobPostNotificationService from "../../../../services/jobPostNotificationService";
import errorHandling from "../../../../utils/errorHandling";
import type { AxiosError } from 'axios';

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
        const resData = await jobPostNotificationService.active(id) as { isActive: boolean };
        const data = resData;
        setChecked(data.isActive);
      } catch (error) {
        errorHandling(error as AxiosError<Record<string, unknown>>);
      } finally {
        setIsFullScreenLoading(false);
      }
    };
    updateJobPostNotification(id);
  };

  return (
    <>
      <Switch checked={checked} onChange={handleUpdateActive} />
      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default ActiveButtonComponent;
