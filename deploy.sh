#!/bin/bash

docker build -t metatronix-backend:latest .

docker rm -f metatronix-backend 2>/dev/null || true

docker run -d \
  --name metatronix-backend \
  --env-file .env \
  --add-host=host.docker.internal:host-gateway \
  -p 127.0.0.1:5000:5000 \
  --restart unless-stopped \
  metatronix-backend:latest

docker image prune -f