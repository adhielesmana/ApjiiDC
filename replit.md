# APJII DC - Data Center Management System

**Last Updated:** January 11, 2026

## Overview
This is a full-stack Next.js 15 + Express.js application for APJII Data Center management. It includes customer, provider, and admin dashboards with authentication, order management, space rental, and more.

## Tech Stack
- **Frontend**: Next.js 15.5.9 with App Router
- **Backend**: Express.js with MongoDB (Mongoose)
- **Language**: TypeScript (frontend), JavaScript (backend)
- **UI Library**: HeroUI components, Tailwind CSS
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS, Framer Motion for animations
- **Charts**: amCharts 5
- **Database**: MongoDB

## Project Structure
```
app/
├── admin/          # Admin dashboard pages
├── api/            # Next.js API routes (proxy to backend)
├── customer/       # Customer-facing pages
├── login/          # Authentication pages
├── oauth-redirect/ # OAuth callback handling
├── provider/       # Provider dashboard pages
├── layout.tsx      # Root layout with providers
└── page.tsx        # Home page (redirects to /customer)

backend/
├── mongoose/       # MongoDB schemas
├── routes/         # Express API routes
├── src/            # Server entry point
└── package.json    # Backend dependencies

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
Both frontend and backend run together using concurrently:
```bash
npm run dev
```
- Frontend: http://localhost:5000
- Backend: http://localhost:3000

### Production
```bash
npm run build    # Installs backend deps + builds Next.js
npm run start    # Runs both services with concurrently
```

## Architecture
- Browser calls Next.js frontend (port 5000)
- Next.js API routes proxy requests to Express backend (port 3000)
- Backend connects to MongoDB for data persistence

## Environment Variables
Required secrets:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `AWS_*` - S3/Object storage credentials
- `OAUTH_*` - OAuth configuration

Development variables:
- `NEXT_PUBLIC_BACKEND_URL=http://localhost:3000/v1`

## Configuration Notes
- Next.js is configured to allow all dev origins for Replit's proxy environment
- Uses `concurrently` to run both frontend and backend
- TypeScript and ESLint errors are ignored during builds
- Images are unoptimized for compatibility
- Uses `--legacy-peer-deps` flag for npm install due to HeroUI peer dependency conflicts

## Deployment
- Target: VM (Reserved Machine)
- Build: `npm run build` (installs backend deps + builds Next.js)
- Run: `npm run start` (runs both services via concurrently)
