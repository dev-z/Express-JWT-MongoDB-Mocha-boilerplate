#!/bin/sh

echo "Waiting for mongo..."

while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done

echo "MongoDB started"
echo "Starting API Server"
npm run start-dev