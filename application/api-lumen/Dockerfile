FROM php:8.1.9-fpm-alpine3.16
# lumen packages
RUN docker-php-ext-install mysqli pdo_mysql
# memcached
ENV MEMCACHED_DEPS zlib-dev libmemcached-dev cyrus-sasl-dev
RUN apk add --no-cache --update libmemcached-libs zlib
RUN set -xe \
    && apk add --no-cache --update --virtual .phpize-deps $PHPIZE_DEPS \
    && apk add --no-cache --update --virtual .memcached-deps $MEMCACHED_DEPS \
    && pecl install memcached \
    && echo "extension=memcached.so" > /usr/local/etc/php/conf.d/20_memcached.ini \
    && rm -rf /usr/share/php7 \
    && rm -rf /tmp/* \
    && apk del .memcached-deps .phpize-deps

RUN chmod u+s /usr/bin/crontab
RUN chown -R www-data:www-data /var/www

COPY --from=composer:2.2 /usr/bin/composer /usr/bin/composer

RUN mkdir -p /var/www/html && chown -R www-data:www-data /var/www/html

USER www-data
