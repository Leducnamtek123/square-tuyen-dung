import React from "react";
import { Switch } from "@mui/material";
import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";
import jobPostNotificationService from "../../../../services/jobPostNotificationService";
import errorHandling from "../../../../utils/errorHandling";

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
      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default ActiveButtonComponent;
