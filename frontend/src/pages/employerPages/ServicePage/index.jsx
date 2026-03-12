/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";

import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME } from "../../../configs/constants";

const ServicePage = () => {
  TabTitle(`Dịch vụ - ${APP_NAME}`);

  const services = [
    {
      title: "Đăng tin tuyển dụng",
      description:
        "Hỗ trợ tạo tin tuyển dụng chuẩn, hiển thị rõ yêu cầu và quyền lợi để tiếp cận đúng ứng viên.",
      icon: FactCheckOutlinedIcon,
    },
    {
      title: "Tìm kiếm và sàng lọc hồ sơ",
      description:
        "Bộ lọc theo kỹ năng, kinh nghiệm, địa điểm giúp doanh nghiệp tiết kiệm thời gian tuyển dụng.",
      icon: SearchOutlinedIcon,
    },
    {
      title: "Phỏng vấn và trao đổi nhanh",
      description:
        "Kết nối ứng viên qua chat, lên lịch phỏng vấn và theo dõi phản hồi tập trung.",
      icon: VideoCallOutlinedIcon,
    },
    {
      title: "Báo cáo tuyển dụng",
      description:
        "Tổng hợp dữ liệu ứng viên, tiến độ và hiệu quả tuyển dụng để tối ưu quy trình.",
      icon: InsightsOutlinedIcon,
    },
  ];

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", py: 5, px: 3 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{
            mb: 2,
            background: (theme) => theme.palette.primary.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          Dịch vụ
        </Typography>
        <Typography
          sx={{
            maxWidth: "820px",
            margin: "0 auto",
            color: "text.secondary",
            lineHeight: 1.8,
          }}
        >
          {APP_NAME} tập trung vào những dịch vụ cốt lõi giúp nhà tuyển dụng
          quản lý tuyển dụng rõ ràng và nhất quán, tránh rời rạc trong từng bước
          làm việc.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {services.map((service, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
                p: 3,
                border: "1px solid",
                borderColor: "grey.100",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: (theme) => theme.customShadows.card,
                  borderColor: "primary.light",
                },
              }}
            >
              <Stack spacing={2}>
                <service.icon sx={{ fontSize: 34, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {service.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {service.description}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServicePage;
