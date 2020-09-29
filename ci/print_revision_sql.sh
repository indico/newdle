#!/bin/bash
# Get all the SQL queries from the first migration file to the last, in order
# and print them with escaped newlines
set -e


migration_file=$1
latest_migration=$2

if [ ! -z ${migration_file} ] && [ ! -z ${latest_migration} ]; then 
    down_revision=$(grep -Po "(?<=^down_revision = ').*(?=')" $migration_file )
    revision=$(grep -Po "(?<=^revision = ').*(?=')" $latest_migration )
    sql_command=$(flask db upgrade --sql ${down_revision}:${revision})
    sql_command="${sql_command//'%'/'%25'}"
    sql_command="${sql_command//$'\n'/'%0A'}"
    sql_command="${sql_command//$'\r'/'%0D'}" 
    echo $sql_command
else 
    exit 0
fi
