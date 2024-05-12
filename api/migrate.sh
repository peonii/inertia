#!/bin/bash

echo "Checking for connection..."
while ! cqlsh inertia-db -e 'describe cluster'; do
  sleep 5
done

for file in ./migrations/*.cql;
do
  echo "Running migration ${file}"
  cqlsh inertia-db -f "${file}";
done

echo "Successfully ran migrations"
