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

import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";

import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME } from "../../../configs/constants";

const BlogPage = () => {
  TabTitle(`Blog tuyển dụng - ${APP_NAME}`);

  const placeholders = [
    {
      title: "Chia sẻ kinh nghiệm tuyển dụng",
      description: "Nội dung đang được cập nhật để mang lại thông tin hữu ích.",
    },
    {
      title: "Mẹo viết mô tả công việc",
      description: "Nội dung đang được cập nhật để mang lại thông tin hữu ích.",
    },
    {
      title: "Xu hướng thị trường nhân sự",
      description: "Nội dung đang được cập nhật để mang lại thông tin hữu ích.",
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
          Blog tuyển dụng
        </Typography>
        <Typography
          sx={{
            maxWidth: "820px",
            margin: "0 auto",
            color: "text.secondary",
            lineHeight: 1.8,
          }}
        >
          Nơi cập nhật kiến thức và kinh nghiệm dành cho nhà tuyển dụng. Nội dung
          sẽ được bổ sung liên tục theo từng chủ đề.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {placeholders.map((item, index) => (
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
              }}
            >
              <Stack spacing={2}>
                <ArticleOutlinedIcon sx={{ fontSize: 34, color: "primary.main" }} />
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
    </Box>
  );
};

export default BlogPage;
