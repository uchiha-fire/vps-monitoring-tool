/**
 * Real-world Docker & Docker Compose test fixtures for TDD parser tests
 */

export const SAMPLE_DOCKER_PS_OUTPUT = `
{"Command":"\\"/docker-entrypoint.sh nginx -g 'daemon off;'\\"","CreatedAt":"2026-10-20 12:45:00 +0000 UTC","ID":"a1b2c3d4e5f6","Image":"nginx:alpine","Labels":"com.docker.compose.config-hash=abc,com.docker.compose.container-number=1,com.docker.compose.project=web-proxy,com.docker.compose.service=nginx,com.docker.compose.version=2.27.0","Names":"web-proxy-nginx-1","Ports":"0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, :::80->80/tcp, :::443->443/tcp","Status":"Up 3 days"}
{"Command":"\\"docker-entrypoint.sh postgres\\"","CreatedAt":"2026-10-21 08:30:10 +0000 UTC","ID":"f6e5d4c3b2a1","Image":"postgres:16-alpine","Labels":"com.docker.compose.project=app-db,com.docker.compose.service=postgres","Names":"app-db-postgres-1","Ports":"127.0.0.1:5432->5432/tcp","Status":"Up 2 days (healthy)"}
{"Command":"\\"node dist/index.js\\"","CreatedAt":"2026-10-23 10:15:20 +0000 UTC","ID":"112233445566","Image":"my-node-api:latest","Labels":"com.docker.compose.project=app-db,com.docker.compose.service=api","Names":"app-db-api-1","Ports":"0.0.0.0:3000->3000/tcp","Status":"Up 18 hours (unhealthy)"}
{"Command":"\\"/bin/sh -c 'redis-server'\\"","CreatedAt":"2026-10-18 04:00:00 +0000 UTC","ID":"998877665544","Image":"redis:7-alpine","Labels":"","Names":"standalone-redis","Ports":"6379/tcp","Status":"Exited (0) 5 hours ago"}
{"Command":"\\"/entrypoint.sh\\"","CreatedAt":"2026-10-24 01:00:00 +0000 UTC","ID":"556677889900","Image":"caddy:latest","Labels":"","Names":"standalone-caddy","Ports":"0.0.0.0:8080->80/tcp","Status":"Restarting (1) 20 seconds ago"}
`.trim();

export const SAMPLE_DOCKER_COMPOSE_LS_OUTPUT = JSON.stringify([
  {
    "Name": "web-proxy",
    "Status": "running(1)",
    "ConfigFiles": "/home/ubuntu/web-proxy/docker-compose.yml"
  },
  {
    "Name": "app-db",
    "Status": "running(2)",
    "ConfigFiles": "/home/ubuntu/app-db/docker-compose.yml"
  }
]);

export const SAMPLE_ANSI_LOGS = `
\u001b[32m2026-10-24T03:40:01.123456789Z\u001b[0m [INFO] Server started on port 3000
\u001b[33m2026-10-24T03:40:05.987654321Z\u001b[0m [WARN] High memory consumption detected (82%)
\u001b[31m2026-10-24T03:40:10.555555555Z\u001b[0m [ERROR] Failed to connect to Redis cache at 127.0.0.1:6379
2026-10-24T03:40:15.111111111Z Retrying database handshake in 5 seconds...
`.trim();
