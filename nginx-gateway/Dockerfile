FROM public.ecr.aws/docker/library/nginx:alpine@sha256:df221db836e1754089190208cee7eeda94f233197056426eda74a43ab1abeac2

# Cài đặt libcap và gán quyền bind port < 1024 cho user nginx non-root
RUN apk add --no-cache libcap && \
    setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Xóa cấu hình mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy cấu hình mới của chúng ta vào
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Chạy dưới quyền user non-root
USER nginx

# Nginx sẽ chạy ở foreground
CMD ["nginx", "-g", "daemon off;"]
