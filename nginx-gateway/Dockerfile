FROM nginx:alpine

# Xóa cấu hình mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy cấu hình mới của chúng ta vào
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx sẽ chạy ở foreground
CMD ["nginx", "-g", "daemon off;"]
