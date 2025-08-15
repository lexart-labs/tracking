FROM nginx:alpine

RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user

RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx-user:nginx-user /var/cache/nginx /var/log/nginx /var/run /etc/nginx

RUN touch /var/run/nginx.pid && \
    chown nginx-user:nginx-user /var/run/nginx.pid

WORKDIR /etc/nginx
COPY ./nginx.conf ./conf.d/default.conf

RUN chown -R nginx-user:nginx-user /etc/nginx

USER nginx-user

EXPOSE 80
ENTRYPOINT [ "nginx" ]
CMD [ "-g", "daemon off;" ]
