# CI/CD Setup Guide

This guide explains how to configure the GitHub Actions workflows and secrets for your Inflow Analytics application.

## Overview

The CI/CD pipeline consists of three main workflows:

1. **CI (Continuous Integration)** - Runs on PRs and pushes to main/develop
   - Linting and formatting checks with Biome
   - TypeScript type checking
   - Application build verification

2. **Docker Build & Push** - Runs on pushes to main and tags
   - Builds Docker images for multiple platforms (amd64, arm64)
   - Pushes images to GitHub Container Registry (ghcr.io)
   - Tags images appropriately (latest, semver, branch, sha)

3. **Deploy** - Runs on pushes to main or manually
   - Deploys application to your production server via SSH
   - Performs health checks after deployment

## Required GitHub Secrets

Go to your repository Settings → Secrets and Variables → Actions and add:

### For Deployment (deploy.yml)

- `DEPLOY_HOST` - Your production server hostname or IP
- `DEPLOY_USER` - SSH username for deployment
- `DEPLOY_SSH_KEY` - Private SSH key for authentication
- `DEPLOY_PORT` - SSH port (optional, defaults to 22)
- `DEPLOY_PATH` - Absolute path to your app on the server (e.g., /home/user/inflow)

### Environment Variables

Go to Settings → Environments → Create "production" environment and add:

- `APP_URL` - Your production app URL (e.g., https://inflow.studio21.studio)

## Docker Setup

### Local Development with Docker

1. Build and run locally:

```bash
docker compose up --build
```

2. Access the app at https://inflow.studio21.studio

### Docker Image from GitHub Container Registry

After pushing to main, your Docker image will be available at:

```
ghcr.io/ibrahimraimi/inflow:latest
```

Pull and run:

```bash
docker pull ghcr.io/ibrahimraimi/inflow:latest
docker run -p 3000:3000 --env-file .env.prod ghcr.io/ibrahimraimi/inflow:latest
```

## Production Server Setup

On your production server, you'll need:

1. Docker and Docker Compose installed
2. Your repository cloned at the `DEPLOY_PATH`
3. `.env` or `.env.prod` file with all required environment variables
4. SSH access configured with the deploy key

### Server Preparation

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone your repository
git clone https://github.com/ibrahimraimi/inflow.git
cd inflow

# Create environment file
cp .env.prod .env
# Edit .env with your production values

# Add the deploy SSH key to authorized_keys
echo "<your-deploy-public-key>" >> ~/.ssh/authorized_keys
```

## Workflow Triggers

- **CI**: Automatically runs on pull requests and pushes to main/develop
- **Docker Build**: Automatically runs on pushes to main or version tags
- **Deploy**: Automatically runs on pushes to main, or manually via GitHub Actions UI

## Manual Deployment

To trigger a manual deployment:

1. Go to Actions tab in GitHub
2. Select "Deploy" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

## Troubleshooting

### Build Failures

- Check that all required environment variables are set
- Verify database connection string format
- Ensure Bun version compatibility

### Docker Build Issues

- Verify Dockerfile paths are correct
- Check that .dockerignore is not excluding required files
- Ensure standalone output is enabled in next.config.ts

### Deployment Failures

- Verify SSH connection: `ssh user@host -p port`
- Check that DEPLOY_PATH exists and has proper permissions
- Ensure Docker is running on the server
- Check server logs: `docker compose logs`

## Additional Configuration

### Using Different Container Registries

To use Docker Hub instead of GitHub Container Registry:

1. Add Docker Hub credentials as secrets:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

2. Update docker-build.yml:

```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: <username>/inflow
```

### Custom Deployment Strategies

The deploy.yml workflow uses SSH for simplicity. For production, consider:

- Kubernetes deployments
- Cloud platform integrations (AWS ECS, Google Cloud Run, Azure Container Apps)
- Infrastructure as Code (Terraform, Pulumi)
- GitOps tools (ArgoCD, Flux)

## Security Best Practices

1. Never commit .env files or secrets to the repository
2. Use GitHub environment protection rules for production
3. Rotate SSH keys and secrets regularly
4. Enable branch protection on main branch
5. Require PR reviews before merging
6. Use dependabot for dependency updates
