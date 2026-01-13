# Docker Deployment Guide

This directory contains Docker configuration files for deploying the Admin Panel application.

## Directory Structure

```
docker/
├── Dockerfile.client    # Next.js frontend multi-stage build
├── Dockerfile.server    # NestJS backend multi-stage build
├── nginx/
│   ├── nginx.conf       # Nginx reverse proxy configuration
│   └── ssl/             # SSL certificates directory
│       └── .gitkeep
└── README.md            # This file
```

## Quick Start

### Development (without Nginx)

```bash
# From the project root directory
docker-compose up -d postgres server client
```

### Production (with Nginx)

```bash
# From the project root directory
docker-compose --profile with-nginx up -d
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=admin_panel

# Ports
CLIENT_PORT=3000
SERVER_PORT=4000
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Security
CORS_ORIGIN=https://admin.example.com
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Frontend
NEXT_PUBLIC_API_URL=https://api.example.com/api
NEXT_PUBLIC_APP_NAME=Admin Panel
NEXT_PUBLIC_DEFAULT_LOCALE=tr

# Environment
NODE_ENV=production
```

## SSL Certificates

For production deployment with HTTPS:

1. Place your SSL certificates in `docker/nginx/ssl/`:
   - `fullchain.pem` - Certificate chain
   - `privkey.pem` - Private key

2. For Let's Encrypt certificates, you can use certbot:
   ```bash
   certbot certonly --webroot -w /var/www/certbot \
     -d admin.example.com -d api.example.com
   ```

3. For development/testing, generate self-signed certificates:
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout docker/nginx/ssl/privkey.pem \
     -out docker/nginx/ssl/fullchain.pem \
     -subj "/CN=localhost"
   ```

## Subdomain Configuration

The Nginx configuration supports subdomain routing:

- `admin.example.com` → Next.js Frontend (port 3000)
- `api.example.com` → NestJS Backend (port 4000)

Update your DNS records to point both subdomains to your server's IP address.

## Commands

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build client
docker-compose build server
```

### Start Services

```bash
# Start all services (development)
docker-compose up -d

# Start with Nginx (production)
docker-compose --profile with-nginx up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
```

### Database Operations

```bash
# Run Prisma migrations
docker-compose exec server npx prisma migrate deploy

# Seed the database
docker-compose exec server npx prisma db seed

# Open Prisma Studio
docker-compose exec server npx prisma studio
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

## Health Checks

The services include health checks:

- **PostgreSQL**: `pg_isready` command
- **Server**: HTTP GET to `/api/health`
- **Client**: Depends on server health

## Troubleshooting

### Container won't start

1. Check logs: `docker-compose logs <service-name>`
2. Verify environment variables in `.env`
3. Ensure ports are not in use

### Database connection issues

1. Wait for PostgreSQL health check to pass
2. Verify `DATABASE_URL` format
3. Check network connectivity between containers

### Build failures

1. Clear Docker cache: `docker-compose build --no-cache`
2. Remove old images: `docker image prune -a`
3. Check disk space

## Production Checklist

- [ ] Set strong passwords for `POSTGRES_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- [ ] Configure proper `CORS_ORIGIN` for your domain
- [ ] Set up SSL certificates
- [ ] Configure DNS for subdomains
- [ ] Set `NODE_ENV=production`
- [ ] Review and adjust rate limiting settings
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for PostgreSQL volume
