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

import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME } from "../../../configs/constants";

const IntroducePage = () => {
  TabTitle(`Giới thiệu - Nền tảng tuyển dụng ${APP_NAME}`);

  const highlights = [
    {
      title: "Đăng tin nhanh, tiếp cận đúng người",
      description:
        "Tạo tin tuyển dụng chuẩn, hiển thị rõ yêu cầu và quyền lợi để thu hút ứng viên phù hợp.",
      icon: CampaignOutlinedIcon,
    },
    {
      title: "Tìm kiếm hồ sơ theo kỹ năng",
      description:
        "Bộ lọc theo ngành nghề, kinh nghiệm, địa điểm giúp rút ngắn thời gian sàng lọc.",
      icon: PeopleAltOutlinedIcon,
    },
    {
      title: "Theo dõi quy trình tuyển dụng",
      description:
        "Quản lý trạng thái ứng viên, lịch phỏng vấn và phản hồi tập trung trên một màn hình.",
      icon: TrackChangesOutlinedIcon,
    },
    {
      title: "Xây dựng thương hiệu tuyển dụng",
      description:
        "Trang hồ sơ công ty rõ ràng, đáng tin cậy giúp tăng tỷ lệ ứng viên quan tâm.",
      icon: VerifiedOutlinedIcon,
    },
  ];

  const steps = [
    {
      title: "Đăng tin",
      description: "Tạo tin tuyển dụng với thông tin đầy đủ và chuẩn hóa.",
    },
    {
      title: "Nhận hồ sơ",
      description: "Ứng viên nộp hồ sơ trực tuyến, tập trung trong một nơi.",
    },
    {
      title: "Đánh giá",
      description: "Sàng lọc theo tiêu chí, ghi chú và chia sẻ trong nội bộ.",
    },
    {
      title: "Phỏng vấn",
      description: "Lên lịch và phản hồi nhanh, đảm bảo trải nghiệm ứng viên.",
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
          Giới thiệu
        </Typography>
        <Typography
          sx={{
            maxWidth: "820px",
            margin: "0 auto",
            color: "text.secondary",
            lineHeight: 1.8,
          }}
        >
          {APP_NAME} hỗ trợ nhà tuyển dụng tối ưu hóa toàn bộ quy trình tìm kiếm nhân
          sự, từ đăng tin, tiếp cận ứng viên đến quản lý phỏng vấn và đánh giá.
          Mục tiêu của chúng tôi là giúp doanh nghiệp tuyển được đúng người nhanh
          hơn, rõ ràng hơn và hiệu quả hơn.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        {highlights.map((item, index) => (
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
                <item.icon sx={{ fontSize: 34, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            textAlign: "center",
            background: (theme) => theme.palette.primary.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          Quy trình tuyển dụng đơn giản
        </Typography>
        <Grid container spacing={3}>
          {steps.map((step, index) => (
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
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}
                >
                  Bước {index + 1}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {step.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default IntroducePage;
