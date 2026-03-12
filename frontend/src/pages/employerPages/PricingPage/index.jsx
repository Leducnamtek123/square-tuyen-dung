/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from "react";
import { Box, Card, Stack, Typography, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME } from "../../../configs/constants";

const PricingPage = () => {
  TabTitle(`Bảng giá - ${APP_NAME}`);

  const plans = [
    {
      title: "Cơ bản",
      price: "Liên hệ",
      description: "Phù hợp cho doanh nghiệp bắt đầu tuyển dụng.",
      features: [
        "Đăng tin tuyển dụng cơ bản",
        "Quản lý hồ sơ ứng viên",
        "Báo cáo tổng quan",
      ],
    },
    {
      title: "Tiêu chuẩn",
      price: "Liên hệ",
      description: "Dành cho đội ngũ tuyển dụng đang mở rộng quy mô.",
      features: [
        "Tìm kiếm và lọc hồ sơ nâng cao",
        "Lên lịch phỏng vấn",
        "Hỗ trợ ưu tiên",
      ],
    },
    {
      title: "Doanh nghiệp",
      price: "Theo nhu cầu",
      description: "Giải pháp riêng cho doanh nghiệp có nhu cầu lớn.",
      features: [
        "Gói tuyển dụng tùy chỉnh",
        "Báo cáo chi tiết",
        "Tư vấn tối ưu quy trình",
      ],
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
          Bảng giá
        </Typography>
        <Typography
          sx={{
            maxWidth: "820px",
            margin: "0 auto",
            color: "text.secondary",
            lineHeight: 1.8,
          }}
        >
          Chúng tôi cung cấp các gói dịch vụ linh hoạt, dễ lựa chọn và có thể
          điều chỉnh theo quy mô tuyển dụng của doanh nghiệp.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {plans.map((plan, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <Card
              sx={{
                height: "100%",
                p: 3,
                border: "1px solid",
                borderColor: "grey.100",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack spacing={2} sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {plan.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {plan.price}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {plan.description}
                </Typography>
                <Stack spacing={1}>
                  {plan.features.map((feature, featureIndex) => (
                    <Typography
                      key={featureIndex}
                      sx={{ color: "text.secondary" }}
                    >
                      • {feature}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
              <Button
                variant="outlined"
                sx={{ mt: 3 }}
                color="primary"
              >
                Liên hệ tư vấn
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PricingPage;
