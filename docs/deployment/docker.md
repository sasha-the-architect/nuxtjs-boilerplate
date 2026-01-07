# Docker Deployment Guide

Deploy Nuxt.js boilerplate using Docker for consistent environments and easy scaling.

## 📋 Prerequisites

- Docker installed (20.10+)
- Docker Compose installed (1.29+)
- Basic understanding of containerization
- Production server or cloud provider

## 🐳 Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# Copy built application
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxtjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Set environment to production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

# Start application
CMD ["node", ".output/server/index.mjs"]
```

## 🐙 Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nuxtjs-boilerplate
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      - NUXT_HOST=0.0.0.0
      - NUXT_PORT=3000
      - NUXT_PUBLIC_SITE_URL=https://example.com
      - NUXT_PUBLIC_SITE_NAME="Free Stuff on the Internet"
    volumes:
      - ./data:/app/data
    networks:
      - app-network
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:3000/',
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  app-network:
    driver: bridge

volumes:
  data:
    driver: local
```

## 🚀 Build and Run

### Build Docker Image

```bash
# Build using Dockerfile
docker build -t nuxtjs-boilerplate .

# Build using Docker Compose
docker-compose build
```

### Run Container

```bash
# Run using Docker
docker run -d \
  --name nuxtjs-boilerplate \
  -p 3000:3000 \
  -e NUXT_PUBLIC_SITE_URL=https://example.com \
  nuxtjs-boilerplate

# Run using Docker Compose
docker-compose up -d
```

### View Logs

```bash
# View logs for app
docker logs nuxtjs-boilerplate

# Follow logs
docker logs -f nuxtjs-boilerplate

# View logs using Docker Compose
docker-compose logs -f app
```

## 🔧 Configuration

### Environment Variables

#### Using .env File

Create `.env` file in project root:

```env
NUXT_HOST=0.0.0.0
NUXT_PORT=3000
NUXT_PUBLIC_SITE_URL=https://example.com
NUXT_PUBLIC_SITE_NAME="Free Stuff on the Internet"
NUXT_PUBLIC_GA_ID=""
NUXT_PUBLIC_SENTRY_DSN=""
```

Update `docker-compose.yml` to use `.env`:

```yaml
services:
  app:
    env_file:
      - .env
```

#### Using Docker Compose

```yaml
services:
  app:
    environment:
      - NUXT_PUBLIC_SITE_URL=https://example.com
      - NUXT_PUBLIC_SITE_NAME="Free Stuff on the Internet"
```

#### Using Docker Run

```bash
docker run -d \
  --name nuxtjs-boilerplate \
  -p 3000:3000 \
  -e NUXT_PUBLIC_SITE_URL=https://example.com \
  -e NUXT_PUBLIC_SITE_NAME="Free Stuff on the Internet" \
  nuxtjs-boilerplate
```

## 🌐 Production Deployment

### Using Nginx Reverse Proxy

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name example.com;

        client_max_body_size 20M;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location /_nuxt/ {
            proxy_pass http://app;
            proxy_cache_valid 200 365d;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
    }
}
```

Update `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nuxtjs-boilerplate
    restart: unless-stopped
    expose:
      - '3000'
    environment:
      - NUXT_HOST=0.0.0.0
      - NUXT_PORT=3000
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Using Traefik

Create `traefik.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.nuxt.rule=Host(`example.com`)'
      - 'traefik.http.routers.nuxt.entrypoints=websecure'
      - 'traefik.http.routers.nuxt.tls.certresolver=letsencrypt'
    networks:
      - web

networks:
  web:
    external: true
```

## 🔄 Scaling

### Horizontal Scaling

Use Docker Compose for multiple instances:

```yaml
version: '3.8'

services:
  app:
    build: .
    deploy:
      replicas: 3
    environment:
      - NUXT_HOST=0.0.0.0
      - NUXT_PORT=3000
```

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml nuxtjs-boilerplate

# Scale service
docker service scale nuxtjs-boilerplate_app=3
```

### Using Kubernetes

Create `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nuxtjs-boilerplate
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nuxtjs-boilerplate
  template:
    metadata:
      labels:
        app: nuxtjs-boilerplate
    spec:
      containers:
        - name: app
          image: nuxtjs-boilerplate:latest
          ports:
            - containerPort: 3000
          env:
            - name: NUXT_HOST
              value: '0.0.0.0'
            - name: NUXT_PORT
              value: '3000'
---
apiVersion: v1
kind: Service
metadata:
  name: nuxtjs-boilerplate
spec:
  selector:
    app: nuxtjs-boilerplate
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

## 🔒 Security Best Practices

### 1. Use Non-Root User

Dockerfile already uses non-root user:

```dockerfile
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs
USER nuxtjs
```

### 2. Scan Images for Vulnerabilities

```bash
# Scan with Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image nuxtjs-boilerplate

# Scan with Docker Scout
docker scout cves nuxtjs-boilerplate
```

### 3. Limit Container Capabilities

```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### 4. Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 📊 Monitoring and Logging

### Container Health Checks

```yaml
services:
  app:
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:3000/',
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
```

### Export Logs

```bash
# Export logs to file
docker logs nuxtjs-boilerplate > app.log

# Export using Docker Compose
docker-compose logs > app.log
```

## 🛠️ Maintenance

### Update Containers

```bash
# Rebuild image
docker-compose build --no-cache

# Recreate containers
docker-compose up -d --force-recreate
```

### Cleanup Unused Resources

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove all unused resources
docker system prune -a
```

### Backup Data

```bash
# Backup volumes
docker run --rm \
  -v nuxtjs-boilerplate_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz /data
```

## 🐛 Troubleshooting

### Container Won't Start

**Issue**: Container exits immediately

```bash
# Check logs
docker logs nuxtjs-boilerplate

# Check container status
docker ps -a

# Verify port availability
netstat -tulpn | grep 3000
```

**Solution**: Ensure port 3000 is not in use, check environment variables.

### Build Fails

**Issue**: Docker build fails with dependency errors

```bash
# Solution: Clear Docker cache
docker builder prune -a

# Solution: Use multi-stage build (already implemented)
```

### Application Not Accessible

**Issue**: Cannot access application on host

```bash
# Verify container is running
docker ps

# Verify port mapping
docker port nuxtjs-boilerplate

# Test from inside container
docker exec nuxtjs-boilerplate wget -O- http://localhost:3000
```

**Solution**: Check firewall settings, port forwarding, and network configuration.

### Performance Issues

**Issue**: Slow response times

```bash
# Monitor container resources
docker stats nuxtjs-boilerplate

# Solution: Add resource limits
docker-compose up -d --scale app=3
```

## 📈 Optimization Tips

### 1. Use Multi-Stage Builds

Dockerfile already uses multi-stage builds for smaller image size.

### 2. Layer Caching

Order Dockerfile to cache dependencies:

```dockerfile
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

### 3. Minimize Image Size

```dockerfile
# Use alpine images
FROM node:18-alpine

# Clean up after install
RUN npm ci --only=production && npm cache clean --force
```

### 4. Use BuildKit

```bash
export DOCKER_BUILDKIT=1
docker build -t nuxtjs-boilerplate .
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [Nuxt.js on Docker](https://nuxt.com/docs/getting-started/deployment#docker)
- [Docker Security Best Practices](https://snyk.io/blog/10-docker-image-security-best-practices/)

---

**Last Updated**: 2025-01-07
