# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

### Database Operations
- `npm run db:push:local` - Push schema changes to local database
- `npm run db:push:prod` - Push schema changes to production database
- `npm run db:generate:local` - Generate Prisma client for local environment
- `npm run db:generate:prod` - Generate Prisma client for production environment
- `npm run db:seed:local` - Seed local database with initial data
- `npm run db:seed:prod` - Seed production database with initial data
- `npm run db:studio:local` - Open Prisma Studio for local database
- `npm run db:studio:prod` - Open Prisma Studio for production database

### Environment-specific Commands
- `npm run dev:local` - Start development server with local environment
- `npm run build:prod` - Build application for production environment

## Project Architecture

This is a Next.js 15 blog application using the App Router with the following structure:

### Core Technologies

- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript with strict mode enabled
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui with New York style
- **Icons**: Lucide React
- **Linting**: ESLint with Next.js recommended rules
- **Form Validation**: Zod schemas

### Directory Structure

- `src/app/` - App Router pages and layouts
  - `(admin)/` - Admin dashboard routes (protected by authentication)
  - `(blog)/` - Blog public routes
  - `api/` - API routes (RESTful endpoints)
  - `auth/` - Authentication pages (signin, signup)
  - `layout.tsx` - Root layout with font configuration
  - `page.tsx` - Homepage component
  - `globals.css` - Global styles with dark mode support
- `src/components/` - Reusable components
  - `admin/` - Admin dashboard components
  - `blog/` - Blog-specific components
  - `theme/` - Theme provider and toggle components
  - `ui/` - shadcn/ui components
- `src/content/` - MDX content files
  - `pages/` - Static pages
  - `posts/` - Blog posts with metadata
- `src/lib/` - Utility functions
  - `auth.ts` - NextAuth configuration
  - `db.ts` - Prisma client configuration
  - `services/` - Business logic services
  - `utils.ts` - Core utilities
  - `utils/` - Specialized utilities
  - `validations/` - Zod validation schemas
- `src/types/` - TypeScript type definitions
  - `admin/` - Admin-related types
  - `api/` - API response types
  - `blog/` - Blog-related types
- `prisma/` - Database schema and migrations
  - `schema.prisma` - Database schema definition
  - `seed.ts` - Database seeding script
- `public/` - Static assets (SVG icons, etc.)

### Key Configuration

- **TypeScript**: Strict mode enabled, path aliases configured (`@/*` → `./src/*`)
- **Next.js**: Standard configuration with no custom options
- **ESLint**: Extends `next/core-web-vitals` and `next/typescript`
- **PostCSS**: Configured for Tailwind CSS v4
- **shadcn/ui**: New York style with zinc base color and CSS variables
- **Lucide Icons**: Configured as the default icon library
- **Prisma**: Custom output directory `src/generated/prisma`
- **Environment**: Supports local and production environments via `.env.local` and `.env.production`

### Database Architecture

The application uses MySQL with Prisma ORM featuring:

- **Posts**: Blog posts with Markdown content, status management, and SEO support
- **Pages**: Static pages with customizable templates and ordering
- **Tags**: Flexible tagging system with many-to-many relationships
- **Media**: File upload and management with content association
- **Navigation**: Hierarchical navigation system supporting internal and external links
- **Users**: Role-based access control (Admin/Author) with status management

### Authentication System

- **NextAuth.js**: Configured with credentials provider
- **Session Strategy**: JWT-based sessions
- **Login Methods**: Username or email with password
- **User Roles**: ADMIN (full access) and AUTHOR (content management)
- **Protection**: Middleware-based route protection for admin areas

### Styling Approach

- Uses Tailwind CSS v4 with the new PostCSS plugin approach
- Geist font family (Sans and Mono variants) from Google Fonts
- Dark mode support with theme provider and toggle component
- shadcn/ui components with built-in dark mode compatibility
- CSS variables for consistent theming across components

### UI Design Guidelines

- **Component Library**: Use shadcn/ui components for consistent design
- **Icons**: Use Lucide React icons throughout the application
- **Dark Mode**: All UI components must be fully compatible with dark mode
- **Theming**: Utilize the theme provider for consistent dark/light mode switching
- **Styling**: Follow the established shadcn/ui patterns and Tailwind utilities

### Development Notes

- Development server runs on `http://localhost:3000`
- Uses Turbopack for faster development builds
- Prisma client generated in `src/generated/prisma/` directory
- Environment-specific configuration using dotenv-cli
- All database operations require client generation after schema changes
