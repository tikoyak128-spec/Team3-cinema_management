
FROM php:8.2-cli

# Install system dependencies & Postgres PDO extension
RUN apt-get update && apt-get install -y libpq-dev git unzip \
    && docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader

EXPOSE 10000
CMD php artisan serve --host 0.0.0.0 --port 10000
