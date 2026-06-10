#!/bin/bash
# Railpack runs config:cache during *build* without Railway env → migrate sees 127.0.0.1.
# Clear config before migrate so runtime MYSQL_URL / DATABASE_URL from Railway apply.
set -e

# Strip accidental CR/LF from pasted Railway variables (e.g. DB_CONNECTION=mysql\n).
trim_var() {
  printf '%s' "$1" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}
DB_CONNECTION="$(trim_var "${DB_CONNECTION:-}")"
export DB_CONNECTION

if [ "$IS_LARAVEL" = "true" ]; then
  php artisan config:clear 2>/dev/null || true

  # Railway: MySQL vars exist on the DB service until you "Connect" / add References to THIS service.
  if [ "$DB_CONNECTION" = "mysql" ] || [ "$DB_CONNECTION" = "mariadb" ]; then
    if [ -z "${MYSQLHOST:-}" ] && [ -z "${MYSQL_HOST:-}" ] && [ -z "${MYSQL_URL:-}" ] && [ -z "${DATABASE_URL:-}" ] && [ -z "${DB_HOST:-}" ]; then
      echo ""
      echo "=== ОШИБКА КОНФИГУРАЦИИ RAILWAY / RAILWAY CONFIG ERROR ==="
      echo "DB_CONNECTION=$DB_CONNECTION, но в этом сервисе нет MYSQLHOST / MYSQL_URL / DATABASE_URL / DB_HOST."
      echo "Сейчас Laravel подключается к 127.0.0.1 → Connection refused."
      echo ""
      echo "Сделайте: Railway → сервис приложения (112233) → Variables → Add variable → Reference"
      echo "и добавьте с сервиса MySQL хотя бы: MYSQL_URL или MYSQLHOST + MYSQLUSER + MYSQLPASSWORD + MYSQLDATABASE."
      echo "Либо вручную: DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD."
      echo "=== ==="
      echo ""
      exit 1
    fi
  fi

  if [ "$RAILPACK_SKIP_MIGRATIONS" != "true" ]; then
    echo "Running migrations ..."
    php artisan migrate --force
    echo "Seeding menu and admin (MenuSeeder is idempotent) ..."
    php artisan db:seed --force
  fi

  php artisan storage:link
  php artisan optimize:clear
  php artisan optimize

  echo "Starting Laravel server ..."
fi

exec docker-php-entrypoint --config /Caddyfile --adapter caddyfile 2>&1
