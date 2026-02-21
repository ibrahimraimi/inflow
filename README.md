<a href="https://inflow.ibrahimraimi.com">
  <img alt="A modern, comprehensive analytics platform designed to help you collect, analyze, and understand your website data effortlessly." src="./public/images/banner.png">
</a>

<h3 align="center">Inflow Analytics</h3>

<p align="center">
    A modern, comprehensive analytics platform
    <br />
    Read the documentation <a href="https://inflow.ibrahimraimi.com/docs"><strong>here</strong></a>
</p>

<!-- <p align="center">
  <a href="https://github.com/ibrahimraimi/inflow/actions/workflows/ci.yml">
    <img src="https://github.com/ibrahimraimi/inflow/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/ibrahimraimi/inflow/actions/workflows/docker-build.yml">
    <img src="https://github.com/ibrahimraimi/inflow/actions/workflows/docker-build.yml/badge.svg" alt="Docker Build">
  </a>
</p> -->

<br/>

## Introduction

A modern, comprehensive open-source self-hosted analytics platform designed to help you collect, analyze, and understand your website data effortlessly.

## Tech Stack

- [Next.js](nextjs.org) - Framework
- [TypeScript](typescriptlang.org) - Language
- [Drizzle ORM](https://orm.drizzle.team) - ORM
- [Neon PostgreSQL](https://neon.com/) - Database
- [Better Auth](https://www.better-auth.com) - Authentication
- [Tailwind](https://tailwindcss.com) - Styling
- [Resend](https://resend.com) - Email
- [Biome](https://biomejs.dev) - Linting & Formatting
- [Vercel](https://vercel.com) - Deployment

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (we recommend Neon for easy setup)
- Resend account for email functionality
- Google OAuth credentials (optional, for Google login)

### Installation

Read the installation guide [here](https://inflow.ibrahimraimi.com/docs/developer-guide/getting-started).

## Database Schema

The application uses a PostgreSQL database. Read the schema [here](https://inflow.ibrahimraimi.com/docs/developer-guide/architecture/database).

## Available Scripts

```bash
make help        # Show all available commands
make dev         # Start development server
make ci          # Run CI checks locally (lint, type-check, build)
make docker-up   # Start with Docker
```

## Docker & Deployment

### Running with Docker

1. Build and run with Docker Compose:

```bash
docker compose up --build
```

2. Or use the Makefile:

```bash
make docker-up
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### CI/CD Pipeline

This project includes a complete CI/CD pipeline with GitHub Actions. Read the documentation [here](https://inflow.ibrahimraimi.com/docs/developer-guide/deployment).

## License

AGPL-3.0-only

## Support

For support or questions, please contact the the developer @[ibrahimraimi_](https://x.com/ibrahimraimi).
