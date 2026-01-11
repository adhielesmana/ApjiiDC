# APJII DC - Data Center Management System

## Overview
This is a Next.js 15 application for APJII Data Center management. It includes customer, provider, and admin dashboards with authentication, order management, space rental, and more.

## Tech Stack
- **Framework**: Next.js 15.5.9 with App Router
- **Language**: TypeScript
- **UI Library**: HeroUI components, Tailwind CSS
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS, Framer Motion for animations
- **Charts**: amCharts 5

## Project Structure
```
app/
├── admin/          # Admin dashboard pages
├── api/            # API routes
├── customer/       # Customer-facing pages
├── login/          # Authentication pages
├── oauth-redirect/ # OAuth callback handling
├── provider/       # Provider dashboard pages
├── layout.tsx      # Root layout with providers
└── page.tsx        # Home page (redirects to /customer)

components/         # Reusable UI components
config/             # Configuration files
hooks/              # Custom React hooks
lib/                # Utility functions
store/              # Redux store configuration
styles/             # Global CSS styles
types/              # TypeScript type definitions
utils/              # Helper utilities
```

## Running the Application

### Development
The app runs on port 5000 in development:
```bash
npm run dev -- -p 5000 -H 0.0.0.0
```

### Production
```bash
npm run build
npm run start -- -p 5000 -H 0.0.0.0
```

## Configuration Notes
- Next.js is configured to allow all dev origins for Replit's proxy environment
- TypeScript and ESLint errors are ignored during builds
- Images are unoptimized for compatibility

## Dependencies
Uses `--legacy-peer-deps` flag for npm install due to HeroUI peer dependency conflicts.
