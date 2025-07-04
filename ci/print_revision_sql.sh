#!/bin/bash
# Get all the SQL queries from the first migration file to the last, in order
# and print them surrounded by a markdown comment for github
set -e

migration_file=$1
latest_migration=$2

if [ ! -z ${migration_file} ] && [ ! -z ${latest_migration} ]; then
    down_revision=$(grep -Po "(?<=^down_revision = ').*(?=')" $migration_file)
    revision=$(grep -Po "(?<=^revision = ').*(?=')" $latest_migration)

    sql_command=$(flask db upgrade --sql ${down_revision}:${revision})
    [ -z "$sql_command" ] && exit 0

    cat << EOF
This PR contains database changes. Before merging it, make sure to apply the migration in production:

\`\`\`sql
${sql_command}
\`\`\`

When reviewing the PR, make sure that the changes will not break the previously deployed
version, i.e. any new column needs to have a \`server_default\` or be nullable.
EOF
else
    exit 0
fi
