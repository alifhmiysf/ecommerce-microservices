FROM php:8.2-fpm-alpine

# Install ekstensi database
RUN docker-php-ext-install pdo pdo_mysql

WORKDIR /var/www

COPY . .

# Menggunakan chmod 777 adalah cara tercepat untuk local development 
# agar Laravel bisa menulis ke folder storage dan cache
RUN chmod -R 777 storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]