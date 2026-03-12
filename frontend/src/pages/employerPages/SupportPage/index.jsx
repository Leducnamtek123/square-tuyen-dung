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

import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";

import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME } from "../../../configs/constants";

const SupportPage = () => {
  TabTitle(`Hỗ trợ - ${APP_NAME}`);

  const supportChannels = [
    {
      title: "Hỗ trợ trực tiếp",
      description:
        "Giải đáp các vấn đề kỹ thuật và nghiệp vụ tuyển dụng trong giờ hành chính.",
      note: "Thông tin liên hệ đang được cập nhật.",
      icon: SupportAgentOutlinedIcon,
    },
    {
      title: "Tài liệu hướng dẫn",
      description:
        "Hướng dẫn sử dụng các tính năng đăng tin, quản lý hồ sơ và phỏng vấn.",
      note: "Đang cập nhật bộ hướng dẫn chi tiết.",
      icon: LibraryBooksOutlinedIcon,
    },
    {
      title: "Kênh phản hồi",
      description:
        "Gửi góp ý để giúp chúng tôi cải thiện trải nghiệm tuyển dụng.",
      note: "Sẽ bổ sung biểu mẫu phản hồi trong thời gian tới.",
      icon: ChatBubbleOutlineOutlinedIcon,
    },
  ];

  const faqs = [
    {
      question: "Tôi có thể đăng bao nhiêu tin tuyển dụng?",
      answer:
        "Số lượng tin tuyển dụng phụ thuộc vào gói dịch vụ mà doanh nghiệp lựa chọn.",
    },
    {
      question: "Làm sao để lọc hồ sơ theo kỹ năng?",
      answer:
        "Bạn có thể sử dụng bộ lọc theo ngành nghề, kinh nghiệm và vị trí trong mục tìm kiếm hồ sơ.",
    },
    {
      question: "Có hỗ trợ lên lịch phỏng vấn không?",
      answer:
        "Có. Hệ thống hỗ trợ tạo lịch phỏng vấn và gửi thông báo đến ứng viên.",
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
          Hỗ trợ
        </Typography>
        <Typography
          sx={{
            maxWidth: "820px",
            margin: "0 auto",
            color: "text.secondary",
            lineHeight: 1.8,
          }}
        >
          {APP_NAME} luôn đồng hành cùng nhà tuyển dụng trong suốt quá trình sử
          dụng nền tảng. Nếu cần hỗ trợ, vui lòng tham khảo các kênh dưới đây.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        {supportChannels.map((item, index) => (
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
                <item.icon sx={{ fontSize: 34, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {item.note}
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
            mb: 3,
            background: (theme) => theme.palette.primary.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          Câu hỏi thường gặp
        </Typography>
        <Grid container spacing={3}>
          {faqs.map((faq, index) => (
            <Grid
              key={index}
              size={{
                xs: 12,
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
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {faq.question}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {faq.answer}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default SupportPage;
