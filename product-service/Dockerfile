FROM php:8.2-fpm

# 1. Install dependensi sistem
# Perhatikan: Kita menambah 'libpq-dev' agar bisa connect ke PostgreSQL
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip

# 2. Bersihkan cache agar image ringan
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. Install ekstensi PHP
# PENTING: Gunakan 'pdo_pgsql' (bukan pdo_mysql)
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

# 4. Copy Composer dari image official
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Set folder kerja
WORKDIR /var/www