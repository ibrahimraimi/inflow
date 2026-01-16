# CI/CD Quick Start Guide

## Test Docker Locally

```bash
# Build and run
make docker-up

# View logs
make docker-logs

# Stop
make docker-down
```

## Configure GitHub (One-time Setup)

### 1. Repository Secrets

Go to: `Settings → Secrets and variables → Actions → New repository secret`

Add these secrets:

```
DEPLOY_HOST        = your-server.com
DEPLOY_USER        = ubuntu
DEPLOY_SSH_KEY     = <paste your private key>
DEPLOY_PATH        = /home/ubuntu/inflow
DEPLOY_PORT        = 22 (optional)
```

### 2. Environment Variables

Go to: `Settings → Environments → New environment`

Create environment: `production`

Add variable:

```
APP_URL = https://inflow.studio21.studio
```

### 3. Enable GitHub Container Registry

Go to: `Settings → Actions → General`

Enable: `Read and write permissions`

## What Gets Built

When you push to `main`:

1. **CI Workflow** runs:
   - Lints your code
   - Type checks
   - Builds the app

2. **Docker Build** runs:
   - Builds multi-platform image
   - Pushes to `ghcr.io/ibrahimraimi/inflow:latest`

3. **Deploy** runs (if secrets configured):
   - SSHs to your server
   - Pulls latest code
   - Rebuilds Docker containers
   - Performs health check

## Local CI Testing

Run the same checks that GitHub Actions runs:

```bash
make ci
```

This runs:

- Linting
- Type checking
- Build

## Generate SSH Key for Deployment

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github-deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github-deploy.pub user@your-server.com

# Add private key to GitHub secrets
cat ~/.ssh/github-deploy
# Copy output to DEPLOY_SSH_KEY secret
```

## Server Setup

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone repo
cd /home/ubuntu
git clone https://github.com/ibrahimraimi/inflow.git
cd inflow

# Setup environment
cp .env.prod .env
nano .env  # Edit with production values

# Initial deployment
docker compose up -d
```

## Monitoring

### Check workflow status

```bash
# View in GitHub
https://github.com/ibrahimraimi/inflow/actions
```

### Check Docker logs on server

```bash
ssh user@your-server.com
cd /home/ubuntu/inflow
docker compose logs -f
```

### Check container status

```bash
docker compose ps
```

## Troubleshooting

### CI fails on type check

```bash
# Run locally to see errors
bunx tsc --noEmit
```

### Docker build fails

```bash
# Test build locally
make docker-build
```

### Deployment fails

```bash
# Test SSH connection
ssh -i ~/.ssh/github-deploy user@your-server.com

# Check server logs
ssh user@your-server.com "cd /home/ubuntu/inflow && docker compose logs"
```

### Can't pull Docker image

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull manually
docker pull ghcr.io/ibrahimraimi/inflow:latest
```

## Common Workflows

### Making Changes

```bash
git checkout -b feature/my-feature
# Make changes
git commit -m "feat: add new feature"
git push origin feature/my-feature
# Create PR on GitHub
# CI will run automatically
```

### Deploying to Production

```bash
# Merge PR to main branch
# OR push directly to main
git checkout main
git pull
git merge feature/my-feature
git push origin main
# Deploy workflow runs automatically
```

### Manual Deployment

1. Go to `Actions` tab
2. Click `Deploy` workflow
3. Click `Run workflow`
4. Select `main` branch
5. Click `Run workflow` button

## Additional Resources

- [Full Setup Guide](./.github/SETUP.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Docs](https://docs.docker.com)
