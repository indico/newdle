#!/bin/bash
# Get the latest migration from the file received as a parameter
# and print it with escaped newlines
set -e;


migration_file=$1

if [ ! -z ${migration_file} ]; then 
    down_revision=$(grep -Po "(?<=^down_revision = ').*(?=')" $migration_file );
    revision=$(grep -Po "(?<=^revision = ').*(?=')" $migration_file );
    sql_command=$(flask db upgrade --sql ${down_revision}:${revision});
    sql_command="${sql_command//'%'/'%25'}"
    sql_command="${sql_command//$'\n'/'%0A'}"
    sql_command="${sql_command//$'\r'/'%0D'}" 
    echo $sql_command;
else 
    exit
fi
