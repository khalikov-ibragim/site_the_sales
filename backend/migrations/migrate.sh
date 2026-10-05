#!/usr/bin/env bash
# Применение миграций БД.
#
# Зачем: init_db.sql выполняет postgres только на пустом томе
# (/docker-entrypoint-initdb.d отрабатывает один раз). Изменение схемы на уже
# развёрнутой базе через него невозможно — файл молча не применяется.
# Миграции применяют ALTER TABLE к существующей базе и повторяемы: применённые
# версии записываются в schema_migrations и второй раз пропускаются.
#
# Логин и имя базы берутся из env самого контейнера БД (POSTGRES_USER /
# POSTGRES_DB заданы в compose), поэтому вручную передавать их не нужно.
# psql на хосте не нужен — вызов идёт внутрь контейнера, поэтому скрипт работает
# и локально, и на раннере без установки postgresql-client.
#
# Переопределить можно через DB_CONTAINER / DB_USER / DB_NAME.
set -euo pipefail

DB_CONTAINER="${DB_CONTAINER:-site_the_sales_database_1}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

DB_USER="${DB_USER:-$(podman exec "$DB_CONTAINER" sh -c 'printf %s "$POSTGRES_USER"')}"
DB_NAME="${DB_NAME:-$(podman exec "$DB_CONTAINER" sh -c 'printf %s "$POSTGRES_DB"')}"

: "${DB_USER:?не удалось определить пользователя БД}"
: "${DB_NAME:?не удалось определить имя БД}"

# -i обязателен: без него контейнер не читает stdin.
run_sql() {
    podman exec -i "$DB_CONTAINER" \
        psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" "$@"
}

echo "миграции → контейнер $DB_CONTAINER, база $DB_NAME"

run_sql -q -c "CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

for f in "$SCRIPT_DIR"/[0-9]*.sql; do
    version=$(basename "$f" .sql)
    applied=$(run_sql -tAq -c "SELECT 1 FROM schema_migrations WHERE version='$version'")

    if [ "$applied" = "1" ]; then
        echo "  пропускаю (уже применена): $version"
        continue
    fi

    echo "  применяю: $version"
    podman exec -i "$DB_CONTAINER" \
        psql -q -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" < "$f"
    run_sql -q -c "INSERT INTO schema_migrations (version) VALUES ('$version')"
done

echo "готово"