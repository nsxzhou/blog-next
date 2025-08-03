# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 15 blog application using the App Router with the following structure:

### Core Technologies

- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui with New York style
- **Icons**: Lucide React
- **Linting**: ESLint with Next.js recommended rules

### Directory Structure

- `src/app/` - App Router pages and layouts
  - `(admin)/` - Admin dashboard routes
  - `(blog)/` - Blog public routes
  - `api/` - API routes
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
  - `utils.ts` - Core utilities
  - `utils/` - Specialized utilities
  - `validations/` - Validation schemas
- `src/types/` - TypeScript type definitions
  - `admin/` - Admin-related types
  - `api/` - API response types
  - `blog/` - Blog-related types
- `public/` - Static assets (SVG icons, etc.)

### Key Configuration

- **TypeScript**: Strict mode enabled, path aliases configured (`@/*` → `./src/*`)
- **Next.js**: Standard configuration with no custom options
- **ESLint**: Extends `next/core-web-vitals` and `next/typescript`
- **PostCSS**: Configured for Tailwind CSS v4
- **shadcn/ui**: New York style with zinc base color and CSS variables
- **Lucide Icons**: Configured as the default icon library

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
