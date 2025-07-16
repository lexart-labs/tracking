FROM composer
RUN addgroup -g 1000 appuser && \
    adduser -D -s /bin/sh -u 1000 -G appuser appuser
RUN composer global require "laravel/lumen-installer"
ENV PATH $PATH:/tmp/vendor/bin
RUN chown -R appuser:appuser /tmp
USER appuser
