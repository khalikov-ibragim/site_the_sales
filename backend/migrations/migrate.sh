#!/usr/bin/env sh
# Применение миграций БД.
#
# Работает и в docker-compose (локально), и в Kubernetes.
# Подключается к БД напрямую через psql, используя переменные окружения.
#
#
# Миграции идемпотентны: применённые версии записываются в schema_migrations
# и второй раз пропускаются.

set -eu

# Проверяем, что все нужные переменные установлены
: "${DB_HOST:?DB_HOST}"
: "${DB_PORT:=5432}"
: "${DB_USER:?DB_USER}"
: "${DB_PASSWORD:?DB_PASSWORD}"
: "${DB_NAME:?DB_NAME}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export PGPASSWORD="$DB_PASSWORD"

# Функция для выполнения SQL
run_sql() {
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -v ON_ERROR_STOP=1 "$@"
}

echo "миграции → хост $DB_HOST:$DB_PORT, база $DB_NAME"

# Создаём таблицу для отслеживания применённых миграций
run_sql -q -c "CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Применяем миграции в порядке имён файлов (001_, 002_, ...)
for f in "$SCRIPT_DIR"/[0-9]*.sql; do
    [ -e "$f" ] || continue
    version=$(basename "$f" .sql)
    applied=$(run_sql -tAq -c "SELECT 1 FROM schema_migrations WHERE version='$version'")

    if [ "$applied" = "1" ]; then
        echo "  пропускаю (уже применена): $version"
        continue
    fi

    echo "  применяю: $version"
    run_sql -q -f "$f"
    run_sql -q -c "INSERT INTO schema_migrations (version) VALUES ('$version')"
done

echo "готово"