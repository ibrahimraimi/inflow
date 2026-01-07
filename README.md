<a href="https://inflow.com">
  <img alt="A modern, comprehensive analytics platform designed to help you collect, analyze, and understand your website data effortlessly." src="./public/assets/banner.png">
</a>

<h3 align="center">Inflow Analytics</h3>

<p align="center">
    A modern, comprehensive analytics platform
    <br />
    <a href="#introduction"><strong>Introduction</strong></a> •
    <a href="#tech-stack"><strong>Tech Stack</strong></a> •
    <a href="#getting-started"><strong>Getting Started</strong></a>
</p>

<br/>

## Introduction

A modern, comprehensive analytics platform designed to help you collect, analyze, and understand your website data effortlessly.

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

1. Clone the repository:

```bash
git clone https://github.com/ibrahimraimi/inflow.git
cd inflow
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
cp .env.dev .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
EMAIL_SENDER_NAME="Inflow Analytics"
EMAIL_SENDER_ADDRESS="noreply@yourdomain.com"
```

4. Set up the database:

```bash
bun db:generate
```

```bash
bun db:migrate
```

5. Start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a PostgreSQL database with the following main entities:

- **Users**: User accounts with authentication
- **Organizations**: Multi-user organizations with role-based access
- **Members**: Organization members with roles (owner, admin, member)
- **Websites**: Websites being tracked for analytics
- **Sessions**: User authentication sessions
- **Invitations**: Organization membership invitations

## Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run Biome linter
- `bun format` - Format code with Biome
- `bun db:generate` - Generate database migrations
- `bun db:migrate` - Run database migrations
- `bun db:push` - Push schema changes to database
- `bun db:pull` - Pull schema from database

## License

This project is private and proprietary.

## Support

For support or questions, please contact the development team.
