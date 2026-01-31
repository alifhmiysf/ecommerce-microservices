FROM php:8.2-fpm

# 1. Install dependensi sistem yang dibutuhkan Composer & Laravel
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# 2. Bersihkan cache agar image tidak bengkak
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. Install ekstensi PHP yang dibutuhkan Laravel
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# 4. === INI KUNCINYA: Copy Composer dari image official ===
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Set folder kerja
WORKDIR /var/www

# (Opsional) Copy seluruh kodingan ke dalam container saat build
# COPY . /var/www