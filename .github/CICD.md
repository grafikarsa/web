# CI/CD Pipeline

This project uses GitHub Actions for Continuous Integration and Continuous Deployment.

## Workflows

### CI (Continuous Integration)
- **Trigger**: Push to `main`/`develop` branches, Pull Requests
- **Actions**: Install dependencies, ESLint, Build

### CD (Continuous Deployment)
- **Trigger**: Push to `main` branch only
- **Actions**: Build Docker image, Push to Docker Hub, Deploy to production server

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `SSH_HOST` | Production server IP/hostname |
| `SSH_USERNAME` | SSH username for deployment |
| `SSH_PRIVATE_KEY` | SSH private key content |
| `SSH_PORT` | SSH port (optional, default: 22) |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL |

## Manual Deployment

If you need to deploy manually:

```bash
# On production server
cd /opt/grafikarsa/web
docker pull <username>/grafikarsa-web:latest
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## Rollback

To rollback to a previous version:

```bash
# Find the commit SHA of the version you want
docker pull <username>/grafikarsa-web:<commit-sha>

# Update and restart
export IMAGE_TAG=<commit-sha>
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```
